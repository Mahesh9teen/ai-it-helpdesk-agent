"""Basic smoke checks for the FastAPI application scaffold."""

from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint() -> None:
    """The health endpoint should be available for orchestration and monitoring."""

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_openapi_has_versioned_paths() -> None:
    """The OpenAPI document should include the versioned API routers."""

    client = TestClient(app)
    response = client.get("/openapi.json")

    assert response.status_code == 200
    payload = response.json()
    assert "/api/v1/chat/message" in payload["paths"]
    assert "/api/v1/tickets" in payload["paths"]
    assert "/api/v1/tickets/try-first" in payload["paths"]
    assert "/api/v1/analytics/summary" in payload["paths"]
    assert "/api/v1/onboarding/start" in payload["paths"]
    assert "/api/v1/diagnostics/vpn" in payload["paths"]
    assert "/api/v1/sla/check-now" in payload["paths"]
    assert "/api/v1/tickets/{ticket_id}/incident-report" in payload["paths"]


def test_ticket_response_schema_has_mvp_fields() -> None:
    """Ticket schema should expose MVP routing and summary metadata fields."""

    client = TestClient(app)
    payload = client.get("/openapi.json").json()

    ticket_schema = payload["components"]["schemas"]["TicketResponse"]["properties"]
    assert "category" in ticket_schema
    assert "priority" in ticket_schema
    assert "summary" in ticket_schema
    assert "assigned_agent_id" in ticket_schema
