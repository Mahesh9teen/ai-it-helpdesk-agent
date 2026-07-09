"""Unit tests for the RAG pipeline."""

from __future__ import annotations

from langchain_core.documents import Document

from app.rag import ESCALATION_MESSAGE, RAGChain, chunk_documents, get_retriever, set_vector_store


class _FakeRetriever:
    def __init__(self, documents: list[Document]) -> None:
        self.documents = documents
        self.queries: list[str] = []

    def invoke(self, query: str) -> list[Document]:
        self.queries.append(query)
        return self.documents


class _FakeVectorStore:
    def __init__(self) -> None:
        self.search_kwargs: dict[str, object] | None = None

    def as_retriever(self, *, search_kwargs: dict[str, object]) -> dict[str, object]:
        self.search_kwargs = search_kwargs
        return search_kwargs


class _FakeOllamaClient:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def chat(self, *, model: str, messages: list[dict[str, str]], stream: bool):
        self.calls.append({"model": model, "messages": messages, "stream": stream})
        return iter(
            [
            {"message": {"content": "Use the password reset portal."}},
            {"message": {"content": " Contact the service desk if locked out."}},
            ]
        )


def test_chunk_documents_preserves_headers_and_category() -> None:
    documents = [
        Document(
            page_content="# Password Policy\nPasswords must be changed every 90 days.\nUse MFA.",
            metadata={
                "source": "password_policy.md",
                "source_filename": "password_policy.md",
                "category": "password_policy",
                "last_updated": "2026-01-01",
            },
        )
    ]

    chunks = chunk_documents(documents)

    assert len(chunks) == 1
    assert chunks[0].metadata["source"] == "password_policy.md"
    assert chunks[0].metadata["source_filename"] == "password_policy.md"
    assert chunks[0].metadata["category"] == "password_policy"
    assert chunks[0].metadata["last_updated"] == "2026-01-01"
    assert chunks[0].metadata["header"] == "Password Policy"


def test_get_retriever_applies_category_filter() -> None:
    fake_store = _FakeVectorStore()
    set_vector_store(fake_store)  # type: ignore[arg-type]

    try:
        retriever = get_retriever(k=7, category_filter="leave_policy")

        assert retriever == {"k": 7, "filter": {"category": "leave_policy"}}
        assert fake_store.search_kwargs == {"k": 7, "filter": {"category": "leave_policy"}}
    finally:
        set_vector_store(None)


def test_rag_chain_streams_grounded_response() -> None:
    fake_client = _FakeOllamaClient()
    document = Document(
        page_content="Employees can request five days of leave per quarter.",
        metadata={"source": "leave_policy.md", "category": "leave_policy", "last_updated": "2026-01-01"},
    )
    chain = RAGChain(
        client_factory=lambda host=None: fake_client,
        retriever_factory=lambda **kwargs: _FakeRetriever([document]),
    )

    stream, source_documents = chain.answer("How much leave do I get?", memory=["user: hi", "assistant: hello"])
    reply = "".join(stream)

    assert source_documents == [document]
    assert fake_client.calls[0]["stream"] is True
    assert "leave_policy.md" in fake_client.calls[0]["messages"][1]["content"]
    assert reply == "Use the password reset portal. Contact the service desk if locked out."


def test_rag_chain_escalates_when_no_context() -> None:
    fake_client = _FakeOllamaClient()
    chain = RAGChain(
        client_factory=lambda host=None: fake_client,
        retriever_factory=lambda **kwargs: _FakeRetriever([]),
    )

    stream, source_documents = chain.answer("What is the VPN password?", memory=[])
    reply = "".join(stream)

    assert source_documents == []
    assert reply == ESCALATION_MESSAGE
    assert fake_client.calls == []


def test_rag_chain_invokes_retriever_with_query() -> None:
    fake_client = _FakeOllamaClient()
    document = Document(page_content="Docs", metadata={"source": "general.md"})
    fake_retriever = _FakeRetriever([document])
    chain = RAGChain(
        client_factory=lambda host=None: fake_client,
        retriever_factory=lambda **kwargs: fake_retriever,
    )

    stream, source_documents = chain.answer("Where is the policy?")
    _ = "".join(stream)

    assert source_documents == [document]
    assert fake_retriever.queries == ["Where is the policy?"]
