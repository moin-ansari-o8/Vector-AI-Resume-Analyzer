import re
import spacy


nlp = spacy.load("en_core_web_sm")


def extract_entities(text: str) -> dict:
    """
    Extract named entities from resume text.
    """

    if not text:
        return {
            "persons": [],
            "organizations": [],
            "locations": [],
            "dates": []
        }

    doc = nlp(text)

    persons = []
    organizations = []
    locations = []
    dates = []

    for entity in doc.ents:

        if entity.label_ == "PERSON":
            persons.append(entity.text)

        elif entity.label_ == "ORG":
            organizations.append(entity.text)

        elif entity.label_ in ["GPE", "LOC"]:
            locations.append(entity.text)

        elif entity.label_ == "DATE":
            dates.append(entity.text)

    return {
        "persons": list(dict.fromkeys(persons)),
        "organizations": list(dict.fromkeys(organizations)),
        "locations": list(dict.fromkeys(locations)),
        "dates": list(dict.fromkeys(dates))
    }


def extract_experience_years(text: str) -> float:
    """
    Estimate explicit years of experience mentioned
    in the resume.
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

    return max(values) if values else 0.0