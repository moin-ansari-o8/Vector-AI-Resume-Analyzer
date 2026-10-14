from fastapi import APIRouter
from pydantic import BaseModel

from app.services.explainability import (
    generate_job_explanation
)


router = APIRouter(
    prefix="/explain",
    tags=["Recommendation Explainability"]
)


class ExplainabilityRequest(BaseModel):
    candidate_skills: list[str]
    candidate_experience: float
    job: dict


@router.post("/job")
def explain_job(
    request: ExplainabilityRequest
):

    explanation = generate_job_explanation(
        candidate_skills=request.candidate_skills,
        candidate_experience=request.candidate_experience,
        job=request.job
    )

    return explanation