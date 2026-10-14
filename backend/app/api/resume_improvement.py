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
    job_title: str
    job_description: str
    candidate_skills: list[str]
    missing_skills: list[str]


@router.post("/improve")
def improve_resume(
    request: ResumeImprovementRequest
):

    suggestions = generate_resume_improvements(
        resume_text=request.resume_text,
        job_title=request.job_title,
        job_description=request.job_description,
        candidate_skills=request.candidate_skills,
        missing_skills=request.missing_skills
    )

    return {
        "job_title": request.job_title,
        "suggestions": suggestions
    }