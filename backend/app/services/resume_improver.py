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
    # Generate structured suggestions for the UI
    structured = generate_structured_suggestions(
        resume_text=resume_text,
        job_title=job_title,
        job_description=job_description,
        candidate_skills=candidate_skills,
        missing_skills=missing_skills,
        sections=sections
    )

    # Provide clear summary guidance based on candidate role and suggestions
    is_student = "student" in resume_text.lower() or "undergrad" in resume_text.lower()
    if is_student:
        summary_guidance = (
            f"As a student targeting {job_title}, focus on highlighting practical projects, "
            f"computational depth, and algorithmic problem-solving. Review the {len(structured)} "
            f"targeted suggestions below to enhance your bullet points with measurable impact."
        )
    else:
        summary_guidance = (
            f"Targeting {job_title}: Align your technical achievements with quantifiable scale, "
            f"strong action verbs, and clear ATS keyword positioning across your projects and experience."
        )

    return {
        "job_title": job_title,
        "suggestions": structured,
        "summary_guidance": summary_guidance
    }