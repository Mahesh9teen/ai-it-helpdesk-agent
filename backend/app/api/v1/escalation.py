"""Escalation endpoints for urgent or unresolved incidents."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import EscalationCreateRequest, EscalationQueueResponse, EscalationResponse
from app.services.escalation_service import create_escalation, get_escalation_queue

router = APIRouter(prefix="/escalation", tags=["Escalation"])


@router.post(
    "/handoff",
    response_model=EscalationResponse,
    summary="Hand off a session to a human agent",
    status_code=status.HTTP_202_ACCEPTED,
)
async def handoff(payload: EscalationCreateRequest, session: AsyncSession = Depends(get_async_session)) -> EscalationResponse:
    """Create an escalation record for urgent attention."""

    escalation = await create_escalation(payload.session_id, payload.reason, ticket_id=payload.ticket_id, urgency=payload.urgency, session=session)
    return EscalationResponse(
        escalation_id=escalation.id,
        session_id=escalation.session_id,
        ticket_id=escalation.ticket_id,
        status=escalation.status,
        assigned_to=escalation.assigned_to,
        message="Session handed off to human support",
    )


@router.get(
    "/queue",
    response_model=EscalationQueueResponse,
    summary="List escalations waiting in the queue",
    status_code=status.HTTP_200_OK,
)
async def queue(session: AsyncSession = Depends(get_async_session)) -> EscalationQueueResponse:
    """Return the current escalation queue."""

    items = await get_escalation_queue(session=session)
    return EscalationQueueResponse(
        items=[
            EscalationResponse(
                escalation_id=item.id,
                session_id=item.session_id,
                ticket_id=item.ticket_id,
                status=item.status,
                assigned_to=item.assigned_to,
                message=item.reason,
            )
            for item in items
        ]
    )
