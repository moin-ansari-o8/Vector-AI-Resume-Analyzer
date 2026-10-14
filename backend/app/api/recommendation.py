from fastapi import APIRouter
from pydantic import BaseModel

from app.services.job_matcher import match_resume_to_jobs
from app.services.job_recommender import recommend_jobs


router = APIRouter(
    prefix="/recommendations",
    tags=["Job Recommendations"]
)


class ResumeRecommendationRequest(BaseModel):
    resume_text: str
    resume_skills: list[str]
    resume_experience: float
    top_k: int = 5


@router.post("/resume")
def get_resume_recommendations(
    request: ResumeRecommendationRequest
):

    matched_jobs = match_resume_to_jobs(
        resume_text=request.resume_text,
        top_k=request.top_k
    )

    recommendations = recommend_jobs(
        resume_skills=request.resume_skills,
        resume_experience=request.resume_experience,
        jobs=matched_jobs
    )

    return {
        "recommendations": recommendations
    }