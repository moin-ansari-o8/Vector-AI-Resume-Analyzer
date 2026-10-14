from fastapi import APIRouter

from app.services.job_ingestion import (
    ingest_jobs
)


router = APIRouter(
    prefix="/ingestion",
    tags=["Job Dataset"]
)


@router.post("/jobs")
def ingest_job_dataset():

    dataset_path = (
        "../data/jobs/jobs.json"
    )

    count = ingest_jobs(
        dataset_path
    )

    return {
        "message": "Job dataset ingested successfully.",
        "jobs_added": count
    }