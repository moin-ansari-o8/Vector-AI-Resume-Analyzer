import os
import re
import json
from typing import List, Dict, Any, Optional
import httpx

from app.db.database import get_setting, set_setting

OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
GEMINI_MODELS = [
    os.environ.get("GEMINI_MODEL", "gemini-1.5-flash"),
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-pro"
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
    # Check if key is configured
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
    try:
        r = httpx.get("http://localhost:11434/api/tags", timeout=1.5)
        ollama_ok = r.status_code == 200
    except Exception:
        ollama_ok = False
        
    active = "heuristic"
    if has_gemini and (RUNTIME_CONFIG["preferred_provider"] in ["gemini", "auto"]):
        active = "gemini"
    elif ollama_ok:
        active = "ollama"
        
    return {
        "gemini_configured": has_gemini,
        "gemini_model": GEMINI_MODELS[0],
        "ollama_available": ollama_ok,
        "ollama_model": OLLAMA_MODEL,
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
            with httpx.Client(timeout=25.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    print(f"[Gemini API] Model {model_name} returned {resp.status_code}: {resp.text[:150]}")
        except Exception as e:
            print(f"[Gemini API] Request exception for {model_name}: {e}")
            
    return None


def _call_ollama(prompt: str) -> Optional[str]:
    try:
        import ollama
        resp = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return resp.get("message", {}).get("content", "")
    except Exception as e:
        print(f"[Ollama] Error: {e}")
        # Try direct HTTP in case python library has issues
        try:
            r = httpx.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=10.0
            )
            if r.status_code == 200:
                return r.json().get("message", {}).get("content", "")
        except Exception:
            pass
    return None



def generate_answer(
    question: str,
    context: str,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    history_text = ""
    if history:
        history_text = "\nCONVERSATION HISTORY:\n"
        for msg in history:
            history_text += f'{msg["role"].upper()}: {msg["content"]}\n'

    prompt = f"""You are an elite career coach and resume strategist in VECTOR AI Resume Analyzer.
Analyze the provided candidate resume, context, and conversation history to answer the user's question accurately.

RULES:
1. Always base answers on the actual candidate resume provided.
2. When asked about specific lines, sections, or missing skills, give concrete, actionable advice citing exact sections.
3. Keep answers clear, professional, and directly useful.
4. If asked to rewrite a bullet point or section, provide an improved version with metrics and strong action verbs.

CONTEXT:
{context}

{history_text}

USER QUESTION:
{question}

RESPONSE:"""

    # 1. Try Gemini if configured
    if RUNTIME_CONFIG.get("gemini_api_key"):
        gemini_res = _call_gemini(prompt)
        if gemini_res:
            return gemini_res

    # 2. Try Ollama
    ollama_res = _call_ollama(prompt)
    if ollama_res:
        return ollama_res

    # 3. Fallback Heuristic Engine
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

Generate 3 to 5 high-impact, line-by-line improvement suggestions.
Each suggestion MUST target an actual sentence or bullet point found in the candidate's resume.
For each suggestion, provide:
1. The exact section it belongs to (e.g., "Professional Summary", "Experience - [Company]", "Skills")
2. "originalText": the exact line from the resume being replaced.
3. "suggestedText": the enhanced version using quantified impact (%, metrics, scale) and active technical verbs.
4. "reasoning": brief explanation of why this update boosts ATS score and recruiter interest.

CRITICAL: Return ONLY a valid JSON array of objects. Do not wrap in markdown quotes if possible, or use standard ```json.
Format:
[
  {{
    "section": "Professional Summary",
    "originalText": "...",
    "suggestedText": "...",
    "reasoning": "..."
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
            return parsed

    # Intelligent Heuristic Generator based on actual extracted sections and text
    return _generate_rule_based_suggestions(resume_text, job_title, missing_skills, sections)


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
    lines = [l.strip().lstrip('•-* ').strip() for l in resume_text.splitlines() if len(l.strip()) > 20]
    
    # 1. Summary improvement
    summary_lines = []
    if sections and sections.get("personal_information"):
        for l in sections["personal_information"].splitlines():
            cleaned = l.strip().lstrip('•-* ').strip()
            if len(cleaned) > 25 and "@" not in cleaned and "github.com" not in cleaned and "linkedin.com" not in cleaned:
                summary_lines.append(cleaned)
                
    if not summary_lines and lines:
        summary_lines = [lines[0]]
        
    if summary_lines:
        orig = summary_lines[0]
        skill_mention = f" and {', '.join(missing_skills[:2])}" if missing_skills else ""
        suggestions.append({
            "section": "Professional Summary",
            "originalText": orig,
            "suggestedText": f"Results-oriented {job_title or 'Engineer'} with hands-on expertise architecting high-throughput services{skill_mention}, driving 99.9% uptime and leading technical delivery.",
            "reasoning": f"Aligns candidate profile directly with {job_title} title requirements, adds executive presence and quantifiable scope."
        })

    # 2. Experience bullet improvement
    exp_lines = []
    if sections and sections.get("experience"):
        for l in sections["experience"].splitlines():
            cleaned = l.strip().lstrip('•-* ').strip()
            if len(cleaned) > 20 and not any(w in cleaned.lower() for w in ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "present"]):
                exp_lines.append(cleaned)
                
    if not exp_lines:
        exp_lines = [l for l in lines[1:6] if len(l) > 20]

    if exp_lines:
        orig_bullet = exp_lines[0]
        suggestions.append({
            "section": "Experience",
            "originalText": orig_bullet,
            "suggestedText": f"Spearheaded core service engineering: {orig_bullet.rstrip('.')} — reducing response latency by 35% and improving throughput for 50k+ daily operations.",
            "reasoning": "Replaced generic phrasing with high-impact action verb 'Spearheaded' and added quantified latency/throughput metrics."
        })

    # 3. Missing skills integration suggestion
    if missing_skills:
        top_missing = missing_skills[:3]
        suggestions.append({
            "section": "Skills & Technologies",
            "originalText": f"Missing critical keywords: {', '.join(top_missing)}",
            "suggestedText": f"Cloud & Core Technologies: Add verified competencies in {', '.join(top_missing)} backed by production project achievements.",
            "reasoning": f"Critical ATS keyword density optimization: {job_title} positions filter heavily for {', '.join(top_missing)}."
        })

    # 4. Secondary experience or project improvement
    if len(exp_lines) > 1:
        orig_bullet_2 = exp_lines[1]
        suggestions.append({
            "section": "Experience",
            "originalText": orig_bullet_2,
            "suggestedText": f"Architected resilient backend pipeline: {orig_bullet_2.rstrip('.')} while implementing automated CI/CD checks and comprehensive test coverage.",
            "reasoning": "Demonstrates engineering maturity, automated testing discipline, and system reliability."
        })

    return suggestions


def _heuristic_chat_answer(question: str, context: str) -> str:
    q = question.lower()

    # Extract lines from context
    exp_lines = []
    summary_lines = []
    lines = [l.strip().lstrip('•-* ').strip() for l in context.splitlines() if len(l.strip()) > 15]
    
    # Try to find experience lines
    in_exp = False
    in_summary = False
    for line in context.splitlines():
        clean = line.strip().lstrip('•-* ').strip()
        low = clean.lower()
        if "experience" in low and len(clean) < 25:
            in_exp = True
            in_summary = False
            continue
        elif ("skills" in low or "education" in low) and len(clean) < 25:
            in_exp = False
            in_summary = False
            continue
        elif "candidate resume:" in low or "summary" in low:
            in_summary = True
            continue

        if in_exp and len(clean) > 20 and not any(yr in low for yr in ["2020", "2021", "2022", "2023", "2024", "2025", "present"]):
            exp_lines.append(clean)
        elif in_summary and len(clean) > 25 and "@" not in clean:
            summary_lines.append(clean)

    if not exp_lines:
        exp_lines = [l for l in lines if len(l) > 25 and not any(kw in l.lower() for kw in ["candidate", "skills:", "years", "job:"])][:4]

    target_exp_bullet = exp_lines[0] if exp_lines else "Developed and maintained software components."
    second_exp_bullet = exp_lines[1] if len(exp_lines) > 1 else "Worked with backend databases and APIs."
    target_summary = summary_lines[0] if summary_lines else (lines[0] if lines else "Experienced software developer.")

    if "metric" in q or "weak" in q or ("line" in q and "experience" in q):
        return (
            f"🔍 **Line-by-Line Resume Diagnosis:**\n\n"
            f"Looking at your **Experience** section, this specific bullet point needs metric quantification:\n\n"
            f"> ❌ **Current Line:**\n"
            f"> *\"{target_exp_bullet}\"*\n\n"
            f"**Why it's weak:** Recruiters and ATS look for the **Google XYZ Formula** (*Accomplished [X] as measured by [Y] by doing [Z]*). This line states the responsibility without quantifying the business impact or scale.\n\n"
            f"✅ **Recommended Enhanced Version:**\n"
            f"> *\"Spearheaded end-to-end optimization of {target_exp_bullet.rstrip('.')} — cutting processing latency by 35% and elevating system throughput for 100k+ daily requests.\"*\n\n"
            f"[APPLY_SUGGESTION:Experience|{target_exp_bullet}|Spearheaded end-to-end optimization of {target_exp_bullet.rstrip('.')} — cutting processing latency by 35% and elevating system throughput for 100k+ daily requests.]"
        )
    elif "where" in q or "missing" in q or "place" in q:
        return (
            "📍 **Strategic Skill Placement in Your Resume:**\n\n"
            "To maximize ATS scoring for your target role without keyword stuffing, place missing competencies in two distinct locations:\n\n"
            "1. **Core Skills Section:**\n"
            "   Add a focused category (e.g. `Cloud & DevOps: Docker, Kubernetes, AWS, CI/CD pipelines`).\n\n"
            "2. **Experience Bullet Integration:**\n"
            f"   Weave the tool directly into this line of your Experience:\n"
            f"   > ❌ *\"{second_exp_bullet}\"*\n"
            f"   > ✅ *\"Architected containerized microservices utilizing Docker and AWS to {second_exp_bullet.rstrip('.')} — slashing deployment cycles by 40%.\"*\n\n"
            f"[APPLY_SUGGESTION:Experience|{second_exp_bullet}|Architected containerized microservices utilizing Docker and AWS to {second_exp_bullet.rstrip('.')} — slashing deployment cycles by 40%.]"
        )
    elif "summary" in q or "rewrite" in q:
        return (
            "💡 **Professional Summary Optimization:**\n\n"
            f"Your current summary line:\n"
            f"> ❌ *\"{target_summary}\"*\n\n"
            "A high-converting tech summary should follow: **Target Role + Scale + Core Tech Stack + Quantified Impact**.\n\n"
            "✅ **Optimized Rewrite:**\n"
            f"> *\"Results-driven Software Engineering Professional with proven track record in architecting high-throughput distributed systems and scalable APIs. Demonstrated success reducing system latency by 35% and ensuring 99.9% uptime across production microservices.\"*\n\n"
            f"[APPLY_SUGGESTION:Professional Summary|{target_summary}|Results-driven Software Engineering Professional with proven track record in architecting high-throughput distributed systems and scalable APIs. Demonstrated success reducing system latency by 35% and ensuring 99.9% uptime across production microservices.]"
        )
    elif "ats" in q or "score" in q:
        return (
            "🛡️ **ATS Keyword & Formatting Audit:**\n\n"
            "1. **Formatting:** Avoid multi-column tables, text boxes, and complex graphics that ATS parsers cannot read.\n"
            "2. **Heading Standardization:** Keep conventional headers (*Summary*, *Experience*, *Skills*, *Education*).\n"
            "3. **Action Verbs:** Replace passive verbs (*Assisted*, *Helped*, *Worked on*) with executive verbs (*Architected*, *Spearheaded*, *Engineered*, *Overhauled*)."
        )
    else:
        return (
            f"Based on your resume analysis:\n\n"
            f"• **Experience Impact:** In bullet *\"{target_exp_bullet[:80]}...\"*, replace passive language with strong action verbs and metric outcomes (e.g., latency reduction, throughput, scale).\n"
            f"• **ATS Keyword Placement:** Ensure all target technologies appear in both your **Core Skills** and in the context of projects or past roles.\n"
            f"• Check the **AI Suggestions** tab on the right to review and accept line-by-line updates with 1 click."
        )