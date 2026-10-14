from app.services.llm_service import generate_answer


def generate_resume_improvements(
    resume_text: str,
    job_title: str,
    job_description: str,
    candidate_skills: list[str],
    missing_skills: list[str]
) -> str:

    context = f"""
CANDIDATE RESUME:
{resume_text}

CANDIDATE SKILLS:
{", ".join(candidate_skills)}

TARGET JOB:
{job_title}

JOB DESCRIPTION:
{job_description}

MISSING SKILLS:
{", ".join(missing_skills)}
"""

    question = """
Analyze this resume against the target job.

Provide practical resume improvement suggestions.

Focus on:
1. Missing job-relevant skills.
2. Weak or unclear resume sections.
3. Skills that are present but not clearly demonstrated.
4. Projects or experience that could be described more effectively.
5. ATS-friendly improvements.
6. Keywords from the job description that genuinely match the candidate's existing background.

IMPORTANT:
Never invent skills, experience, projects, certifications,
achievements, job titles, or qualifications.

If a missing skill is not actually present in the resume,
recommend learning it rather than pretending the candidate has it.

Return the suggestions in clear sections.
"""

    return generate_answer(
        question=question,
        context=context
    )