from app.services.embedding_service import generate_embedding
from app.services.vector_db import search_jobs


def match_resume_to_jobs(
    resume_text: str,
    top_k: int = 5
) -> list[dict]:

    if not resume_text:
        return []

    resume_embedding = generate_embedding(resume_text)

    results = search_jobs(
        resume_embedding,
        top_k
    )

    matched_jobs = []

    ids = results.get("ids", [[]])[0]
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for i in range(len(ids)):

        distance = distances[i]

        similarity_score = 1 / (1 + distance)

        metadata = metadatas[i] or {}

        matched_jobs.append({
            "job_id": ids[i],
            "title": metadata.get("title", ""),
            "company": metadata.get("company", ""),
            "location": metadata.get("location", ""),
            "required_skills": [
                skill.strip()
                for skill in metadata.get(
                    "required_skills",
                    ""
                ).split(",")
                if skill.strip()
            ],
            "experience_required": float(
                metadata.get(
                    "experience_required",
                    0
                )
            ),
            "similarity_score": round(
                similarity_score * 100,
                2
            ),
            "job_text": documents[i]
        })

    return matched_jobs
def search_jobs_by_question(
    question: str,
    top_k: int = 5
) -> list[dict]:

    if not question:
        return []

    question_embedding = generate_embedding(question)

    results = search_jobs(
        question_embedding,
        top_k
    )

    matched_jobs = []

    ids = results.get("ids", [[]])[0]
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for i in range(len(ids)):

        distance = distances[i]

        similarity_score = 1 / (1 + distance)

        metadata = metadatas[i] or {}

        required_skills = [
            skill.strip()
            for skill in metadata.get(
                "required_skills",
                ""
            ).split(",")
            if skill.strip()
        ]

        matched_jobs.append({
            "job_id": ids[i],
            "title": metadata.get("title", ""),
            "company": metadata.get("company", ""),
            "location": metadata.get("location", ""),
            "required_skills": required_skills,
            "experience_required": float(
                metadata.get(
                    "experience_required",
                    0
                )
            ),
            "similarity_score": round(
                similarity_score * 100,
                2
            ),
            "job_text": documents[i]
        })

    return matched_jobs