from fastapi import APIRouter
from pydantic import BaseModel
from app.services.skill_gap import calculate_skill_gap

router = APIRouter(
    prefix="/skill-gap",
    tags=["Skill Gap Analysis"]
)


class SkillGapRequest(BaseModel):
    candidate_skills: list[str]
    required_skills: list[str]


@router.post("/analyze")
def analyze_skill_gap(request: SkillGapRequest):

    result = calculate_skill_gap(
        candidate_skills=request.candidate_skills,
        required_skills=request.required_skills
    )

    return result