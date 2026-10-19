from typing import List, Optional
from pydantic import BaseModel


class MatchRecordRequest(BaseModel):
    candidateId: Optional[str] = None
    candidate_id: Optional[str] = None
    candidateName: Optional[str] = None
    candidate_name: Optional[str] = None
    jobId: Optional[str] = None
    job_id: Optional[str] = None
    jobTitle: Optional[str] = None
    job_title: Optional[str] = None
    score: int
    matchedSkills: Optional[List[str]] = []
    matched_skills: Optional[List[str]] = []
    missingSkills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    timestamp: Optional[str] = None


class MatchRecordResponse(BaseModel):
    id: str
    candidateId: str
    candidate_id: str
    candidateName: Optional[str] = None
    candidate_name: Optional[str] = None
    jobId: str
    job_id: str
    jobTitle: Optional[str] = None
    job_title: Optional[str] = None
    score: int
    matchedSkills: List[str]
    matched_skills: List[str]
    missingSkills: List[str]
    missing_skills: List[str]
    timestamp: str
