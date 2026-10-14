from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    message: str
    raw_text: str
    candidateName: Optional[str] = "Candidate"
    role: Optional[str] = "Candidate"
    experienceYears: Optional[float] = 0.0
    skills: Optional[List[str]] = []
    sections: Dict[str, str]
    structured_data: Dict[str, Any]
    uploadedAt: Optional[str] = None
    pdf_url: Optional[str] = None

class ResumeResponse(BaseModel):
    id: str
    filename: str
    candidateName: Optional[str] = "Candidate"
    candidate_name: Optional[str] = "Candidate"
    role: Optional[str] = "Candidate"
    experienceYears: Optional[float] = 0.0
    experience_years: Optional[float] = 0.0
    status: Optional[str] = "ready"
    skills: Optional[List[str]] = []
    raw_text: Optional[str] = ""
    sections: Optional[Dict[str, str]] = {}
    structured_data: Optional[Dict[str, Any]] = {}
    file_path: Optional[str] = None
    uploadedAt: Optional[str] = None
    uploaded_at: Optional[str] = None
    pdf_url: Optional[str] = None

class ResumeUpdateRequest(BaseModel):
    candidateName: Optional[str] = None
    role: Optional[str] = None
    raw_text: Optional[str] = None
    sections: Optional[Dict[str, str]] = None
    skills: Optional[List[str]] = None