from fastapi import APIRouter
from pydantic import BaseModel

from app.services.job_matcher import (
    match_resume_to_jobs
)


router = APIRouter(
    prefix="/matching",
    tags=["Job Matching"]
)


class ResumeMatchingRequest(BaseModel):
    resume_text: str
    top_k: int = 5


@router.post("/resume-jobs")
def match_resume_with_jobs(
    request: ResumeMatchingRequest
):

    matches = match_resume_to_jobs(
        resume_text=request.resume_text,
        top_k=request.top_k
    )

    return {
        "matches": matches
    }