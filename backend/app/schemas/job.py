from typing import List
from pydantic import BaseModel


class JobProcessRequest(BaseModel):
    title: str
    company: str
    location: str
    description: str


class JobProcessResponse(BaseModel):
    title: str
    company: str
    location: str
    description: str
    required_skills: List[str]
    experience_required: float