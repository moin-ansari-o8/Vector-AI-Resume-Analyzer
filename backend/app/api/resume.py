import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf_parser import extract_text_from_pdf
from app.utils.text_cleaner import clean_resume_text
from app.schemas.resume import ResumeUploadResponse
from app.services.section_detector import detect_sections
from app.services.information_extractor import (
    extract_skills,
    extract_education,
    extract_experience,
    extract_projects,
    extract_certifications
)
from app.services.nlp_extractor import (
    extract_entities,
    extract_experience_years
)
from app.services.skill_extractor import extract_normalized_skills
from app.services.resume_scorer import calculate_resume_score


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


UPLOAD_DIRECTORY = "uploads"


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...)
):

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Create upload directory
    os.makedirs(
        UPLOAD_DIRECTORY,
        exist_ok=True
    )

    # Generate unique filename
    unique_filename = (
        f"{uuid4()}_{file.filename}"
    )

    file_path = os.path.join(
        UPLOAD_DIRECTORY,
        unique_filename
    )

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:
        # Extract text
        raw_text = extract_text_from_pdf(
            file_path
        )

        # Clean text
        cleaned_text = clean_resume_text(
            raw_text
        )
        sections = detect_sections(
            cleaned_text
        )
        entities = extract_entities(cleaned_text)

        experience_years = extract_experience_years(
            sections["experience"]
        )

        structured_data = {
            "personal_information": sections["personal_information"],

            "education": extract_education(
                sections["education"]
            ),

            "skills": extract_skills(
                sections["skills"]
            ),

            "normalized_skills": extract_normalized_skills(
                cleaned_text
            ),

            "experience": extract_experience(
                sections["experience"]
            ),

            "projects": extract_projects(
                sections["projects"]
            ),

            "certifications": extract_certifications(
                sections["certifications"]
            ),

            "entities": entities,

            "experience_years": experience_years
        }
        resume_score = calculate_resume_score(
            structured_data
        )
        structured_data["resume_score"] = resume_score

        if not cleaned_text:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text found in "
                    "the PDF."
                )
            )

        return ResumeUploadResponse(
            filename=file.filename,
            message=(
                "Resume uploaded and text "
                "extracted successfully."
            ),
            raw_text=cleaned_text,
            sections=sections,
            structured_data=structured_data
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )