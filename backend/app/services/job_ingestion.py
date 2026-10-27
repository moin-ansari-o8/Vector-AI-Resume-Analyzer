import csv
import json
import os

from app.services.job_processor import process_job_description
from app.services.embedding_service import generate_embedding
from app.services.vector_db import add_job, add_jobs_batch
from app.db.database import save_jobs_batch


def load_jobs_from_json(file_path: str) -> list[dict]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Job dataset not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_jobs_from_csv(file_path: str) -> list[dict]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Job dataset CSV not found: {file_path}")

    jobs = []
    with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
        reader = csv.DictReader(file)
        for idx, row in enumerate(reader):
            title = row.get("Job Title", "").strip() or "Untitled Role"
            category = row.get("Category", "").strip() or "General"
            edu = row.get("Education Requirement", "").strip().replace("|", " or ")
            exp_str = row.get("Experience Years", "0").strip()
            try:
                exp_years = float(exp_str)
            except ValueError:
                exp_years = 0.0

            skills_raw = row.get("Required Skills", "").strip()
            skills_list = [s.strip() for s in skills_raw.split("|") if s.strip()]
            salary = row.get("Salary Range", "").strip()

            company = f"{category} Solutions" if category not in ["Technology", "Healthcare"] else f"Apex {category}"

            description = (
                f"We are hiring a {title} for our {category} division. "
                f"Requires {int(exp_years) if exp_years.is_integer() else exp_years}+ years of practical experience. "
                f"Educational background: {edu or 'Relevant degree'}. "
                f"Key skills and competencies: {', '.join(skills_list)}. "
                f"Salary band: {salary if salary else 'Competitive market rate'}."
            )

            job_id = f"JR_{idx + 1:03d}"
            jobs.append({
                "job_id": job_id,
                "id": job_id,
                "title": title,
                "role": title,
                "category": category,
                "company": company,
                "location": "Hybrid / Remote",
                "description": description,
                "required_skills": skills_list,
                "experience_required": exp_years,
                "salary_range": salary
            })

    return jobs


def ingest_jobs(file_path: str) -> int:
    """
    Ingest jobs from either a JSON or CSV file into SQLite and ChromaDB.
    """
    if file_path.endswith(".csv"):
        return ingest_jobs_csv(file_path)

    jobs = load_jobs_from_json(file_path)
    count = 0
    db_jobs = []

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

        embedding = generate_embedding(job_text)
        metadata = {
            "title": processed_job["title"],
            "company": processed_job["company"],
            "location": processed_job["location"],
            "required_skills": ", ".join(processed_job["required_skills"]),
            "experience_required": processed_job["experience_required"]
        }

        add_job(
            job_id=job["job_id"],
            job_text=job_text,
            embedding=embedding,
            metadata=metadata
        )

        db_jobs.append({
            "id": job["job_id"],
            "job_id": job["job_id"],
            "title": processed_job["title"],
            "role": processed_job["title"],
            "company": processed_job["company"],
            "location": processed_job["location"],
            "description": processed_job["description"],
            "required_skills": processed_job["required_skills"],
            "experience_required": processed_job["experience_required"]
        })
        count += 1

    save_jobs_batch(db_jobs)
    return count


def ingest_jobs_csv(file_path: str) -> int:
    """
    Fast batch ingestion of all jobs from job_roles.csv into both SQLite and ChromaDB.
    Uses the fine-tuned SentenceTransformer model for generating vector embeddings.
    """
    jobs = load_jobs_from_csv(file_path)
    if not jobs:
        return 0

    job_ids = []
    job_texts = []
    metadatas = []
    embeddings = []
    db_jobs = []

    for job in jobs:
        job_text = (
            f"Job Title: {job['title']}. "
            f"Category: {job['category']}. "
            f"Experience Required: {job['experience_required']} years. "
            f"Required Skills: {', '.join(job['required_skills'])}. "
            f"{job['description']}"
        )

        job_ids.append(job["job_id"])
        job_texts.append(job_text)
        metadatas.append({
            "title": job["title"],
            "category": job["category"],
            "company": job["company"],
            "location": job["location"],
            "required_skills": ", ".join(job["required_skills"]),
            "experience_required": float(job["experience_required"]),
            "salary_range": job.get("salary_range", "")
        })

        embedding = generate_embedding(job_text)
        embeddings.append(embedding)

        db_jobs.append({
            "id": job["job_id"],
            "job_id": job["job_id"],
            "title": job["title"],
            "role": job["title"],
            "company": job["company"],
            "location": job["location"],
            "description": job["description"],
            "required_skills": job["required_skills"],
            "experience_required": job["experience_required"]
        })

    # Save to SQLite
    save_jobs_batch(db_jobs)

    # Batch upsert to ChromaDB
    add_jobs_batch(
        job_ids=job_ids,
        job_texts=job_texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(jobs)