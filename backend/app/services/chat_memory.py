from collections import defaultdict


conversation_store = defaultdict(list)


MAX_HISTORY = 10


def add_message(
    session_id: str,
    role: str,
    content: str
):
    conversation_store[session_id].append({
        "role": role,
        "content": content
    })

    # Keep only the latest messages
    conversation_store[session_id] = (
        conversation_store[session_id][-MAX_HISTORY:]
    )


def get_history(
    session_id: str
) -> list[dict]:

    return conversation_store.get(
        session_id,
        []
    )


def clear_history(
    session_id: str
):
    conversation_store.pop(
        session_id,
        None
    )