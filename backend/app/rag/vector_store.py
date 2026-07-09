"""FAISS index singleton loader and retriever factory."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from app.config import get_settings
from app.rag.embeddings import OllamaEmbeddings

_store: FAISS | None = None


def load_vector_store(index_path: str | None = None) -> FAISS:
    global _store
    if _store is not None:
        return _store

    settings = get_settings()
    path = index_path or settings.faiss_index_path
    index_dir = Path(path)
    if not index_dir.exists():
        raise FileNotFoundError(f"FAISS index directory not found: {index_dir}")

    embeddings = OllamaEmbeddings()
    _store = FAISS.load_local(str(index_dir), embeddings, allow_dangerous_deserialization=True)
    return _store


def set_vector_store(store: FAISS | None) -> None:
    global _store
    _store = store


def get_vector_store() -> FAISS | None:
    return _store


def get_retriever(k: int = 4, category_filter: str | None = None) -> Any:
    if _store is None:
        raise RuntimeError("Vector store not loaded. Call load_vector_store() first.")
    search_kwargs: dict[str, object] = {"k": k}
    if category_filter:
        search_kwargs["filter"] = {"category": category_filter}
    return _store.as_retriever(search_kwargs=search_kwargs)


async def add_documents_incremental(documents: list[Document], index_path: str | None = None) -> int:
    """Add new docs to existing FAISS store without full rebuild."""

    if not documents:
        return 0

    store = get_vector_store()
    settings = get_settings()
    path = Path(index_path or settings.faiss_index_path)
    embeddings = OllamaEmbeddings()

    if store is None:
        if path.exists():
            store = FAISS.load_local(str(path), embeddings, allow_dangerous_deserialization=True)
        else:
            store = FAISS.from_documents(documents, embeddings)
            path.mkdir(parents=True, exist_ok=True)
            store.save_local(str(path))
            set_vector_store(store)
            return len(documents)

    store.add_documents(documents)
    path.mkdir(parents=True, exist_ok=True)
    store.save_local(str(path))
    set_vector_store(store)
    return len(documents)
