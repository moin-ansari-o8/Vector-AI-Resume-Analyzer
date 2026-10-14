from fastapi import APIRouter

from app.schemas.job import (
    JobProcessRequest,
    JobProcessResponse
)

from app.services.job_processor import (
    process_job_description
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post(
    "/process",
    response_model=JobProcessResponse
)
def process_job(
    job: JobProcessRequest
):

    processed_job = process_job_description(
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description
    )

    return processed_job