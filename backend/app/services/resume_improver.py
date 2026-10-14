from typing import List, Dict, Any, Optional
from app.services.llm_service import (
    generate_answer,
    generate_structured_suggestions
)

def generate_resume_improvements(
    resume_text: str,
    job_title: str,
    job_description: str,
    candidate_skills: list[str],
    missing_skills: list[str],
    sections: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    # Generate structured suggestions for the UI cards
    structured = generate_structured_suggestions(
        resume_text=resume_text,
        job_title=job_title,
        job_description=job_description,
        candidate_skills=candidate_skills,
        missing_skills=missing_skills,
        sections=sections
    )

    # Context for overview answer
    context = f"""
CANDIDATE RESUME:
{resume_text[:2000]}

CANDIDATE SKILLS:
{", ".join(candidate_skills)}

TARGET JOB:
{job_title}

JOB DESCRIPTION:
{job_description}

MISSING SKILLS:
{", ".join(missing_skills)}
"""

    question = f"""
Analyze this resume against the target role: {job_title}.
Provide concise overview guidance on key ATS improvements and how to position the missing skills ({", ".join(missing_skills[:5])}).
"""

    summary_guidance = generate_answer(
        question=question,
        context=context
    )

    return {
        "job_title": job_title,
        "suggestions": structured,
        "summary_guidance": summary_guidance
    }