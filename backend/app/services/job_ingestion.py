import json
import os

from app.services.job_processor import (
    process_job_description
)

from app.services.embedding_service import (
    generate_embedding
)

from app.services.vector_db import add_job


def load_jobs_from_json(file_path: str) -> list[dict]:

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Job dataset not found: {file_path}"
        )

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def ingest_jobs(file_path: str) -> int:

    jobs = load_jobs_from_json(
        file_path
    )

    count = 0

    for job in jobs:

        processed_job = process_job_description(
            title=job["title"],
            company=job["company"],
            location=job["location"],
            description=job["description"]
        )

        job_text = (
            f'{processed_job["title"]}. '
            f'{processed_job["description"]}'
        )

        embedding = generate_embedding(
            job_text
        )

        add_job(
            job_id=job["job_id"],
            job_text=job_text,
            embedding=embedding,
            metadata={
                "title": processed_job["title"],
                "company": processed_job["company"],
                "location": processed_job["location"],
                "required_skills": ", ".join(
                    processed_job["required_skills"]
                ),
                "experience_required":
                    processed_job[
                        "experience_required"
                    ]
            }
        )

        count += 1

    return count