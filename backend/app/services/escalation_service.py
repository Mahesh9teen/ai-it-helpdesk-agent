"""Escalation and human handoff helpers."""

from __future__ import annotations

import json
import os
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ChatSession
from app.services.notification_service import send_notification
from app.models import EscalationLog, Ticket
from app.services.db import managed_session


async def create_escalation(
    session_id: UUID,
    reason: str,
    ticket_id: UUID | None = None,
    urgency: str = "normal",
    session: AsyncSession | None = None,
) -> EscalationLog:
    async with managed_session(session) as (db, should_commit):
        chat_session = await db.get(ChatSession, session_id)
        if chat_session is None:
            # Ensure FK integrity for escalation logs even when no prior chat row exists.
            chat_session = ChatSession(id=session_id, session_key=str(session_id), employee_id=None)
            db.add(chat_session)
            await db.flush()

        escalation = EscalationLog(id=uuid4(), session_id=session_id, ticket_id=ticket_id, reason=f"[{urgency}] {reason}", status="queued")
        webhook = os.getenv("HELPDESK_ESCALATION_WEBHOOK")
        escalation.webhook_target = webhook
        escalation.webhook_status = "stubbed_sent" if webhook else "disabled"
        db.add(escalation)
        if should_commit:
            await db.commit()
            await db.refresh(escalation)
        else:
            await db.flush()

    await send_notification(recipient="support@example.com", subject="Escalation requested", message=reason)
    return escalation


async def get_escalation_queue(session: AsyncSession | None = None) -> list[EscalationLog]:
    async with managed_session(session) as (db, _):
        result = await db.execute(
            select(EscalationLog)
            .where(EscalationLog.status == "queued")
            .order_by(EscalationLog.created_at.asc())
        )
        return list(result.scalars().all())


async def maybe_escalate_ticket(
    *,
    ticket: Ticket,
    trigger: str,
    context: dict[str, object] | None = None,
    session: AsyncSession | None = None,
) -> EscalationLog | None:
    """Escalate a ticket for enterprise triggers and notify team webhook targets."""

    valid_triggers = {"SLA_BREACHED", "SLA_BREACH_APPROACHING", "REPEATED_DIAGNOSTIC_FAILURE", "USER_REQUEST", "PRIORITY_CRITICAL"}
    if trigger not in valid_triggers:
        return None

    if ticket.escalated and trigger != "SLA_BREACH_APPROACHING":
        return None

    reason = f"Trigger={trigger} Ticket={ticket.id} Category={ticket.category} Priority={ticket.priority}"
    if context:
        reason = f"{reason} Context={json.dumps(context, default=str)}"

    session_id = ticket.employee_id or uuid4()
    escalation = await create_escalation(
        session_id=session_id,
        reason=reason,
        ticket_id=ticket.id,
        urgency="critical" if (ticket.priority or "").lower() in {"critical", "urgent"} else "high",
        session=session,
    )

    await send_notification(
        recipient=os.getenv("HELPDESK_ESCALATION_TEAM", "helpdesk-escalations@company.local"),
        subject=f"Ticket Escalation: {ticket.subject}",
        message=(
            f"Ticket ID: {ticket.id}\n"
            f"Category: {ticket.category}\n"
            f"Priority: {ticket.priority}\n"
            f"Status: {ticket.status}\n"
            f"Summary: {ticket.summary}\n"
            f"Timeline: {ticket.resolution_timeline}\n"
            f"Trigger: {trigger}\n"
            f"Context: {json.dumps(context or {}, default=str)}"
        ),
    )

    ticket.escalated = True
    ticket.status = "open"
    return escalation
