dev:
	docker compose up --build

ingest:
	cd backend && python -m app.rag.ingest --source-dir data/raw_docs --output-dir data/faiss_index

test:
	cd backend && pytest

lint:
	@echo "TODO: add lint tooling such as ruff or flake8"
