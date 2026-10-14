import os
import json
from app.services.embedding_service import generate_embedding
from app.services.vector_db import search_jobs

JOBS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data", "jobs", "jobs.json"
)

def _get_fallback_jobs() -> list[dict]:
    if os.path.exists(JOBS_FILE):
        try:
            with open(JOBS_FILE, "r", encoding="utf-8") as f:
                jobs_data = json.load(f)
                result = []
                for j in jobs_data:
                    desc = j.get("description", "")
                    result.append({
                        "job_id": j.get("job_id", ""),
                        "title": j.get("title", ""),
                        "company": j.get("company", ""),
                        "location": j.get("location", ""),
                        "required_skills": [s.strip() for s in ["Python", "FastAPI", "Docker", "SQL", "AWS"] if s.lower() in desc.lower()],
                        "experience_required": 2.0,
                        "similarity_score": 85.0,
                        "job_text": desc
                    })
                return result
        except Exception:
            pass
    return []


def match_resume_to_jobs(
    resume_text: str,
    top_k: int = 5
) -> list[dict]:
    if not resume_text:
        return []

    try:
        resume_embedding = generate_embedding(resume_text)
        results = search_jobs(resume_embedding, top_k)

        ids_list = results.get("ids", [])
        if ids_list and len(ids_list) > 0 and len(ids_list[0]) > 0:
            ids = ids_list[0]
            documents = results.get("documents", [[]])[0] if results.get("documents") else []
            metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []
            distances = results.get("distances", [[]])[0] if results.get("distances") else []

            matched_jobs = []
            for i in range(len(ids)):
                distance = distances[i] if i < len(distances) else 0.5
                similarity_score = 1 / (1 + distance)
                metadata = metadatas[i] if i < len(metadatas) and metadatas[i] else {}
                doc_text = documents[i] if i < len(documents) else ""

                required_skills = [
                    skill.strip()
                    for skill in metadata.get("required_skills", "").split(",")
                    if skill.strip()
                ]

                matched_jobs.append({
                    "job_id": ids[i],
                    "title": metadata.get("title", "Software Engineer"),
                    "company": metadata.get("company", "Tech Company"),
                    "location": metadata.get("location", "Remote"),
                    "required_skills": required_skills or ["Python", "SQL"],
                    "experience_required": float(metadata.get("experience_required", 0) or 0),
                    "similarity_score": round(similarity_score * 100, 2),
                    "job_text": doc_text
                })
            if matched_jobs:
                return matched_jobs
    except Exception as e:
        print(f"[Vector Job Match Error]: {e}")

    # Fallback to local jobs file
    return _get_fallback_jobs()[:top_k]


def search_jobs_by_question(
    question: str,
    top_k: int = 5
) -> list[dict]:
    if not question:
        return []

    try:
        question_embedding = generate_embedding(question)
        results = search_jobs(question_embedding, top_k)

        ids_list = results.get("ids", [])
        if ids_list and len(ids_list) > 0 and len(ids_list[0]) > 0:
            ids = ids_list[0]
            documents = results.get("documents", [[]])[0] if results.get("documents") else []
            metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []
            distances = results.get("distances", [[]])[0] if results.get("distances") else []

            matched_jobs = []
            for i in range(len(ids)):
                distance = distances[i] if i < len(distances) else 0.5
                similarity_score = 1 / (1 + distance)
                metadata = metadatas[i] if i < len(metadatas) and metadatas[i] else {}
                doc_text = documents[i] if i < len(documents) else ""

                required_skills = [
                    skill.strip()
                    for skill in metadata.get("required_skills", "").split(",")
                    if skill.strip()
                ]

                matched_jobs.append({
                    "job_id": ids[i],
                    "title": metadata.get("title", "Software Engineer"),
                    "company": metadata.get("company", "Tech Company"),
                    "location": metadata.get("location", "Remote"),
                    "required_skills": required_skills or ["Python", "SQL"],
                    "experience_required": float(metadata.get("experience_required", 0) or 0),
                    "similarity_score": round(similarity_score * 100, 2),
                    "job_text": doc_text
                })
            if matched_jobs:
                return matched_jobs
    except Exception as e:
        print(f"[Job Search by Question Error]: {e}")

    return _get_fallback_jobs()[:top_k]