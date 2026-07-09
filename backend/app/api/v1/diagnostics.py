"""Diagnostics assistant endpoints for VPN and Outlook troubleshooting."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import DiagnosticRequest, DiagnosticResponse
from app.services.diagnostics_service import run_outlook_diagnostic_step, run_vpn_diagnostic_step
from app.services.escalation_service import maybe_escalate_ticket
from app.services.ticket_service import get_ticket

router = APIRouter(prefix="/diagnostics", tags=["Diagnostics"])


@router.post(
    "/vpn",
    response_model=DiagnosticResponse,
    summary="Run VPN diagnostic decision tree",
    status_code=status.HTTP_200_OK,
)
async def vpn(payload: DiagnosticRequest, session: AsyncSession = Depends(get_async_session)) -> DiagnosticResponse:
    result = run_vpn_diagnostic_step(payload.step, payload.response)
    if result.escalate and payload.ticket_id is not None:
        ticket = await get_ticket(payload.ticket_id, session=session)
        await maybe_escalate_ticket(
            ticket=ticket,
            trigger="REPEATED_DIAGNOSTIC_FAILURE",
            context={"issue_type": "vpn", "step": result.step, "reason": result.final_reason},
            session=session,
        )
    return DiagnosticResponse(
        issue_type=result.issue_type,
        step=result.step,
        question=result.question,
        recommendation=result.recommendation,
        resolved=result.resolved,
        escalate=result.escalate,
        final_reason=result.final_reason,
    )


@router.post(
    "/outlook",
    response_model=DiagnosticResponse,
    summary="Run Outlook diagnostic decision tree",
    status_code=status.HTTP_200_OK,
)
async def outlook(payload: DiagnosticRequest, session: AsyncSession = Depends(get_async_session)) -> DiagnosticResponse:
    result = run_outlook_diagnostic_step(payload.step, payload.response)
    if result.escalate and payload.ticket_id is not None:
        ticket = await get_ticket(payload.ticket_id, session=session)
        await maybe_escalate_ticket(
            ticket=ticket,
            trigger="REPEATED_DIAGNOSTIC_FAILURE",
            context={"issue_type": "outlook", "step": result.step, "reason": result.final_reason},
            session=session,
        )
    return DiagnosticResponse(
        issue_type=result.issue_type,
        step=result.step,
        question=result.question,
        recommendation=result.recommendation,
        resolved=result.resolved,
        escalate=result.escalate,
        final_reason=result.final_reason,
    )
