from fastapi import APIRouter
from pydantic import BaseModel

from app.services.embedding_service import (
    generate_embedding
)


router = APIRouter(
    prefix="/embeddings",
    tags=["Embeddings"]
)


class EmbeddingRequest(BaseModel):
    text: str


class EmbeddingResponse(BaseModel):
    dimension: int
    embedding: list[float]


@router.post(
    "/generate",
    response_model=EmbeddingResponse
)
def generate_text_embedding(
    request: EmbeddingRequest
):

    embedding = generate_embedding(
        request.text
    )

    return {
        "dimension": len(embedding),
        "embedding": embedding
    }