import re
from app.services.job_matcher import (
    search_jobs_by_question
)
from app.services.llm_service import generate_answer


def is_job_intent(question: str) -> bool:
    # Strip any synthetic [target role: ...] prefix before checking user intent
    clean_q = re.sub(r'\[target role:[^\]]*\]', '', question, flags=re.IGNORECASE).strip().lower()
    
    # Strictly check for actual job browsing/search intents
    job_search_triggers = [
        "find jobs", "job opening", "job openings", "jobs for me", "companies hiring",
        "which jobs", "search jobs", "recommended jobs", "market vacancies",
        "what positions", "available jobs", "apply to jobs", "who is hiring",
        "job postings", "market jobs", "job vacancy", "open roles"
    ]
    return any(k in clean_q for k in job_search_triggers)


def build_context(
    question: str,
    resume_text: str,
    resume_skills: list[str],
    resume_experience: float,
    target_job: str | None = None,
    top_k: int = 3
) -> str:
    context_parts = []

    if target_job:
        context_parts.append(f"CANDIDATE TARGET CAREER ROLE:\n{target_job}\n")

    context_parts.append(
        "=== CANDIDATE RESUME ===\n"
        + resume_text
    )

    if resume_skills:
        context_parts.append(
            "\nCANDIDATE SKILLS:\n"
            + ", ".join(resume_skills)
        )

    context_parts.append(
        "\nCANDIDATE EXPERIENCE:\n"
        + str(resume_experience)
        + " years"
    )

    # Only run semantic job search if the question specifically asks about jobs/market openings
    if is_job_intent(question):
        try:
            jobs = search_jobs_by_question(
                question=question,
                top_k=top_k
            )
            if jobs:
                context_parts.append("\n--- REFERENCE MARKET JOB OPENINGS (DO NOT CONFUSE WITH CANDIDATE PROFILE) ---")
                for index, job in enumerate(jobs, start=1):
                    context_parts.append(
                        f"""
REFERENCE JOB {index}:
Title: {job.get("title", "")}
Company: {job.get("company", "")}
Location: {job.get("location", "")}
Required Skills: {", ".join(job.get("required_skills", []))}
Required Experience: {job.get("experience_required", 0)} years
Semantic Match: {job.get("similarity_score", 0)}%
Job Description:
{job.get("job_text", "")}
"""
                    )
        except Exception as e:
            print(f"[RAG] Job search bypassed: {e}")

    return "\n".join(context_parts)


def answer_career_question(
    question: str,
    resume_text: str,
    resume_skills: list[str],
    resume_experience: float,
    history: list[dict] | None = None,
    target_job: str | None = None
) -> str:

    context = build_context(
        question=question,
        resume_text=resume_text,
        resume_skills=resume_skills,
        resume_experience=resume_experience,
        target_job=target_job
    )

    return generate_answer(
        question=question,
        context=context,
        history=history
    )