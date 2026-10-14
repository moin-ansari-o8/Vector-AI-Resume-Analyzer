import re


SECTION_ALIASES = {
    "personal_information": [
        "personal information",
        "contact",
        "contact information",
        "profile",
        "summary",
        "objective"
    ],
    "education": [
        "education",
        "academic background",
        "academic qualification",
        "educational qualification"
    ],
    "skills": [
        "skills",
        "technical skills",
        "key skills",
        "core skills",
        "skills & abilities"
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history"
    ],
    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "project experience"
    ],
    "certifications": [
        "certifications",
        "certificates",
        "licenses",
        "professional certifications"
    ]
}


def normalize_heading(text: str) -> str:
    """
    Normalize a possible resume section heading.
    """
    text = text.lower().strip()

    # Remove common heading symbols
    text = re.sub(r"[:\-|]+$", "", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def detect_section_heading(line: str):
    """
    Check whether a line represents a known resume section.
    """

    normalized = normalize_heading(line)

    for section, aliases in SECTION_ALIASES.items():
        if normalized in aliases:
            return section

    return None


def detect_sections(text: str) -> dict:
    """
    Divide resume text into recognized sections.
    """

    sections = {
        "personal_information": "",
        "education": "",
        "skills": "",
        "experience": "",
        "projects": "",
        "certifications": ""
    }

    current_section = None

    lines = text.splitlines()

    for line in lines:

        line = line.strip()

        if not line:
            continue

        detected_section = detect_section_heading(line)

        if detected_section:
            current_section = detected_section
            continue

        if current_section:
            sections[current_section] += line + "\n"

    # Remove unnecessary whitespace
    for section in sections:
        sections[section] = sections[section].strip()

    return sections