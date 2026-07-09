"""FastAPI entrypoint for the AI IT Helpdesk Agent backend."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.error_middleware import AIErrorHandlingMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.advanced_features import router as advanced_features_router
from app.api.v1.chat import router as chat_router
from app.api.v1.diagnostics import router as diagnostics_router
from app.api.v1.errors import router as errors_router
from app.api.v1.escalation import router as escalation_router
from app.api.v1.features import router as features_router
from app.api.v1.leave import router as leave_router
from app.api.v1.monitoring import router as monitoring_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.password_reset import router as password_reset_router
from app.api.v1.remote_assist import router as remote_assist_router
from app.api.v1.software_requests import router as software_requests_router
from app.api.v1.sla import router as sla_router
from app.api.v1.tickets import router as tickets_router
from app.api.v1.voice import router as voice_router
from app.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.schemas import HealthResponse, MessageResponse

settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(application: FastAPI):
    from app.db.seed_data import seed_demo_data
    from app.export_openapi import export_openapi_schema
    from app.rag.vector_store import load_vector_store
    from app.services.sla_service import sla_monitor
    from app.services.monitoring_service import predictive_monitor
    try:
        await seed_demo_data()
        print("Demo seed data loaded.")
    except Exception as exc:
        print(f"Seed data skipped: {exc}")
    try:
        load_vector_store()
        print("FAISS index loaded successfully.")
    except Exception as exc:
        print(f"FAISS index not available at startup: {exc}")
    try:
        export_openapi_schema(application)
        print("OpenAPI schema exported to docs/openapi.yaml.")
    except Exception as exc:
        print(f"OpenAPI export skipped: {exc}")
    sla_monitor.start()
    predictive_monitor.start()
    yield
    await sla_monitor.stop()
    await predictive_monitor.stop()


app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    version=settings.app_version,
    description="AI IT Helpdesk Agent backend with chat, ticketing, and HR request APIs.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=[
        {"name": "Health", "description": "Service readiness and liveness endpoints."},
        {"name": "Chat", "description": "Conversational helpdesk agent interactions."},
        {"name": "Authentication", "description": "Session and identity workflows."},
        {"name": "Password Reset", "description": "Password reset workflows."},
        {"name": "Leave", "description": "Leave balance and request handling."},
        {"name": "Tickets", "description": "IT support ticket operations."},
        {"name": "Software Requests", "description": "Software request intake and status tracking."},
        {"name": "Escalation", "description": "Escalation and human handoff operations."},
        {"name": "Diagnostics", "description": "Rule-based VPN and Outlook diagnostic trees."},
        {"name": "Onboarding", "description": "New-hire onboarding checklists and automation."},
        {"name": "Analytics", "description": "Enterprise ticket and agent analytics endpoints."},
        {"name": "Advanced Features", "description": "Enterprise-grade AI features: smart routing, self-healing, predictive escalation, advanced analytics."},
        {"name": "SLA", "description": "SLA policy management and monitoring operations."},
        {"name": "Voice", "description": "Offline voice transcription and speech synthesis endpoints."},
        {"name": "Remote Assist", "description": "Approval-first remote remediation assistant endpoints."},
        {"name": "Monitoring", "description": "Predictive incident monitoring and proactive ticket generation."},
    ],
)

app.add_middleware(AIErrorHandlingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(chat_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(password_reset_router, prefix="/api/v1")
app.include_router(leave_router, prefix="/api/v1")
app.include_router(tickets_router, prefix="/api/v1")
app.include_router(software_requests_router, prefix="/api/v1")
app.include_router(escalation_router, prefix="/api/v1")
app.include_router(errors_router, prefix="/api/v1")
app.include_router(diagnostics_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(advanced_features_router, prefix="/api/v1")
app.include_router(sla_router, prefix="/api/v1")
app.include_router(voice_router, prefix="/api/v1")
app.include_router(remote_assist_router, prefix="/api/v1")
app.include_router(monitoring_router, prefix="/api/v1")
app.include_router(features_router, prefix="/api/v1")


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Check service health",
)
async def health_check() -> HealthResponse:
    """Return a minimal health response for orchestration and smoke tests."""

    return HealthResponse(service=settings.app_name, version=settings.app_version)


@app.get(
    "/",
    response_model=MessageResponse,
    tags=["Health"],
    summary="Service landing response",
)
async def root() -> MessageResponse:
    """Return a lightweight landing message for humans and probes."""

    return MessageResponse(message=f"{settings.app_name} is running")
