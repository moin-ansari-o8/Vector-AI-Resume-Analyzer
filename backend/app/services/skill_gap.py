def calculate_skill_gap(
    candidate_skills: list[str],
    required_skills: list[str]
) -> dict:

    candidate_set = {
        skill.lower().strip()
        for skill in candidate_skills
        if skill
    }

    required_set = {
        skill.lower().strip()
        for skill in required_skills
        if skill
    }

    matched_skills = sorted(candidate_set.intersection(required_set))
    missing_skills = sorted(required_set - candidate_set)

    if required_set:
        match_percentage = (
            len(matched_skills) / len(required_set)
        ) * 100
    else:
        match_percentage = 0.0

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skill_match_percentage": round(match_percentage, 2)
    }