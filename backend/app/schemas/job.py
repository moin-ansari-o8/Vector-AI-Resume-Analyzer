from typing import List, Optional
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


class JobCreateRequest(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = ""
    location: Optional[str] = ""
    description: Optional[str] = ""
    required_skills: Optional[List[str]] = None
    requiredSkills: Optional[List[str]] = None
    experience_required: Optional[float] = None
    experienceRequired: Optional[float] = None


class JobResponse(BaseModel):
    id: str
    title: str
    role: Optional[str] = None
    company: Optional[str] = ""
    location: Optional[str] = ""
    description: Optional[str] = ""
    required_skills: Optional[List[str]] = []
    requiredSkills: Optional[List[str]] = []
    experience_required: Optional[float] = 0.0
    experienceRequired: Optional[float] = 0.0
    matches_count: Optional[int] = 0
    matchesCount: Optional[int] = 0
    added_at: Optional[str] = None
    addedAt: Optional[str] = None