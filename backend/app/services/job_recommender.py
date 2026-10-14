from app.services.skill_gap import calculate_skill_gap


def calculate_experience_match(
    candidate_experience: float,
    required_experience: float
) -> float:

    if required_experience <= 0:
        return 100.0

    if candidate_experience >= required_experience:
        return 100.0

    if candidate_experience <= 0:
        return 0.0

    return round(
        (candidate_experience / required_experience) * 100,
        2
    )


def calculate_final_score(
    semantic_score: float,
    skill_match: float,
    experience_match: float
) -> float:

    final_score = (
        semantic_score * 0.50
        + skill_match * 0.35
        + experience_match * 0.15
    )

    return round(final_score, 2)


def recommend_jobs(
    resume_skills: list[str],
    resume_experience: float,
    jobs: list[dict]
) -> list[dict]:

    recommendations = []

    for job in jobs:

        skill_gap = calculate_skill_gap(
            candidate_skills=resume_skills,
            required_skills=job.get("required_skills", [])
        )

        skill_match = skill_gap["skill_match_percentage"]

        experience_match = calculate_experience_match(
            candidate_experience=resume_experience,
            required_experience=job.get(
                "experience_required",
                0
            )
        )

        semantic_score = job.get(
            "similarity_score",
            0
        )

        final_score = calculate_final_score(
            semantic_score=semantic_score,
            skill_match=skill_match,
            experience_match=experience_match
        )

        recommendations.append({
            "job_id": job.get("job_id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "semantic_score": semantic_score,
            "skill_match": skill_match,
            "experience_match": experience_match,
            "final_score": final_score,
            "matched_skills": skill_gap["matched_skills"],
            "missing_skills": skill_gap["missing_skills"]
        })

    recommendations.sort(
        key=lambda x: x["final_score"],
        reverse=True
    )

    return recommendations