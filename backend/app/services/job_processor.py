import re


def extract_job_skills(text: str) -> list[str]:
    """
    Extract common technical skills from a job description.
    """

    if not text:
        return []

    skill_patterns = {
        "python": r"\bpython\b",
        "java": r"\bjava\b",
        "javascript": r"\bjavascript\b|\bjs\b",
        "typescript": r"\btypescript\b",
        "machine learning": r"\bmachine learning\b|\bml\b",
        "deep learning": r"\bdeep learning\b",
        "natural language processing": r"\bnatural language processing\b|\bnlp\b",
        "artificial intelligence": r"\bartificial intelligence\b|\bai\b",
        "sql": r"\bsql\b",
        "html": r"\bhtml\b",
        "css": r"\bcss\b",
        "react": r"\breact\b|\breactjs\b|\breact\.js\b",
        "node.js": r"\bnode\.js\b|\bnodejs\b",
        "fastapi": r"\bfastapi\b",
        "django": r"\bdjango\b",
        "flask": r"\bflask\b",
        "tensorflow": r"\btensorflow\b",
        "pytorch": r"\bpytorch\b",
        "git": r"\bgit\b",
        "github": r"\bgithub\b",
        "docker": r"\bdocker\b",
        "mongodb": r"\bmongodb\b|\bmongo db\b",
        "postgresql": r"\bpostgresql\b|\bpostgres\b",
        "aws": r"\baws\b|\bamazon web services\b",
        "azure": r"\bazure\b",
        "gcp": r"\bgcp\b|\bgoogle cloud\b"
    }

    text_lower = text.lower()

    found_skills = []

    for skill, pattern in skill_patterns.items():

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    return found_skills


def extract_experience_requirement(text: str) -> float:
    """
    Extract the minimum experience requirement from a job description.
    """

    if not text:
        return 0.0

    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+of\s+experience",
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+experience"
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text.lower()
        )

        for match in matches:

            try:
                values.append(float(match))

            except ValueError:
                pass

    return min(values) if values else 0.0


def process_job_description(
    title: str,
    company: str,
    location: str,
    description: str
) -> dict:
    """
    Convert a raw job description into structured data.
    """

    required_skills = extract_job_skills(
        description
    )

    experience_required = extract_experience_requirement(
        description
    )

    return {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "required_skills": required_skills,
        "experience_required": experience_required
    }