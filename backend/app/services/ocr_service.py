import os
import pymupdf
from typing import Optional

_reader = None


def get_ocr_reader():
    """
    Lazily initialize the EasyOCR reader instance on CPU with verbose=False.
    """
    global _reader
    if _reader is None:
        import easyocr
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


def extract_text_from_image(file_path: str) -> str:
    """
    Extract readable text content from an image file (PNG, JPG, JPEG) using OCR.
    """
    if not os.path.exists(file_path):
        return ""

    try:
        reader = get_ocr_reader()
        # Extract structured text paragraphs
        results = reader.readtext(file_path, detail=0, paragraph=True)
        if not results:
            # Fallback to individual lines if paragraph grouping found nothing
            results = reader.readtext(file_path, detail=0, paragraph=False)

        extracted = "\n".join(str(item).strip() for item in results if str(item).strip())
        return extracted
    except Exception as error:
        print(f"Error during OCR image text extraction: {error}")
        return ""


def convert_image_to_pdf(image_path: str, output_pdf_path: str) -> str:
    """
    Convert an image (PNG, JPG, JPEG) to a PDF document using PyMuPDF.
    Allows DocumentViewer in the frontend to preview image resumes within an iframe.
    """
    img_doc = pymupdf.open(image_path)
    pdf_bytes = img_doc.convert_to_pdf()
    img_doc.close()

    pdf_doc = pymupdf.open("pdf", pdf_bytes)
    pdf_doc.save(output_pdf_path)
    pdf_doc.close()

    return output_pdf_path
