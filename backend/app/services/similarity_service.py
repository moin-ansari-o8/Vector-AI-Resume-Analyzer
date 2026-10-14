import numpy as np


def cosine_similarity(
    embedding_a: list[float],
    embedding_b: list[float]
) -> float:

    if not embedding_a or not embedding_b:
        return 0.0

    vector_a = np.array(embedding_a)
    vector_b = np.array(embedding_b)

    denominator = (
        np.linalg.norm(vector_a)
        * np.linalg.norm(vector_b)
    )

    if denominator == 0:
        return 0.0

    similarity = np.dot(
        vector_a,
        vector_b
    ) / denominator

    return float(similarity)