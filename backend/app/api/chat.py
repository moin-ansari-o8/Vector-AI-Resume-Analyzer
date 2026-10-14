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


router = APIRouter(
    prefix="/chat",
    tags=["Career Assistant"]
)


class CareerChatRequest(BaseModel):
    session_id: str
    question: str
    resume_text: str
    resume_skills: list[str]
    resume_experience: float


@router.post("/career")
def career_chat(
    request: CareerChatRequest
):

    history = get_history(
        request.session_id
    )

    add_message(
        session_id=request.session_id,
        role="user",
        content=request.question
    )

    answer = answer_career_question(
        question=request.question,
        resume_text=request.resume_text,
        resume_skills=request.resume_skills,
        resume_experience=request.resume_experience,
        history=history
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