"""Ticket endpoints for issue intake and retrieval."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import (
    AutonomousResolveResponse,
    KBSuggestionResponse,
    MessageResponse,
    RCAResponse,
    TicketCreateRequest,
    TicketListResponse,
    TicketResponse,
    TicketStatusUpdateRequest,
    TicketSuggestionRequest,
    TicketSuggestionResponse,
    IncidentReportResponse,
)
from app.services.automation_agent_service import autonomous_resolve
from app.services.incident_report_service import export_incident_markdown, export_incident_pdf, generate_incident_report
from app.services.rca_service import analyze_root_cause
from app.services.kb_suggestion_service import get_ticket_suggestions
from app.services.ticket_service import create_ticket, escalate_ticket, get_ticket, list_tickets, update_ticket_status
from app.services.ticket_summarizer_service import summarize_ticket_comments
from app.services.similar_tickets_service import find_similar_tickets, get_similar_tickets_summary
from app.services.reply_suggestion_service import generate_reply_suggestion, get_multiple_suggestions

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def _to_ticket_response(ticket) -> TicketResponse:
    requester_email = ticket.requester_email
    if requester_email and requester_email.endswith(".local"):
        requester_email = requester_email.replace(".local", ".com")

    return TicketResponse(
        ticket_id=ticket.id,
        employee_id=ticket.employee_id,
        status=ticket.status,
        subject=ticket.subject,
        requester_email=requester_email,
        category=ticket.category,
        priority=ticket.priority,
        description=ticket.description,
        summary=ticket.summary,
        resolution_timeline=ticket.resolution_timeline,
        assigned_agent_id=ticket.assigned_agent_id,
        created_at=ticket.created_at,
    )


@router.post(
    "/try-first",
    response_model=TicketSuggestionResponse,
    summary="Get KB suggestions before raising a ticket",
    status_code=status.HTTP_200_OK,
)
async def try_first(payload: TicketSuggestionRequest) -> TicketSuggestionResponse:
    """Return top knowledge-base suggestions for issue deflection."""

    query = f"{payload.subject}\n{payload.description}"
    suggestions = get_ticket_suggestions(query)
    return TicketSuggestionResponse(
        suggestions=[
            KBSuggestionResponse(source=item.source, snippet=item.snippet, score=item.score)
            for item in suggestions[:2]
        ]
    )


@router.post(
    "",
    response_model=TicketResponse,
    responses={409: {"description": "KB suggestions available before ticket creation"}},
    summary="Create an IT support ticket",
    status_code=status.HTTP_201_CREATED,
)
async def create(payload: TicketCreateRequest, session: AsyncSession = Depends(get_async_session)) -> TicketResponse:
    """Create a new helpdesk ticket."""

    query = f"{payload.subject}\n{payload.description}"
    suggestions = get_ticket_suggestions(query)
    if suggestions and not payload.tried_suggestions:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": "Try this first",
                "message": "Relevant KB suggestions found. Confirm they did not help before creating a ticket.",
                "suggestions": [
                    {"source": item.source, "snippet": item.snippet, "score": item.score}
                    for item in suggestions[:2]
                ],
            },
        )

    ticket = await create_ticket(
        employee_id=payload.employee_id,
        requester_email=str(payload.requester_email) if payload.requester_email else None,
        subject=payload.subject,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        employee_role=payload.employee_role,
        session=session,
    )
    return _to_ticket_response(ticket)


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
    summary="Fetch a ticket by ID",
    status_code=status.HTTP_200_OK,
)
async def read(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> TicketResponse:
    """Retrieve a single ticket by identifier."""

    ticket = await get_ticket(ticket_id, session=session)
    return _to_ticket_response(ticket)


@router.get(
    "",
    response_model=TicketListResponse,
    summary="List tickets for an employee",
    status_code=status.HTTP_200_OK,
)
async def read_many(employee_id: UUID | None = Query(default=None), session: AsyncSession = Depends(get_async_session)) -> TicketListResponse:
    """List tickets optionally filtered by employee ID."""

    items = await list_tickets(employee_id, session=session)
    return TicketListResponse(tickets=[_to_ticket_response(item) for item in items])


@router.patch(
    "/{ticket_id}/status",
    response_model=TicketResponse,
    summary="Update a ticket status",
    status_code=status.HTTP_200_OK,
)
async def update_status(
    ticket_id: UUID,
    payload: TicketStatusUpdateRequest,
    session: AsyncSession = Depends(get_async_session),
) -> TicketResponse:
    """Update the ticket lifecycle status."""

    ticket = await update_ticket_status(ticket_id, payload.status, session=session)
    return _to_ticket_response(ticket)


@router.post(
    "/{ticket_id}/escalate",
    response_model=MessageResponse,
    summary="Escalate a ticket to a human agent",
    status_code=status.HTTP_202_ACCEPTED,
)
async def escalate(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> MessageResponse:
    """Escalate a ticket for human review."""

    await escalate_ticket(ticket_id, "Ticket escalated by API", session=session)
    return MessageResponse(message="Ticket escalated")


@router.post(
    "/{ticket_id}/incident-report",
    response_model=IncidentReportResponse,
    summary="Generate AI post-incident report for a major incident",
    status_code=status.HTTP_200_OK,
)
async def generate_report(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> IncidentReportResponse:
    report = await generate_incident_report(ticket_id, session=session)
    return IncidentReportResponse(ticket_id=report.ticket_id, markdown_content=report.markdown_content)


@router.get(
    "/{ticket_id}/incident-report/markdown",
    response_model=IncidentReportResponse,
    summary="Download incident report markdown",
    status_code=status.HTTP_200_OK,
)
async def export_report_markdown(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> IncidentReportResponse:
    markdown = await export_incident_markdown(ticket_id, session=session)
    return IncidentReportResponse(ticket_id=ticket_id, markdown_content=markdown)


@router.get(
    "/{ticket_id}/incident-report/pdf",
    summary="Download incident report as PDF",
    status_code=status.HTTP_200_OK,
)
async def export_report_pdf(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> Response:
    pdf_bytes = await export_incident_pdf(ticket_id, session=session)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=incident-{ticket_id}.pdf"},
    )


@router.post(
    "/{ticket_id}/analyze-root-cause",
    response_model=RCAResponse,
    summary="Run AI root cause analysis for a ticket",
    status_code=status.HTTP_200_OK,
)
async def analyze_ticket_root_cause(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> RCAResponse:
    report = await analyze_root_cause(ticket_id, session=session)
    return RCAResponse(
        ticket_id=report.ticket_id,
        likely_cause=report.likely_cause,
        confidence=report.confidence,
        affected_systems=report.affected_systems,
        similar_past_incidents=report.similar_past_incidents,
        recommended_permanent_fix=report.recommended_permanent_fix,
    )


@router.post(
    "/{ticket_id}/autonomous-resolve",
    response_model=AutonomousResolveResponse,
    summary="Attempt autonomous ticket resolution with safety rails",
    status_code=status.HTTP_200_OK,
)
async def autonomous_resolve_ticket(ticket_id: UUID, session: AsyncSession = Depends(get_async_session)) -> AutonomousResolveResponse:
    result = await autonomous_resolve(ticket_id, session=session)
    return AutonomousResolveResponse(
        ticket_id=ticket_id,
        status=str(result.get("status", "unknown")),
        attempts=list(result.get("attempts") or []),
    )


# ============================================================================
# MARKETPLACE TOP 5 FEATURES
# ============================================================================


@router.post(
    "/{ticket_id}/ai-summary",
    summary="📝 Feature 2: AI Ticket Comment Summarization",
    status_code=status.HTTP_200_OK,
)
async def get_ticket_summary(
    ticket_id: UUID,
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    AI summarizes all comments in a ticket thread.
    
    Returns:
    ```json
    {
      "summary": "User's laptop wouldn't start. Restarted in safe mode and ran Windows repair. Now working.",
      "key_points": [
        "Boot failure after Windows update",
        "Windows repair fixed the issue",
        "Resolved in 15 minutes"
      ],
      "resolution": "Ran Windows Startup Repair tool",
      "confidence": 0.95
    }
    ```
    """
    result = await summarize_ticket_comments(str(ticket_id), session)
    return result


@router.get(
    "/similar",
    summary="🔍 Feature 3: Similar Ticket Search",
    status_code=status.HTTP_200_OK,
)
async def search_similar_tickets(
    query: str = Query(..., description="Search query or issue description"),
    limit: int = Query(5, ge=1, le=10),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Find previously-solved tickets similar to this one.
    
    Example query: "VPN keeps disconnecting"
    
    Returns similar tickets with their resolutions so users can self-serve.
    
    Returns:
    ```json
    {
      "similar_tickets": [
        {
          "ticket_id": "JIRA-1234",
          "title": "VPN client timeout errors",
          "similarity_score": 0.94,
          "resolution": "Update VPN client to v3.5.1 using Windows Update",
          "resolved_by": "John Smith",
          "resolved_at": "2024-01-15"
        }
      ],
      "duplicate_likelihood": 0.87
    }
    ```
    """
    results = await find_similar_tickets(query, limit=limit)
    return {
        "similar_tickets": results,
        "duplicate_likelihood": results[0]["similarity_score"] if results else 0.0,
    }


@router.get(
    "/{ticket_id}/similar",
    summary="🔍 Feature 3: Similar Tickets for Specific Ticket",
    status_code=status.HTTP_200_OK,
)
async def get_similar_for_ticket(
    ticket_id: UUID,
    title: str = Query(...),
    description: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Find similar tickets for a specific ticket with AI insights.
    """
    return await get_similar_tickets_summary(str(ticket_id), title, description, session)


@router.get(
    "/{ticket_id}/kb-search",
    summary="📚 Feature 4: Knowledge Base Search (Already Implemented)",
    status_code=status.HTTP_200_OK,
)
async def search_knowledge_base(
    query: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
) -> TicketSuggestionResponse:
    """
    Search company knowledge base for answers (self-service).
    
    This prevents ticket creation - users find answers in docs/policies.
    
    Uses existing implementation: /tickets/try-first
    """
    suggestions = get_ticket_suggestions(query)
    return TicketSuggestionResponse(
        suggestions=[
            KBSuggestionResponse(source=item.source, snippet=item.snippet, score=item.score)
            for item in suggestions
        ]
    )


@router.post(
    "/{ticket_id}/reply-suggestions",
    summary="💬 Feature 5: AI Agent Reply Suggestions",
    status_code=status.HTTP_200_OK,
)
async def get_reply_suggestions(
    ticket_id: UUID,
    title: str = Query(...),
    description: str = Query(...),
    partial_reply: str = Query("", description="What agent has typed so far (optional)"),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Generate suggested responses for IT agents while they type.
    
    Example:
    - Ticket: "VPN won't connect"
    - Agent starts typing: "Thank you for contacting us..."
    - AI suggests: "...we have identified that VPN client v3.4 has a bug..."
    
    Returns:
    ```json
    {
      "suggestion": "we have identified the issue. It's related to your VPN client version.",
      "full_reply": "Thank you for contacting us...we have identified the issue...",
      "confidence": 0.92,
      "sources": ["JIRA-1234", "KB-tech-vpn"]
    }
    ```
    """
    result = await generate_reply_suggestion(
        str(ticket_id),
        title,
        description,
        agent_partial_reply=partial_reply if partial_reply else None,
        session=session,
    )
    return result


@router.post(
    "/{ticket_id}/reply-suggestions/multiple",
    summary="💬 Feature 5: Multiple Reply Suggestion Options",
    status_code=status.HTTP_200_OK,
)
async def get_multiple_reply_suggestions(
    ticket_id: UUID,
    title: str = Query(...),
    description: str = Query(...),
    count: int = Query(3, ge=1, le=5),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Generate multiple alternative reply suggestions (formal, friendly, technical).
    
    Returns array of suggestions with different tones for agent to choose from.
    """
    suggestions = await get_multiple_suggestions(str(ticket_id), title, description, session, count)
    return {"suggestions": suggestions}
