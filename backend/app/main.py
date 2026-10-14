import os
from dotenv import load_dotenv

# Load environment variables from .env file (backend or root)
load_dotenv()
backend_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume import router as resume_router
from app.api.job import router as job_router
from app.api.embedding import router as embedding_router
from app.api.vector import router as vector_router
from app.api.matching import router as matching_router
from app.api.skill_gap import router as skill_gap_router
from app.api.recommendation import router as recommendation_router
from app.api.chat import router as chat_router
from app.api.resume_improvement import (router as resume_improvement_router)
from app.api.explainability import (router as explainability_router)
from app.api.ingestion import (router as ingestion_router)

app = FastAPI(
    title="AI Resume Analyzer",
    description=(
        "AI Resume Analyzer and Job "
        "Recommendation System"
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(job_router)
app.include_router(embedding_router)
app.include_router(vector_router)
app.include_router(matching_router)
app.include_router(skill_gap_router)
app.include_router(recommendation_router)
app.include_router(chat_router)
app.include_router(resume_improvement_router)
app.include_router(explainability_router)
app.include_router(ingestion_router)

@app.get("/")
def home():
    return {
        "message": (
            "AI Resume Analyzer API is "
            "running successfully."
        )
    }