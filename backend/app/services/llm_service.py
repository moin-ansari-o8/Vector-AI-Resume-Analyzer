import os
import re
import json
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

from app.db.database import get_setting, set_setting

OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:latest")
GEMINI_MODELS = [
    os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"),
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest"
]

# Initial load from env or persistent database settings
_saved_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
if not _saved_key:
    try:
        _saved_key = get_setting("gemini_api_key") or ""
    except Exception:
        _saved_key = ""

RUNTIME_CONFIG: Dict[str, Any] = {
    "gemini_api_key": _saved_key,
    "preferred_provider": os.environ.get("AI_PROVIDER", "auto") # "gemini", "ollama", "auto"
}

def set_gemini_api_key(api_key: str):
    cleaned = api_key.strip()
    RUNTIME_CONFIG["gemini_api_key"] = cleaned
    os.environ["GEMINI_API_KEY"] = cleaned
    try:
        set_setting("gemini_api_key", cleaned)
        # Also persist to backend/.env if possible
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        env_file = os.path.join(backend_dir, ".env")
        lines = []
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                lines = [l for l in f.readlines() if not l.startswith("GEMINI_API_KEY=")]
        lines.append(f"GEMINI_API_KEY={cleaned}\n")
        with open(env_file, "w", encoding="utf-8") as f:
            f.writelines(lines)
    except Exception as e:
        print(f"[LLM Service] Warning: Could not persist key to file: {e}")

def get_ai_status() -> Dict[str, Any]:
    current_key = RUNTIME_CONFIG.get("gemini_api_key")
    if not current_key:
        try:
            current_key = get_setting("gemini_api_key") or ""
            if current_key:
                RUNTIME_CONFIG["gemini_api_key"] = current_key
        except Exception:
            pass

    has_gemini = bool(current_key)
    ollama_ok = False
    active_ollama_model = OLLAMA_MODEL
    try:
        r = httpx.get("http://localhost:11434/api/tags", timeout=1.5)
        if r.status_code == 200:
            ollama_ok = True
            models = [m.get("name", "") for m in r.json().get("models", [])]
            for candidate in ["gemma4:latest", "qwen2.5:1.5b", "llama3.2:1b", "llama3.2:latest", "gemma3:latest"]:
                if any(candidate in m for m in models):
                    active_ollama_model = candidate
                    break
    except Exception:
        ollama_ok = False
        
    active = "heuristic"
    if has_gemini and (RUNTIME_CONFIG.get("preferred_provider") in ["gemini", "auto"]):
        active = "gemini"
    elif ollama_ok:
        active = "ollama"
        
    return {
        "gemini_configured": has_gemini,
        "gemini_model": GEMINI_MODELS[0],
        "ollama_available": ollama_ok,
        "ollama_model": active_ollama_model,
        "active_provider": active
    }

def _call_gemini(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    api_key = RUNTIME_CONFIG.get("gemini_api_key")
    if not api_key:
        try:
            api_key = get_setting("gemini_api_key")
            if api_key:
                RUNTIME_CONFIG["gemini_api_key"] = api_key
        except Exception:
            pass
            
    if not api_key:
        return None
        
    contents = []
    if system_instruction:
        contents.append({
            "role": "user",
            "parts": [{"text": f"System Guidelines:\n{system_instruction}\n\nTask:\n{prompt}"}]
        })
    else:
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })
        
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2048,
        }
    }
    
    # Try preferred and fallback models
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            with httpx.Client(timeout=8.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                elif resp.status_code in [429, 503]:
                    print(f"[Gemini API] Model {model_name} returned {resp.status_code} (Quota or high demand). Switching to local/fallback model...")
                    break
                else:
                    print(f"[Gemini API] Model {model_name} returned {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"[Gemini API] Request exception for {model_name}: {e}")
            
    return None


def _call_ollama(prompt: str) -> Optional[str]:
    # Quick probe if Ollama is accessible
    available_models = []
    try:
        probe = httpx.get("http://localhost:11434/api/tags", timeout=1.5)
        if probe.status_code == 200:
            available_models = [m.get("name", "") for m in probe.json().get("models", [])]
    except Exception:
        return None

    if not available_models:
        return None

    # Priority candidates: user preferred (e.g. gemma4:latest), then fast local models
    priority_order = [
        OLLAMA_MODEL,
        "gemma4:latest",
        "qwen2.5:1.5b",
        "llama3.2:1b",
        "llama3.2:latest",
        "gemma3:latest"
    ]
    
    models_to_try = []
    for pref in priority_order:
        for av in available_models:
            if (pref in av or av in pref) and av not in models_to_try:
                models_to_try.append(av)

    if not models_to_try and available_models:
        models_to_try.append(available_models[0])

    for model_name in models_to_try:
        # Give light 1b/1.5b models 10s; give larger models 15s
        timeout_sec = 10.0 if ("1.5b" in model_name or "1b" in model_name) else 15.0
        try:
            r = httpx.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=timeout_sec
            )
            if r.status_code == 200:
                content = r.json().get("message", {}).get("content", "")
                if content and len(content.strip()) > 0:
                    return content
        except Exception as e:
            print(f"[Ollama HTTP] Request timed out or failed for {model_name}: {e}")
            continue
            
    return None


def _is_contact_or_personal_info(text: str) -> bool:
    """Strictly identify personal info, address, university/degree lines, or contact data to prevent corrupting them."""
    t = text.lower().strip()
    if len(t) < 8:
        return True

    # 1. Reference job / database markers
    if any(t.startswith(prefix) for prefix in [
        'job ', 'job:', 'title:', 'company:', 'location:', 'required ',
        'semantic match:', 'job description:', 'reference job', 'role:'
    ]):
        return True
    if 'reference job' in t:
        return True

    # 2. Contact info, social links, websites
    if any(k in t for k in [
        '@', 'http:', 'https:', 'github', 'linkedin', 'phone', 'tel:', 'mobile',
        '+91', '+1', 'portfolio', 'leetcode', 'hackerrank', 'codechef', 'www.'
    ]):
        return True

    # 3. Address markers & Indian/international location indicators
    address_indicators = [
        'address', 'road', 'street', 'st.', 'ave', 'avenue', 'nagar', 'colony',
        'layout', 'sector', 'block', 'flat', 'apartment', 'apt', 'house', 'plot',
        'lane', 'hostel', 'room', 'city', 'state', 'district', 'pin', 'pincode',
        'zip', 'postal', 'vellore', 'tamil nadu', 'chennai', 'bengaluru',
        'bangalore', 'mumbai', 'pune', 'delhi', 'noida', 'gurugram', 'hyderabad',
        'india'
    ]
    if any(k in t for k in address_indicators):
        return True

    # 4. Student, academic degree, university, GPA, graduation dates
    edu_indicators = [
        'student', 'undergrad', 'undergraduate', 'b.tech', 'btech', 'b.e.', 'm.tech', 'mtech',
        'bachelor', 'master', 'degree', 'cgpa', 'gpa', 'percentage', 'higher secondary',
        'cbse', 'icse', 'school', 'college', 'university', 'institute', 'vit', 'vellore institute',
        'srm', 'iit', 'nit', 'bits', 'semester', 'curriculum', 'coursework', 'pursuing',
        'expected graduation', 'batch of', 'academic', 'matrix', 'matriculation'
    ]
    if any(k in t for k in edu_indicators):
        return True

    # 5. Section titles
    if t in [
        'education', 'skills', 'technical skills', 'experience', 'projects',
        'certifications', 'achievements', 'contact', 'personal details', 'profile', 'summary'
    ]:
        return True

    # 6. Digits matching phone numbers or pincodes
    if re.search(r'\b\d{5,12}\b', t):
        return True

    return False


def _is_action_bullet(text: str) -> bool:
    """Identify genuine technical project or experience action bullet points."""
    t = text.lower().strip()
    if _is_contact_or_personal_info(t):
        return False
    if len(t) < 20:
        return False

    # Exclude metadata prefixes
    if t.startswith(('candidate ', 'title:', 'company:', 'job ', 'required', 'location:', 'reference ')):
        return False

    # Exclude any line mentioning degree or student status
    if any(k in t for k in ['student', 'b.tech', 'cgpa', 'university', 'college', 'school', 'institute']):
        return False

    has_marker = text.strip().startswith(('•', '-', '*', '›', '+', '>'))
    action_words = [
        'develop', 'built', 'build', 'implement', 'creat', 'design', 'engineer',
        'maintain', 'manage', 'led', 'spearhead', 'architect', 'automat', 'optimi',
        'train', 'deploy', 'refactor', 'configur', 'work', 'integrat', 'analyz',
        'conduct', 'wrote', 'deliver', 'collaborat', 'model', 'api', 'app', 'system',
        'program', 'react', 'fastapi', 'node', 'python', 'pytorch', 'docker', 'database'
    ]
    has_action = any(w in t for w in action_words)
    return has_marker or has_action


def _check_quick_conversational_response(question: str) -> Optional[str]:
    """Provide immediate, high-quality conversational responses to greetings, identity, and thanks."""
    q = question.lower().strip()

    # 1. Natural Conversational Greetings
    greeting_tokens = [
        "hi", "hello", "hey", "howdy", "sup", "greetings", "good morning",
        "good afternoon", "good evening", "what's up", "yo", "hola", "namaste",
        "hi there", "hey there"
    ]
    is_greeting = any(q == g or q.startswith(g + " ") or q.startswith(g + "!") or q.startswith(g + ",") for g in greeting_tokens)
    if is_greeting and len(q.split()) <= 8:
        return (
            "👋 **Hello! Welcome to Vector AI Career & Resume Assistant.**\n\n"
            "I'm here to analyze your resume, optimize your project and experience bullet points, align your technical skills, and give actionable career guidance.\n\n"
            "Here are a few quick things you can ask me:\n"
            "• *\"How can I improve my project bullet points?\"*\n"
            "• *\"Summarize my strengths and technical areas for improvement.\"*\n"
            "• *\"Where should I place missing skills in my resume?\"*\n"
            "• *\"Generate 3 technical interview questions based on my projects.\"*\n\n"
            "What would you like to focus on today?"
        )

    # 2. Identity & Meta Inquiries ("what are you doing", "who are you", "help", etc.)
    meta_triggers = [
        "what are you doing", "what do you do", "who are you", "what can you do",
        "help", "what is your purpose", "how do you work", "how does this work", "what is this"
    ]
    if any(trigger in q for trigger in meta_triggers) and len(q.split()) <= 8:
        return (
            "🤖 **I am your Vector AI Career & Resume Assistant.**\n\n"
            "I analyze technical resumes and help engineers and Computer Science students stand out to recruiters:\n\n"
            "• **Bullet Point Optimization:** Rewrite passive lines using the **Google XYZ formula** (*Accomplished [X] measured by [Y] by doing [Z]*).\n"
            "• **Skill Gap Analysis:** Identify high-value tools and libraries to weave naturally into your technical projects.\n"
            "• **Student Profile Positioning:** Position your student background with academic and technical rigor without inflating titles or altering personal details.\n"
            "• **One-Click Apply:** In the Improvement Workspace, you can click **✨ Show Suggestions** to view line-by-line enhancements and apply them directly.\n\n"
            "How can I assist you with your resume right now?"
        )

    # 3. Conversational Acknowledgements / Thanks / Farewells
    thanks_triggers = [
        "thanks", "thank you", "thx", "appreciate it", "cool", "awesome",
        "great", "ok", "okay", "got it", "perfect", "good", "nice",
        "bye", "goodbye", "see ya", "cya"
    ]
    if any(q == t or q.startswith(t + " ") or q.startswith(t + "!") or q.startswith(t + ".") for t in thanks_triggers) and len(q.split()) <= 6:
        if any(w in q for w in ["bye", "goodbye", "see ya", "cya"]):
            return (
                "👋 **You're very welcome! Best of luck with your applications!**\n\n"
                "Feel free to return anytime if you want to optimize more bullets, practice interview questions, or prepare for new roles. Have a great day!"
            )
        return (
            "You're welcome! Glad I could help. 😊\n\n"
            "Whenever you're ready, you can:\n"
            "• Ask me to optimize a specific project bullet\n"
            "• Ask for interview prep questions\n"
            "• Click **✨ Show Suggestions** above to view and apply line-by-line enhancements\n\n"
            "What else would you like to review?"
        )

    return None


def generate_answer(
    question: str,
    context: str,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    # 1. Instant check for conversational queries
    quick_resp = _check_quick_conversational_response(question)
    if quick_resp:
        return quick_resp

    history_text = ""
    if history:
        history_text = "\nCONVERSATION HISTORY:\n"
        for msg in history:
            history_text += f'{msg["role"].upper()}: {msg["content"]}\n'

    prompt = f"""You are an elite career coach and resume strategist in VECTOR AI Resume Analyzer.
Analyze the provided candidate resume, context, and conversation history to answer the user's question accurately.

CRITICAL INTEGRITY & ACCURACY RULES:
1. NEVER modify, replace, or alter personal information, name, address, phone number, email, location, or portfolio/social links (GitHub, LinkedIn).
2. CANDIDATE TITLE INTEGRITY: If the candidate is a student (e.g., Computer Science student, undergrad, college student), DO NOT change their title to "Senior", "Lead", or pretend they have 10 years of enterprise experience. Instead, present them accurately as a high-potential Computer Science student / aspiring engineer, highlighting coursework, academic projects, technical proficiencies, algorithmic problem-solving, and hackathons.
3. CONCRETE ADVICE: Target actual project bullets or experience lines found in the candidate resume. Never hallucinate fake companies or fake degrees.
4. ACTIONABLE SUGGESTIONS FORMAT: Whenever proposing a concrete rewrite for a line, always append this tag at the end:
[APPLY_SUGGESTION:Section Name|Exact Original Line From Resume|Enhanced Replacement Line]
Ensure the Exact Original Line exists verbatim in the resume text.
5. CONVERSATIONAL QUERIES: If the user is just saying hello, thanking you, asking what you are doing, or asking how you can help, respond warmly, naturally, and conversationally as their AI career strategist without forcing an unnecessary resume rewrite.

CONTEXT:
{context}

{history_text}

USER QUESTION:
{question}

RESPONSE:"""

    # 2. Try Gemini if configured
    if RUNTIME_CONFIG.get("gemini_api_key"):
        gemini_res = _call_gemini(prompt)
        if gemini_res:
            return gemini_res

    # 3. Try Ollama (local models)
    ollama_res = _call_ollama(prompt)
    if ollama_res:
        return ollama_res

    # 4. Fallback Heuristic Engine
    return _heuristic_chat_answer(question, context)


def generate_structured_suggestions(
    resume_text: str,
    job_title: str,
    job_description: str,
    candidate_skills: List[str],
    missing_skills: List[str],
    sections: Optional[Dict[str, str]] = None
) -> List[Dict[str, str]]:
    """
    Generate precise line-by-line / section-by-section suggestions formatted for the UI.
    Returns: List of {"section": ..., "originalText": ..., "suggestedText": ..., "reasoning": ...}
    """
    prompt = f"""You are a master technical resume editor.
Analyze the candidate's resume against the target role: "{job_title}".

Target Job Description:
{job_description}

Candidate Skills: {", ".join(candidate_skills[:20])}
Missing Skills to address: {", ".join(missing_skills[:10])}

Candidate Resume Text:
{resume_text[:3500]}

STRICT INTEGRITY RULES:
1. NEVER modify or target personal information, candidate name, address, phone, email, location, or GitHub/LinkedIn links.
2. DO NOT change a student's title (e.g. Computer Science student) into "Senior Engineer" or invent years of fake enterprise tenure. Highlight academic projects, core CS fundamentals, algorithms, system design projects, and modern frameworks.
3. Every suggestion MUST target an actual line or bullet point from Projects, Experience, or Skills.
4. "originalText" MUST be an exact verbatim substring from the resume text.
5. "suggestedText" should use active verbs and quantifiable scope without exaggerating candidate background.

Generate 3 to 5 high-impact improvement suggestions.
Format as a valid JSON array of objects:
[
  {{
    "section": "Projects" or "Experience" or "Technical Skills",
    "originalText": "exact line from resume",
    "suggestedText": "improved version",
    "reasoning": "brief explanation"
  }}
]
"""
    raw_response = None
    if RUNTIME_CONFIG.get("gemini_api_key"):
        raw_response = _call_gemini(prompt)
    if not raw_response:
        raw_response = _call_ollama(prompt)

    if raw_response:
        parsed = _parse_suggestions_json(raw_response)
        if parsed and len(parsed) > 0:
            filtered = [s for s in parsed if _filter_suggestion(s)]
            if filtered:
                return filtered

    # Intelligent Heuristic Generator based on actual extracted sections and text
    return _generate_rule_based_suggestions(resume_text, job_title, missing_skills, sections)


def _filter_suggestion(s: Dict[str, str]) -> bool:
    sec = s.get("section", "").lower()
    if any(k in sec for k in ['contact', 'address', 'personal', 'education', 'degree', 'info', 'header']):
        return False
    orig = s.get("originalText", "")
    repl = s.get("suggestedText", "")
    if _is_contact_or_personal_info(orig) or _is_contact_or_personal_info(repl):
        return False
    if any(k in orig.lower() for k in ['student', 'b.tech', 'university', 'college', 'school', 'institute', 'cgpa', 'gpa']):
        return False
    if any(k in repl.lower() for k in ['senior software engineer', '10+ years', '8+ years', 'tech lead', 'staff engineer']):
        return False
    return True


def _parse_suggestions_json(text: str) -> Optional[List[Dict[str, str]]]:
    try:
        clean_text = text.strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(clean_text)
        if isinstance(data, list) and len(data) > 0:
            validated = []
            for item in data:
                if isinstance(item, dict) and "originalText" in item and "suggestedText" in item:
                    validated.append({
                        "section": item.get("section", "Experience"),
                        "originalText": item.get("originalText", ""),
                        "suggestedText": item.get("suggestedText", ""),
                        "reasoning": item.get("reasoning", "Improved clarity and technical impact.")
                    })
            if validated:
                return validated
    except Exception:
        pass

    # Regex extraction fallback for individual JSON objects
    try:
        pattern = r'\{\s*"section"\s*:\s*"(.*?)"\s*,\s*"originalText"\s*:\s*"(.*?)"\s*,\s*"suggestedText"\s*:\s*"(.*?)"\s*,\s*"reasoning"\s*:\s*"(.*?)"\s*\}'
        matches = re.findall(pattern, text, re.DOTALL)
        if matches:
            results = []
            for m in matches:
                results.append({
                    "section": m[0].strip(),
                    "originalText": m[1].strip(),
                    "suggestedText": m[2].strip(),
                    "reasoning": m[3].strip()
                })
            if results:
                return results
    except Exception:
        pass

    return None


def _generate_rule_based_suggestions(
    resume_text: str,
    job_title: str,
    missing_skills: List[str],
    sections: Optional[Dict[str, str]] = None
) -> List[Dict[str, str]]:
    suggestions = []
    
    # Extract only genuine action project bullets
    proj_lines = []
    if sections and "projects" in sections:
        for l in sections["projects"].splitlines():
            c = l.strip().lstrip('•-*›+> ').strip()
            if _is_action_bullet(c):
                proj_lines.append(("Projects", c))

    if not proj_lines and sections and "experience" in sections:
        for l in sections["experience"].splitlines():
            c = l.strip().lstrip('•-*›+> ').strip()
            if _is_action_bullet(c):
                proj_lines.append(("Experience", c))

    if not proj_lines:
        for l in resume_text.splitlines():
            c = l.strip().lstrip('•-*›+> ').strip()
            if _is_action_bullet(c):
                proj_lines.append(("Projects", c))

    # 1. Project Bullet 1 Enhancement
    if proj_lines:
        sec_label, orig_bullet = proj_lines[0]
        clean_orig = orig_bullet.rstrip('.')
        suggested = f"Architected and deployed {clean_orig} — optimized response throughput by 30% and implemented robust automated validation."
        suggestions.append({
            "section": sec_label,
            "originalText": orig_bullet,
            "suggestedText": suggested,
            "reasoning": "Elevated technical impact using the Google XYZ formula: highlighted architectural ownership and quantified performance optimization."
        })

    # 2. Project Bullet 2 Enhancement
    if len(proj_lines) > 1:
        sec_label_2, orig_bullet_2 = proj_lines[1]
        clean_orig_2 = orig_bullet_2.rstrip('.')
        suggested_2 = f"Engineered scalable modular components for {clean_orig_2}; integrated unit tests and automated CI/CD pipeline achieving 90%+ code coverage."
        suggestions.append({
            "section": sec_label_2,
            "originalText": orig_bullet_2,
            "suggestedText": suggested_2,
            "reasoning": "Demonstrates engineering rigor, automated testing standards, and clean maintainable code principles."
        })

    # 3. Technical Skills Section Enhancement
    if missing_skills:
        top_missing = missing_skills[:3]
        skills_text = ", ".join(top_missing)
        suggestions.append({
            "section": "Technical Skills",
            "originalText": f"Target Skills Alignment for {job_title}",
            "suggestedText": f"Core Competencies: Add demonstrated coursework and lab projects in {skills_text}.",
            "reasoning": f"Improves ATS match for {job_title} by highlighting practical competencies without misrepresenting experience level."
        })

    return suggestions


def _heuristic_chat_answer(question: str, context: str) -> str:
    q = question.lower().strip()

    # Extract strictly action-oriented project/experience lines from candidate context
    # Only inspect candidate resume part (ignore any reference jobs)
    resume_part = context.split("--- REFERENCE MARKET")[0] if "--- REFERENCE MARKET" in context else context
    raw_lines = resume_part.splitlines()
    safe_lines = []
    for l in raw_lines:
        c = l.strip().lstrip('•-* ').strip()
        if _is_action_bullet(c):
            safe_lines.append(c)

    is_student = "student" in context.lower() or "undergrad" in context.lower() or "b.tech" in context.lower() or "vit" in context.lower()

    target_bullet = safe_lines[0] if safe_lines else "Architected full-stack web application with modular components and optimized REST APIs."
    second_bullet = safe_lines[1] if len(safe_lines) > 1 else "Implemented backend services, automated validation, and database queries."

    # 1. Interview questions inquiry
    if "interview" in q or "question" in q:
        return (
            "🎯 **Tailored Technical Interview Questions:**\n\n"
            "Based on your resume and projects, here are 3 targeted questions an engineering interviewer is likely to ask:\n\n"
            f"1. **System Design & Implementation:** In your work on *\"{target_bullet[:60]}...\"*, what were the primary architectural trade-offs you evaluated, and how did you handle edge cases or failures?\n"
            f"2. **Performance Optimization:** How did you measure performance bottlenecks, and what tools or metrics (e.g. latency, query time, memory usage) did you use to benchmark your solution?\n"
            "3. **CS Fundamentals:** Can you explain how you designed your data models and state management to ensure consistency and clean modularity?\n\n"
            "Would you like advice on structuring your answers using the **STAR method**?"
        )

    # 2. Red flags / Weakness inquiry
    if "red flag" in q or "weakness" in q or "critique" in q or "mistake" in q:
        return (
            "⚠️ **Resume Diagnostic & Potential Red Flags:**\n\n"
            "Here are the most common areas where technical resumes lose points with recruiters:\n\n"
            "1. **Task-Oriented vs. Outcome-Oriented Bullets:** Many bullets describe *what you were assigned* rather than *what you built and the impact it achieved*.\n"
            f"   > *Current candidate line:* \"{target_bullet}\"\n"
            f"   > *Fix:* Add quantified metrics (e.g., response time, test coverage, dataset size, user throughput).\n\n"
            "2. **Keyword Clumping:** Skills listed only in a \"Skills\" block without being demonstrated inside project bullets may be discounted by hiring managers.\n\n"
            "3. **Title Integrity:** Honest positioning as a high-achieving Computer Science student builds more trust than claiming senior corporate titles.\n\n"
            "Would you like me to rewrite a specific project bullet for you?"
        )

    # 3. Project / Metric / Bullet Optimization
    if "metric" in q or "bullet" in q or "experience" in q or "project" in q or "xyz" in q or "rewrite" in q or "line" in q:
        return (
            f"🔍 **Bullet Point Optimization Diagnosis:**\n\n"
            f"Here is a key project bullet that can be significantly strengthened with measurable impact:\n\n"
            f"> ❌ **Current Line:**\n"
            f"> *\"{target_bullet}\"*\n\n"
            f"**Why to improve:** Recruiters look for the **Google XYZ Formula** (*Accomplished [X] as measured by [Y] by doing [Z]*). This line describes the activity but can highlight technical performance and scale.\n\n"
            f"✅ **Enhanced Technical Version:**\n"
            f"> *\"Engineered {target_bullet.rstrip('.')} — optimizing execution performance by 30% and ensuring robust exception handling.\"*\n\n"
            f"[APPLY_SUGGESTION:Projects|{target_bullet}|Engineered {target_bullet.rstrip('.')} — optimizing execution performance by 30% and ensuring robust exception handling.]"
        )

    # 4. Skill Placement & Missing Skills
    if "where" in q or "missing" in q or "place" in q or "skill" in q:
        return (
            "📍 **Strategic Skill Placement in Your Resume:**\n\n"
            "To maximize ATS scoring while preserving complete honesty:\n\n"
            "1. **Technical Skills Section:**\n"
            "   Add a dedicated category (e.g. `Tools & Frameworks`) listing technologies you have used in coursework, labs, or personal projects.\n\n"
            "2. **Project Context Integration:**\n"
            f"   Weave the relevant tool directly into your project description:\n"
            f"   > ❌ *\"{second_bullet}\"*\n"
            f"   > ✅ *\"Implemented {second_bullet.rstrip('.')} utilizing modern APIs and clean modular architecture.\"*\n\n"
            f"[APPLY_SUGGESTION:Projects|{second_bullet}|Implemented {second_bullet.rstrip('.')} utilizing modern APIs and clean modular architecture.]"
        )

    # 5. Summary / Title
    if "summary" in q or "title" in q:
        if is_student:
            return (
                "💡 **Profile Summary for Computer Science Students:**\n\n"
                "As a Computer Science student, do **not** claim senior enterprise titles. Recruiters value honesty, strong CS fundamentals, and passion for engineering.\n\n"
                "✅ **Recommended Summary:**\n"
                "> *\"Motivated Computer Science Student with solid foundation in data structures, algorithms, and full-stack software development. Proven ability to build end-to-end applications through rigorous academic coursework, open-source contributions, and practical technical projects.\"*\n\n"
                f"[APPLY_SUGGESTION:Professional Summary|{target_bullet}|Motivated Computer Science Student with solid foundation in data structures, algorithms, and full-stack software development. Proven ability to build end-to-end applications through rigorous academic coursework, open-source contributions, and practical technical projects.]"
            )
        else:
            return (
                "💡 **Technical Profile Summary:**\n\n"
                "A high-converting technical summary should focus on: **Core Engineering Focus + Primary Tech Stack + Quantified Project Outcomes**.\n\n"
                "✅ **Recommended Summary:**\n"
                "> *\"Results-focused Software Developer with demonstrated expertise in building responsive applications and scalable backend APIs. Adept at full-cycle development, automated testing, and performance optimization.\"*\n\n"
                f"[APPLY_SUGGESTION:Professional Summary|{target_bullet}|Results-focused Software Developer with demonstrated expertise in building responsive applications and scalable backend APIs. Adept at full-cycle development, automated testing, and performance optimization.]"
            )

    # 6. Summary / Strengths / General Feedback
    if "strength" in q or "review" in q or "how is" in q or "evaluate" in q or "feedback" in q:
        return (
            "📋 **Candidate Profile Review & Key Strengths:**\n\n"
            f"• **Foundations & Academic Rigor:** Your profile indicates strong technical fundamentals{' as a Computer Science student' if is_student else ''}.\n"
            f"• **Project Highlight:** Your work on *\"{target_bullet[:60]}...\"* demonstrates practical development capability.\n"
            "• **Recommended Action:** Enhance each project bullet by highlighting the specific scale, performance gain, or automated testing implemented.\n\n"
            "Ask me to rewrite any specific line, or ask for interview practice questions!"
        )

    # 7. Contextual Default Assistant Answer
    return (
        "Thanks for your question! I'm your AI resume and career assistant.\n\n"
        "I can help you with:\n"
        "• **Rewrite project/experience bullets** — ask me to improve a specific line\n"
        "• **Skill gap analysis** — ask where to place missing skills\n"
        "• **Interview prep** — ask for technical interview questions based on your profile\n"
        "• **Resume review** — ask for strengths, red flags, or ATS tips\n\n"
        "Try clicking **✨ Show Suggestions** for AI-powered line-by-line improvements, or ask me something specific about your resume!"
    )
