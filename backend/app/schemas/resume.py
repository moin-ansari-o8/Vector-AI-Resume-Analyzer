from typing import Dict, List, Any

from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    filename: str
    message: str
    raw_text: str
    sections: Dict[str, str]
    structured_data: Dict[str, Any]