import os
from sentence_transformers import SentenceTransformer

# Check for fine-tuned domain-specific model checkpoint
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
FINE_TUNED_MODEL_PATH = os.path.join(BACKEND_DIR, "models", "fine_tuned_resumemodel")

if os.path.exists(FINE_TUNED_MODEL_PATH) and (
    os.path.exists(os.path.join(FINE_TUNED_MODEL_PATH, "model.safetensors")) or
    os.path.exists(os.path.join(FINE_TUNED_MODEL_PATH, "pytorch_model.bin"))
):
    MODEL_NAME = FINE_TUNED_MODEL_PATH
    print(f"[EmbeddingService] Loaded fine-tuned recruitment model from: {FINE_TUNED_MODEL_PATH}")
else:
    MODEL_NAME = "all-MiniLM-L6-v2"
    print(f"[EmbeddingService] Loaded base model: {MODEL_NAME}")

model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding vector for the given text.
    """

    if not text:
        return []

    embedding = model.encode(
        text,
        convert_to_numpy=True
    )

    return embedding.tolist()