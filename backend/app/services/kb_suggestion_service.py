"""Knowledge-base suggestion service for ticket deflection."""

from __future__ import annotations

from dataclasses import dataclass

from app.rag.vector_store import get_vector_store


@dataclass(slots=True)
class KBSuggestion:
    source: str
    snippet: str
    score: float


def get_ticket_suggestions(query: str, *, threshold: float = 1.0, limit: int = 2) -> list[KBSuggestion]:
    """Return top KB suggestions when the FAISS score clears the threshold.

    Lower FAISS distance means better similarity. The threshold is interpreted
    as a max distance.
    """

    try:
        store = get_vector_store()
        if store is None:
            return []
        matches = store.similarity_search_with_score(query, k=limit)
    except Exception:
        return []

    suggestions: list[KBSuggestion] = []
    for document, score in matches:
        if score > threshold:
            continue
        source = str(document.metadata.get("source_filename") or document.metadata.get("source") or "knowledge_base")
        snippet = document.page_content.strip().replace("\n", " ")
        suggestions.append(KBSuggestion(source=source, snippet=snippet[:260], score=float(score)))
    return suggestions
