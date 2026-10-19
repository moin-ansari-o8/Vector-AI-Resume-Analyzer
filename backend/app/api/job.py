from typing import List
from fastapi import APIRouter, HTTPException

from app.schemas.job import (
    JobProcessRequest,
    JobProcessResponse,
    JobCreateRequest,
    JobResponse
)
from app.services.job_processor import process_job_description
from app.db.database import (
    get_all_jobs,
    get_job_by_id,
    save_job,
    delete_job
)
from app.services.embedding_service import generate_embedding
from app.services.vector_db import (
    add_job as add_vector_job,
    delete_job as delete_vector_job
)

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.get("/", response_model=List[JobResponse])
def list_jobs():
    """
    List all active jobs from SQLite database.
    """
    return get_all_jobs()


@router.get("/{job_id}", response_model=JobResponse)
def get_single_job(job_id: str):
    """
    Retrieve a single job by ID.
    """
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )
    return job


@router.post("/", response_model=JobResponse)
def create_job(job_in: JobCreateRequest):
    """
    Create a new job, auto-extract requirements if missing,
    save to SQLite database, and index in ChromaDB.
    """
    title = job_in.title or job_in.role or "New Position"
    company = job_in.company or "Company"
    location = job_in.location or "Remote"
    description = job_in.description or ""

    skills = job_in.required_skills or job_in.requiredSkills
    exp_req = job_in.experience_required if job_in.experience_required is not None else job_in.experienceRequired

    # Auto-extract skills and experience if not explicitly supplied
    if skills is None or exp_req is None:
        processed = process_job_description(
            title=title,
            company=company,
            location=location,
            description=description
        )
        if skills is None:
            skills = processed.get("required_skills", [])
        if exp_req is None:
            exp_req = float(processed.get("experience_required", 0.0))

    job_dict = {
        "id": job_in.id,
        "title": title,
        "role": title,
        "company": company,
        "location": location,
        "description": description,
        "required_skills": skills,
        "experience_required": float(exp_req or 0.0),
        "matches_count": 0
    }

    saved = save_job(job_dict)

    # Index in ChromaDB for vector similarity matching
    try:
        embed_text = f"{title}\n{description}\nSkills: {', '.join(skills)}"
        embedding = generate_embedding(embed_text)
        add_vector_job(
            job_id=saved["id"],
            job_text=embed_text,
            embedding=embedding,
            metadata={
                "title": title,
                "company": company,
                "location": location,
                "required_skills": ", ".join(skills),
                "experience_required": float(exp_req or 0.0)
            }
        )
    except Exception as e:
        print(f"Warning: Failed to index job in ChromaDB: {e}")

    return saved


@router.delete("/{job_id}")
def delete_single_job(job_id: str):
    """
    Delete a job from SQLite and ChromaDB.
    """
    deleted = delete_job(job_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )
    delete_vector_job(job_id)
    return {"message": "Job deleted successfully", "id": job_id}


@router.post(
    "/process",
    response_model=JobProcessResponse
)
def process_job(
    job: JobProcessRequest
):
    """
    Process job description text in memory without saving.
    """
    processed_job = process_job_description(
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description
    )

    return processed_job