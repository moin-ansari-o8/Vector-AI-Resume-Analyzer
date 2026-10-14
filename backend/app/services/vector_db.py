import chromadb


client = chromadb.PersistentClient(
    path="../vector_db"
)

collection = client.get_or_create_collection(
    name="jobs"
)


def add_job(
    job_id: str,
    job_text: str,
    embedding: list[float],
    metadata: dict
):
    """
    Store a job and its embedding.
    """

    collection.upsert(
        ids=[job_id],
        documents=[job_text],
        embeddings=[embedding],
        metadatas=[metadata]
    )


def search_jobs(
    embedding: list[float],
    top_k: int = 5
):
    """
    Search for jobs that are semantically
    similar to the supplied embedding.
    """

    total_jobs = collection.count()

    if total_jobs == 0:
        return {
            "ids": [],
            "documents": [],
            "metadatas": [],
            "distances": []
        }

    top_k = min(top_k, total_jobs)

    return collection.query(
        query_embeddings=[embedding],
        n_results=top_k
    )