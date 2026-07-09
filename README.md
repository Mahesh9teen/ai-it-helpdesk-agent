# AI IT Helpdesk Agent

Production-grade monorepo scaffold for a FastAPI backend, Vite frontend, Ollama-powered RAG pipeline, and support tooling.

## Repository Layout

```text
ai-it-helpdesk-agent/
├── backend/
├── frontend/
├── docs/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Makefile
└── README.md
```

## What is scaffolded

- FastAPI backend with async route stubs, pydantic v2 settings, SQLAlchemy models, Alembic migration scaffolding, and smoke tests.
- Frontend Vite app shell with chat and ticketing components.
- Ollama, PostgreSQL, backend, and frontend services in Docker Compose.
- API documentation placeholders and a Hoppscotch collection file.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET`, `DATABASE_URL`, `OLLAMA_HOST`, `OLLAMA_MODEL_NAME`, and `FAISS_INDEX_PATH`.
2. Start infrastructure and apps with `make dev`.
3. Pull the Ollama model used by the backend, for example:

   ```bash
   ollama pull llama3.1:8b
   ollama pull qwen2.5:7b
   ollama pull nomic-embed-text
   ollama pull mxbai-embed-large
   ```

4. Build the FAISS index once documents are added:

   ```bash
   make ingest
   ```

5. Run the backend tests and lint checks with `make test` and `make lint`.

## Hoppscotch import

Import `docs/api-collection.hoppscotch.json` into Hoppscotch using the import flow in the Collections sidebar. The collection is prewired for the versioned API surface at `/api/v1`.

## API docs

When the backend is running, open:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

OpenAPI can also be exported manually at any time:

```bash
cd backend
python -m app.export_openapi
```

The backend startup lifecycle also attempts to export `docs/openapi.yaml` automatically.

## Database migrations and seed data

Run Alembic migrations from the backend directory:

```bash
cd backend
alembic upgrade head
```

Demo data is seeded at startup when the database is reachable. Seed records include:

- 20 employees with hashed passwords
- Leave balances and leave history for each employee
- A software catalog with 15 common enterprise tools

## Ticket Intelligence MVP Features

The backend now includes MVP-level ticket automation and triage:

- Ticket categorization into a fixed taxonomy: Hardware, Software, Network, Access/Identity, Email, Other.
- Rule-based priority prediction with adaptive refinement from historical category resolution data.
- "Try this first" KB deflection suggestions before ticket creation.
- Auto-generated ticket summaries and running resolution timelines.
- Skill-based ticket assignment with round-robin fallback queueing.

API additions and updates:

- `POST /api/v1/tickets/try-first`: returns top KB suggestions for a subject/description pair.
- `POST /api/v1/tickets`: now supports `tried_suggestions` and `employee_role` in request payload.
- Ticket response payload now includes `summary`, `resolution_timeline`, and `assigned_agent_id`.

After pulling changes, apply migrations so new tables/columns are present:

```bash
cd backend
alembic upgrade head
```

## Notes

The backend now includes a working Ollama + FAISS retrieval pipeline:

- Ingestion command: `python -m app.rag.ingest` (or `make ingest`) loads `.md`, `.pdf`, and `.docx` policy documents from `backend/data/raw_docs`.
- Chunks are indexed with metadata including source filename, category, and last-updated date, then persisted to `backend/data/faiss_index`.
- On service startup, the FAISS index is loaded once and exposed via a metadata-filterable retriever.
- RAG responses are grounded to retrieved context and escalate with a fixed fallback response when context is insufficient.
