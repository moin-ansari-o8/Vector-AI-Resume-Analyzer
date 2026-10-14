from app.services.job_matcher import (
    search_jobs_by_question
)
from app.services.llm_service import generate_answer


def build_context(
    question: str,
    resume_text: str,
    resume_skills: list[str],
    resume_experience: float,
    top_k: int = 3
) -> str:

    jobs = search_jobs_by_question(
        question=question,
        top_k=top_k
    )

    context_parts = []

    context_parts.append(
        "CANDIDATE RESUME:\n"
        + resume_text
    )

    context_parts.append(
        "\nCANDIDATE SKILLS:\n"
        + ", ".join(resume_skills)
    )

    context_parts.append(
        "\nCANDIDATE EXPERIENCE:\n"
        + str(resume_experience)
        + " years"
    )

    for index, job in enumerate(jobs, start=1):

        context_parts.append(
            f"""
JOB {index}:
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

    return "\n".join(context_parts)


def answer_career_question(
    question: str,
    resume_text: str,
    resume_skills: list[str],
    resume_experience: float,
    history: list[dict] | None = None
) -> str:

    context = build_context(
        question=question,
        resume_text=resume_text,
        resume_skills=resume_skills,
        resume_experience=resume_experience
    )

    return generate_answer(
        question=question,
        context=context,
        history=history
    )