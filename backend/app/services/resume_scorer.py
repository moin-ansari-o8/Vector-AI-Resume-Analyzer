def calculate_resume_score(structured_data: dict) -> dict:
    """
    Calculate an overall resume score based on
    the information extracted from the resume.
    """

    score = 0
    breakdown = {}

    # -------------------------
    # Skills
    # -------------------------
    skills = structured_data.get("normalized_skills", [])

    if skills:
        skill_score = min(len(skills) * 5, 25)
    else:
        skill_score = 0

    breakdown["skills"] = skill_score
    score += skill_score

    # -------------------------
    # Experience
    # -------------------------
    experience_years = structured_data.get(
        "experience_years", 0
    )

    if experience_years >= 5:
        experience_score = 25
    elif experience_years >= 3:
        experience_score = 20
    elif experience_years >= 1:
        experience_score = 15
    elif structured_data.get("experience"):
        experience_score = 10
    else:
        experience_score = 0

    breakdown["experience"] = experience_score
    score += experience_score

    # -------------------------
    # Education
    # -------------------------
    education = structured_data.get("education", [])

    if education:
        education_score = 15
    else:
        education_score = 0

    breakdown["education"] = education_score
    score += education_score

    # -------------------------
    # Projects
    # -------------------------
    projects = structured_data.get("projects", [])

    if len(projects) >= 3:
        project_score = 15
    elif len(projects) >= 1:
        project_score = 10
    else:
        project_score = 0

    breakdown["projects"] = project_score
    score += project_score

    # -------------------------
    # Certifications
    # -------------------------
    certifications = structured_data.get(
        "certifications", []
    )

    if certifications:
        certification_score = 10
    else:
        certification_score = 0

    breakdown["certifications"] = certification_score
    score += certification_score

    # -------------------------
    # Final score
    # -------------------------
    return {
        "overall_score": min(score, 100),
        "breakdown": breakdown
    }