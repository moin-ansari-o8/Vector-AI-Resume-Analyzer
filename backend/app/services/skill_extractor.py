import re


SKILL_ALIASES = {
    "python": [
        "python",
        "python programming",
        "python 3"
    ],

    "java": [
        "java",
        "java programming"
    ],

    "javascript": [
        "javascript",
        "java script",
        "js"
    ],

    "typescript": [
        "typescript",
        "ts"
    ],

    "machine learning": [
        "machine learning",
        "machine-learning",
        "ml"
    ],

    "deep learning": [
        "deep learning",
        "deep-learning",
        "dl"
    ],

    "natural language processing": [
        "natural language processing",
        "nlp"
    ],

    "artificial intelligence": [
        "artificial intelligence",
        "ai"
    ],

    "sql": [
        "sql",
        "structured query language"
    ],

    "html": [
        "html",
        "html5"
    ],

    "css": [
        "css",
        "css3"
    ],

    "react": [
        "react",
        "reactjs",
        "react.js"
    ],

    "node.js": [
        "node.js",
        "nodejs",
        "node js"
    ],

    "fastapi": [
        "fastapi",
        "fast api"
    ],

    "django": [
        "django"
    ],

    "flask": [
        "flask"
    ],

    "tensorflow": [
        "tensorflow"
    ],

    "pytorch": [
        "pytorch",
        "torch"
    ],

    "git": [
        "git",
        "git version control"
    ],

    "github": [
        "github",
        "git hub"
    ],

    "docker": [
        "docker"
    ],

    "mongodb": [
        "mongodb",
        "mongo db"
    ],

    "postgresql": [
        "postgresql",
        "postgres",
        "postgre sql"
    ]
}


def normalize_skill(skill: str) -> str:
    """
    Convert a raw skill name into its canonical name.
    """

    skill = skill.lower().strip()

    for canonical_skill, aliases in SKILL_ALIASES.items():
        if skill in aliases:
            return canonical_skill

    return skill


def extract_normalized_skills(text: str) -> list[str]:
    """
    Extract skills and normalize aliases.
    """

    if not text:
        return []

    found_skills = []

    text_lower = text.lower()

    for canonical_skill, aliases in SKILL_ALIASES.items():

        for alias in aliases:

            pattern = r"\b" + re.escape(alias.lower()) + r"\b"

            if re.search(pattern, text_lower):
                found_skills.append(canonical_skill)
                break

    return list(dict.fromkeys(found_skills))