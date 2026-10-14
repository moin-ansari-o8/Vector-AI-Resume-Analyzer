from app.services.skill_gap import calculate_skill_gap


def generate_job_explanation(
    candidate_skills: list[str],
    candidate_experience: float,
    job: dict
) -> dict:

    required_skills = job.get(
        "required_skills",
        []
    )

    skill_gap = calculate_skill_gap(
        candidate_skills=candidate_skills,
        required_skills=required_skills
    )

    required_experience = job.get(
        "experience_required",
        0
    )

    if candidate_experience >= required_experience:
        experience_status = "meets_requirement"
    else:
        experience_status = "below_requirement"

    return {
        "job_id": job.get("job_id"),
        "title": job.get("title", ""),
        "company": job.get("company", ""),
        "semantic_score": job.get(
            "similarity_score",
            0
        ),
        "skill_match_percentage": skill_gap[
            "skill_match_percentage"
        ],
        "matched_skills": skill_gap[
            "matched_skills"
        ],
        "missing_skills": skill_gap[
            "missing_skills"
        ],
        "candidate_experience": candidate_experience,
        "required_experience": required_experience,
        "experience_status": experience_status,
        "final_score": job.get(
            "final_score",
            0
        )
    }