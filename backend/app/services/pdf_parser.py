import fitz


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF using PyMuPDF.
    """

    document = fitz.open(file_path)

    extracted_text = []

    for page in document:
        text = page.get_text("text")

        if text:
            extracted_text.append(text)

    document.close()

    return "\n".join(extracted_text)