"""Retrieval-augmented generation helpers for the helpdesk backend."""

from .embeddings import OllamaEmbeddings
from .ingest import build_index, chunk_documents, load_documents
from .retriever import ESCALATION_MESSAGE, RAGChain
from .vector_store import get_retriever, get_vector_store, load_vector_store, set_vector_store

__all__ = [
    "ESCALATION_MESSAGE",
    "OllamaEmbeddings",
    "RAGChain",
    "build_index",
    "chunk_documents",
    "get_retriever",
    "get_vector_store",
    "load_documents",
    "load_vector_store",
    "set_vector_store",
]
