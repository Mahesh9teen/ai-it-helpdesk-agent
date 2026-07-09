"""Document ingestion pipeline for policy and KB content."""

from __future__ import annotations

import argparse
import re
from datetime import datetime, timezone
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, UnstructuredFileLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.rag.embeddings import OllamaEmbeddings
from app.rag.vector_store import set_vector_store


def _infer_category(filepath: str) -> str:
    name = Path(filepath).stem.lower()
    if "password" in name:
        return "password_policy"
    if "leave" in name:
        return "leave_policy"
    if "software" in name:
        return "software_catalog"
    return "general_faq"


def _extract_header(text: str) -> str | None:
    match = re.search(r"^#{1,6}\s+(.+)$", text, re.MULTILINE)
    return match.group(1).strip() if match else None


def _last_updated(filepath: str) -> str:
    path = Path(filepath)
    try:
        timestamp = path.stat().st_mtime
        return datetime.fromtimestamp(timestamp, tz=timezone.utc).date().isoformat()
    except OSError:
        return datetime.now(tz=timezone.utc).date().isoformat()


def _iter_supported_loaders(source_dir: Path) -> list[DirectoryLoader]:
    return [
        DirectoryLoader(
            str(source_dir),
            glob="**/*.md",
            loader_cls=UnstructuredFileLoader,
            show_progress=True,
        ),
        DirectoryLoader(
            str(source_dir),
            glob="**/*.pdf",
            loader_cls=UnstructuredFileLoader,
            show_progress=True,
        ),
        DirectoryLoader(
            str(source_dir),
            glob="**/*.docx",
            loader_cls=UnstructuredFileLoader,
            show_progress=True,
        ),
    ]


def load_documents(source_dir: Path) -> list[Document]:
    documents: list[Document] = []
    for loader in _iter_supported_loaders(source_dir):
        documents.extend(loader.load())

    for document in documents:
        source = str(document.metadata.get("source", ""))
        document.metadata["source"] = source
        document.metadata["source_filename"] = Path(source).name
        document.metadata["category"] = _infer_category(source)
        document.metadata["last_updated"] = _last_updated(source)
        header = _extract_header(document.page_content)
        if header:
            document.metadata["header"] = header

    return documents


def chunk_documents(documents: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120,
        separators=["\n## ", "\n### ", "\n#### ", "\n# ", "\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    for chunk in chunks:
        source = str(chunk.metadata.get("source", ""))
        chunk.metadata["source"] = source
        chunk.metadata["source_filename"] = chunk.metadata.get("source_filename") or Path(source).name
        chunk.metadata["category"] = chunk.metadata.get("category") or _infer_category(source)
        chunk.metadata["last_updated"] = chunk.metadata.get("last_updated") or _last_updated(source)

        # Keep top-level markdown headers discoverable at chunk level for downstream prompting.
        header = _extract_header(chunk.page_content) or chunk.metadata.get("header")
        if header:
            chunk.metadata["header"] = header
    return chunks


def build_index(source_dir: Path, output_dir: Path) -> None:
    print(f"Loading documents from {source_dir} ...")
    docs = load_documents(source_dir)
    if not docs:
        print("No documents found. Index is empty.")
        return
    print(f"Loaded {len(docs)} document(s). Chunking ...")
    chunks = chunk_documents(docs)
    print(f"Created {len(chunks)} chunk(s). Building FAISS index ...")
    embeddings = OllamaEmbeddings()
    vector_store = FAISS.from_documents(chunks, embeddings)
    output_dir.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(output_dir))
    set_vector_store(vector_store)
    print(f"Index written to {output_dir}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI IT Helpdesk Agent ingestion pipeline")
    parser.add_argument("--source-dir", default="data/raw_docs")
    parser.add_argument("--output-dir", default="data/faiss_index")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    build_index(Path(args.source_dir), Path(args.output_dir))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
