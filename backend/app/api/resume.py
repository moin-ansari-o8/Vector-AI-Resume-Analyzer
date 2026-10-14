import os
import shutil
import time
from uuid import uuid4
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.services.pdf_parser import extract_text_from_pdf
from app.utils.text_cleaner import clean_resume_text
from app.schemas.resume import (
    ResumeUploadResponse,
    ResumeResponse,
    ResumeUpdateRequest
)
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
from app.db.database import (
    save_resume,
    get_all_resumes,
    get_resume_by_id,
    update_resume,
    delete_resume
)

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

UPLOAD_DIRECTORY = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "uploads"
)

def _extract_candidate_name(entities: dict, sections: dict, filename: str) -> str:
    # 1. From PERSON entities
    persons = entities.get("persons", [])
    if persons and len(persons[0].strip().split()) <= 4:
        return persons[0].strip()
        
    # 2. From first non-empty line of personal_information
    personal_info = sections.get("personal_information", "")
    if personal_info:
        for line in personal_info.splitlines():
            line = line.strip()
            if line and "@" not in line and not any(char.isdigit() for char in line) and len(line) < 40:
                return line
                
    # 3. Fallback to clean filename
    clean_name = os.path.splitext(filename)[0]
    clean_name = clean_name.replace("_", " ").replace("-", " ")
    return clean_name.title()

def _extract_role(sections: dict, text: str) -> str:
    # Look for common developer / engineer keywords in first 500 characters
    head = text[:600].lower()
    roles = [
        "senior backend engineer", "backend engineer", "full stack engineer",
        "frontend engineer", "software engineer", "devops engineer",
        "machine learning engineer", "data engineer", "data scientist",
        "python developer", "java developer", "react developer",
        "cloud architect", "solutions architect", "product manager"
    ]
    for r in roles:
        if r in head:
            return r.title()
    return "Software Engineer"


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    unique_filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        raw_text = extract_text_from_pdf(file_path)
        cleaned_text = clean_resume_text(raw_text)

        if not cleaned_text:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in the PDF."
            )

        sections = detect_sections(cleaned_text)
        entities = extract_entities(cleaned_text)
        experience_years = extract_experience_years(sections["experience"])
        skills = extract_skills(sections["skills"])
        normalized_skills = extract_normalized_skills(cleaned_text)
        all_skills = list(dict.fromkeys(skills + normalized_skills))

        candidate_name = _extract_candidate_name(entities, sections, file.filename)
        role = _extract_role(sections, cleaned_text)

        structured_data = {
            "personal_information": sections.get("personal_information", ""),
            "education": extract_education(sections.get("education", "")),
            "skills": all_skills,
            "normalized_skills": normalized_skills,
            "experience": extract_experience(sections.get("experience", "")),
            "projects": extract_projects(sections.get("projects", "")),
            "certifications": extract_certifications(sections.get("certifications", "")),
            "entities": entities,
            "experience_years": experience_years
        }

        resume_score = calculate_resume_score(structured_data)
        structured_data["resume_score"] = resume_score

        resume_id = f"res_real_{int(time.time() * 1000)}"
        uploaded_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Persist to SQLite Database
        saved = save_resume({
            "id": resume_id,
            "filename": file.filename,
            "candidate_name": candidate_name,
            "role": role,
            "experience_years": experience_years,
            "status": "ready",
            "skills": all_skills,
            "raw_text": cleaned_text,
            "sections": sections,
            "structured_data": structured_data,
            "file_path": file_path,
            "uploaded_at": uploaded_at
        })

        return ResumeUploadResponse(
            id=resume_id,
            filename=file.filename,
            message="Resume uploaded and processed successfully.",
            raw_text=cleaned_text,
            candidateName=candidate_name,
            role=role,
            experienceYears=experience_years,
            skills=all_skills,
            sections=sections,
            structured_data=structured_data,
            uploadedAt=uploaded_at,
            pdf_url=f"/resume/{resume_id}/pdf"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/", response_model=List[ResumeResponse])
def list_resumes():
    resumes = get_all_resumes()
    for r in resumes:
        r["pdf_url"] = f"/resume/{r['id']}/pdf"
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str):
    resume = get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )
    resume["pdf_url"] = f"/resume/{resume['id']}/pdf"
    return resume


@router.get("/{resume_id}/pdf")
def get_resume_pdf(resume_id: str):
    resume = get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )
    file_path = resume.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="PDF file not found on server"
        )
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=resume.get("filename", "resume.pdf")
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume_data(resume_id: str, request: ResumeUpdateRequest):
    updates = {}
    if request.candidateName is not None:
        updates["candidate_name"] = request.candidateName
    if request.role is not None:
        updates["role"] = request.role
    if request.raw_text is not None:
        updates["raw_text"] = request.raw_text
    if request.sections is not None:
        updates["sections"] = request.sections
    if request.skills is not None:
        updates["skills"] = request.skills

    updated = update_resume(resume_id, updates)
    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )
    updated["pdf_url"] = f"/resume/{updated['id']}/pdf"
    return updated


@router.post("/", response_model=ResumeResponse)
def create_or_sync_resume(resume_in: ResumeResponse):
    data = resume_in.dict()
    saved = save_resume(data)
    saved["pdf_url"] = f"/resume/{saved['id']}/pdf"
    return saved


@router.delete("/{resume_id}")
def delete_single_resume(resume_id: str):
    success = delete_resume(resume_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )
    return {"message": "Resume deleted successfully", "id": resume_id}