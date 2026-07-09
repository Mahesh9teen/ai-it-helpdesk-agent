"""Grounded RAG chain with Ollama streaming and escalation fallback."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

from langchain_core.documents import Document

from app.config import get_settings
from app.agent.prompts import SYSTEM_PROMPT

ESCALATION_MESSAGE = "I don't have that in our knowledge base — escalating to IT support"


def _default_client_factory(host: str | None = None) -> Any:
    import ollama
    settings = get_settings()
    return ollama.Client(host=host or settings.ollama_host)


def _default_retriever_factory(**kwargs: Any) -> Any:
    from app.rag.vector_store import get_retriever
    return get_retriever(**kwargs)


class RAGChain:
    def __init__(
        self,
        *,
        model: str = "llama3.1:8b",
        fallback_model: str = "qwen2.5:7b",
        host: str | None = None,
        client_factory: Any = _default_client_factory,
        retriever_factory: Any = _default_retriever_factory,
    ) -> None:
        self.models = [model, fallback_model] if fallback_model != model else [model]
        self.host = host
        self._client_factory = client_factory
        self._retriever_factory = retriever_factory

    def answer(
        self,
        query: str,
        memory: list[str] | None = None,
        category_filter: str | None = None,
        retrieved_documents: list[Document] | None = None,
    ) -> tuple[Generator[str, None, None], list[Document]]:
        documents = retrieved_documents or []
        if not documents:
            retriever = self._retriever_factory(category_filter=category_filter)
            if retriever is not None:
                documents = retriever.invoke(query)

        if not documents:
            return self._escalate(), []

        messages = self._build_messages(query, documents, memory or [])
        client = self._client_factory(self.host)
        return self._stream(client, self.models, messages), documents

    @staticmethod
    def _build_messages(query: str, documents: list[Document], memory: list[str]) -> list[dict[str, str]]:
        context_str = "\n\n".join(
            (
                f"[Source: {doc.metadata.get('source_filename') or doc.metadata.get('source', 'unknown')}"
                f" | Category: {doc.metadata.get('category', 'unknown')}]\n{doc.page_content}"
            )
            for doc in documents
        )
        memory_str = "\n".join(memory[-3:]) if memory else ""

        user_content = f"Retrieved context:\n{context_str}"
        if memory_str:
            user_content += f"\n\nConversation history:\n{memory_str}"
        user_content += f"\n\nQuestion: {query}"

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]

    @staticmethod
    def _stream(client: Any, models: list[str], messages: list[dict[str, str]]) -> Generator[str, None, None]:
        for idx, model in enumerate(models):
            try:
                stream = client.chat(model=model, messages=messages, stream=True)
                for chunk in stream:
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
                return
            except Exception:
                if idx == len(models) - 1:
                    yield ESCALATION_MESSAGE
                    return

    @staticmethod
    def _escalate() -> Generator[str, None, None]:
        yield ESCALATION_MESSAGE
