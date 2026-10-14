from fastapi import APIRouter

from pydantic import BaseModel

from app.services.embedding_service import (
    generate_embedding
)

from app.services.vector_db import (
    add_job,
    search_jobs
)


router = APIRouter(
    prefix="/vector",
    tags=["Vector Database"]
)


class JobVectorRequest(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    description: str
    required_skills: list[str]
    experience_required: float = 0

class JobSearchRequest(BaseModel):
    text: str
    top_k: int = 5


@router.post("/jobs/add")
def add_job_to_vector_database(
    job: JobVectorRequest
):

    job_text = (
        f"{job.title}. "
        f"{job.description}"
    )

    embedding = generate_embedding(
        job_text
    )

    add_job(
        job_id=job.job_id,
        job_text=job_text,
        embedding=embedding,
        metadata={
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "required_skills": ", ".join(
                job.required_skills
            ),
            "experience_required": job.experience_required
        }
    )

    return {
        "message": "Job added to vector database successfully.",
        "job_id": job.job_id
    }


@router.post("/jobs/search")
def search_job_vectors(
    request: JobSearchRequest
):

    embedding = generate_embedding(
        request.text
    )

    results = search_jobs(
        embedding,
        request.top_k
    )

    return results