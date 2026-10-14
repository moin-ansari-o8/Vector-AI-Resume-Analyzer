import re


def extract_skills(text: str) -> list[str]:
    """
    Extract skills from the resume skills section.
    """

    if not text:
        return []

    skills = []

    # Split common separators
    parts = re.split(r"[,;\n|•]+", text)

    for part in parts:
        skill = part.strip()

        if not skill:
            continue

        # Ignore very long sentences
        if len(skill) > 60:
            continue

        skills.append(skill)

    # Remove duplicates while preserving order
    return list(dict.fromkeys(skills))


def extract_education(text: str) -> list[str]:
    """
    Extract education entries from the education section.
    """

    if not text:
        return []

    entries = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        entries.append(line)

    return entries


def extract_experience(text: str) -> list[str]:
    """
    Extract experience entries from the experience section.
    """

    if not text:
        return []

    entries = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        entries.append(line)

    return entries


def extract_projects(text: str) -> list[str]:
    """
    Extract project entries.
    """

    if not text:
        return []

    entries = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        entries.append(line)

    return entries


def extract_certifications(text: str) -> list[str]:
    """
    Extract certification entries.
    """

    if not text:
        return []

    entries = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        entries.append(line)

    return entries