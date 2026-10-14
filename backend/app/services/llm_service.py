import ollama


MODEL_NAME = "llama3.2:3b"


def generate_answer(
    question: str,
    context: str,
    history: list[dict] | None = None
) -> str:

    history_text = ""

    if history:
        history_text = "\nCONVERSATION HISTORY:\n"

        for message in history:
            history_text += (
                f'{message["role"].upper()}: '
                f'{message["content"]}\n'
            )

    prompt = f"""
You are an AI career assistant.

Use the provided resume, job information and conversation
history to answer the user's question.

Rules:

1. Use only information supported by the provided context.
2. Never invent skills, experience, qualifications,
   certifications or achievements.
3. If information is unavailable, say so.
4. Do not claim that a candidate has a skill simply because
   the job requires it.
5. Give practical and concise career guidance.

CONTEXT:
{context}

{history_text}

CURRENT USER QUESTION:
{question}

ANSWER:
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]