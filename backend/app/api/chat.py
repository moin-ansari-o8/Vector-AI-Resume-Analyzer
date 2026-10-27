from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import (
    answer_career_question
)
from app.services.chat_memory import (
    add_message,
    get_history,
    clear_history
)
from app.services.llm_service import (
    get_ai_status,
    set_gemini_api_key
)

router = APIRouter(
    prefix="/chat",
    tags=["Career Assistant"]
)

class CareerChatRequest(BaseModel):
    session_id: str
    question: str
    resume_text: str
    resume_skills: Optional[List[str]] = []
    resume_experience: Optional[float] = 0.0
    target_job: Optional[str] = None

class ConfigRequest(BaseModel):
    gemini_api_key: str

@router.get("/status")
def chat_status():
    return get_ai_status()

@router.post("/config")
def update_config(config: ConfigRequest):
    set_gemini_api_key(config.gemini_api_key)
    return {"message": "AI configuration updated successfully", "status": get_ai_status()}

@router.post("/career")
def career_chat(
    request: CareerChatRequest
):
    history = get_history(request.session_id)

    add_message(
        session_id=request.session_id,
        role="user",
        content=request.question
    )

    answer = answer_career_question(
        question=request.question,
        resume_text=request.resume_text,
        resume_skills=request.resume_skills or [],
        resume_experience=float(request.resume_experience or 0.0),
        history=history,
        target_job=request.target_job
    )

    add_message(
        session_id=request.session_id,
        role="assistant",
        content=answer
    )

    return {
        "session_id": request.session_id,
        "question": request.question,
        "answer": answer
    }

@router.delete("/career/{session_id}")
def delete_chat_history(
    session_id: str
):
    clear_history(session_id)
    return {
        "message": "Conversation history cleared.",
        "session_id": session_id
    }