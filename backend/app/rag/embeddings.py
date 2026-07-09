"""Ollama embedding wrapper compatible with LangChain's Embeddings interface."""

from __future__ import annotations

from typing import Any

import ollama
from langchain_core.embeddings import Embeddings

from app.config import get_settings


class OllamaEmbeddings(Embeddings):
    def __init__(
        self,
        model: str | None = None,
        host: str | None = None,
        fallback_model: str = "mxbai-embed-large",
        client: Any | None = None,
    ) -> None:
        settings = get_settings()
        self.model = model or settings.ollama_embedding_model
        self.host = host or settings.ollama_host
        self.fallback_model = fallback_model
        self._client = client or ollama.Client(host=self.host)

    def _embed(self, text: str, *, model: str) -> list[float]:
        # Support both modern (embed) and legacy (embeddings) Ollama client APIs.
        if hasattr(self._client, "embed"):
            response = self._client.embed(model=model, input=text)
            vectors = response.get("embeddings", [])
            if not vectors:
                raise ValueError("Ollama embed returned no vectors.")
            return vectors[0]

        response = self._client.embeddings(model=model, prompt=text)
        embedding = response.get("embedding")
        if not embedding:
            raise ValueError("Ollama embeddings returned no vector.")
        return embedding

    def _embed_with_fallback(self, text: str) -> list[float]:
        try:
            return self._embed(text, model=self.model)
        except Exception:
            if self.fallback_model == self.model:
                raise
            return self._embed(text, model=self.fallback_model)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_with_fallback(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed_with_fallback(text)
