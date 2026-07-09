"""Demo endpoints to test AI error handling and recovery."""

from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter

from app.schemas import MessageResponse

router = APIRouter(prefix="/test", tags=["Testing"])


@router.get("/error/database", response_model=MessageResponse)
async def test_database_error() -> MessageResponse:
    """Simulate a database connection error."""
    raise Exception("DatabaseConnectionError: Failed to connect to PostgreSQL at localhost:5432")


@router.get("/error/validation", response_model=MessageResponse)
async def test_validation_error() -> MessageResponse:
    """Simulate a validation error."""
    raise ValueError("ValidationError: Invalid email format provided: 'not_an_email'")


@router.get("/error/timeout", response_model=MessageResponse)
async def test_timeout_error() -> MessageResponse:
    """Simulate a timeout error."""
    raise TimeoutError("TimeoutError: Request to Ollama service timed out after 30 seconds")


@router.get("/error/rag", response_model=MessageResponse)
async def test_rag_error() -> MessageResponse:
    """Simulate a RAG system error."""
    raise Exception("RAGError: FAISS index not loaded - embeddings unavailable")


@router.get("/error/ollama", response_model=MessageResponse)
async def test_ollama_error() -> MessageResponse:
    """Simulate an Ollama connection error."""
    raise ConnectionError("OllamaConnectionError: Cannot reach Ollama at http://ollama:11434")


@router.get("/ai-recovery/status", response_model=Dict[str, Any])
async def get_recovery_status() -> Dict[str, Any]:
    """Get the status of AI recovery system."""
    return {
        "status": "operational",
        "ai_engine": "ollama",
        "model": "llama3.2",
        "auto_recovery_enabled": True,
        "features": [
            "Database reconnection",
            "Exponential backoff retry",
            "Input data sanitization",
            "Fallback service switching",
            "Ollama reconnection",
            "RAG system reinitialization"
        ]
    }
