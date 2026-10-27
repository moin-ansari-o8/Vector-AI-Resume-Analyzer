import os
from fastapi import APIRouter

from app.services.job_ingestion import (
    ingest_jobs,
    ingest_jobs_csv
)

router = APIRouter(
    prefix="/ingestion",
    tags=["Job Dataset"]
)


@router.post("/jobs")
def ingest_job_dataset():
    """
    Ingest job listings into SQLite and ChromaDB.
    Prioritizes the comprehensive job_roles.csv (324 roles) if available,
    falling back to jobs.json.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(backend_dir, "data", "raw", "job_roles.csv")
    json_path = os.path.join(os.path.dirname(backend_dir), "data", "jobs", "jobs.json")

    if os.path.exists(csv_path):
        count = ingest_jobs_csv(csv_path)
        source = "job_roles.csv"
    elif os.path.exists(json_path):
        count = ingest_jobs(json_path)
        source = "jobs.json"
    else:
        return {"error": "No job dataset found.", "jobs_added": 0}

    return {
        "message": f"Job dataset from {source} ingested successfully into SQLite and ChromaDB.",
        "jobs_added": count,
        "source": source
    }


@router.post("/roles-csv")
def ingest_roles_csv():
    """
    Specifically ingest the 324 job roles from backend/data/raw/job_roles.csv.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(backend_dir, "data", "raw", "job_roles.csv")
    if not os.path.exists(csv_path):
        return {"error": "job_roles.csv not found.", "jobs_added": 0}

    count = ingest_jobs_csv(csv_path)
    return {
        "message": "All job roles ingested successfully with fine-tuned embeddings.",
        "jobs_added": count
    }