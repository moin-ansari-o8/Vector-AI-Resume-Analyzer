import re


def clean_resume_text(text: str) -> str:
    """
    Clean extracted resume text while preserving
    the overall structure and line breaks.
    """

    # Remove carriage returns
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove leading/trailing spaces
    text = "\n".join(
        line.strip()
        for line in text.split("\n")
    )

    return text.strip()