from typing import List, Dict, Optional, Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.resume_improver import (
    generate_resume_improvements
)

router = APIRouter(
    prefix="/resume",
    tags=["Resume Improvement"]
)

class ResumeImprovementRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = "Software Engineer"
    job_description: Optional[str] = ""
    candidate_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    sections: Optional[Dict[str, str]] = None

@router.post("/improve")
def improve_resume(
    request: ResumeImprovementRequest
):
    result = generate_resume_improvements(
        resume_text=request.resume_text,
        job_title=request.job_title or "Software Engineer",
        job_description=request.job_description or "General Software Engineering Position",
        candidate_skills=request.candidate_skills or [],
        missing_skills=request.missing_skills or [],
        sections=request.sections
    )

    return result