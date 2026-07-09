"""Ticket service for issue intake, retrieval, and escalation."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.models import Employee, Ticket
from app.services.assignment_service import assign_ticket
from app.services.categorization_service import classify_ticket_category
from app.services.db import managed_session
from app.services.escalation_service import maybe_escalate_ticket
from app.services.knowledge_builder_service import maybe_build_article_from_ticket
from app.services.priority_service import normalize_priority, predict_priority, record_resolution_feedback, refine_priority_with_feedback
from app.services.rca_service import analyze_root_cause
from app.services.summary_service import append_timeline_event, generate_ticket_summary


def _sla_for_priority(priority: str) -> int:
    mapping = {"low": 48, "medium": 24, "high": 8, "urgent": 2, "critical": 1}
    return mapping.get(normalize_priority(priority), 24)


async def create_ticket(
    *,
    employee_id: UUID | None,
    requester_email: str | None,
    subject: str,
    description: str,
    category: str = "general",
    priority: str = "medium",
    employee_role: str | None = None,
    session: AsyncSession | None = None,
) -> Ticket:
    """Create a new support ticket."""

    async with managed_session(session) as (db, should_commit):
        effective_employee_role = employee_role

        if employee_id is not None:
            employee = await db.get(Employee, employee_id)
            if employee is None:
                raise AppError("Unknown employee", status_code=404)
            if effective_employee_role is None:
                effective_employee_role = employee.role

        predicted_category = classify_ticket_category(subject, description)
        predicted_priority = predict_priority(description, predicted_category, effective_employee_role)
        if priority:
            predicted_priority = max(
                normalize_priority(predicted_priority),
                normalize_priority(priority),
                key=lambda level: ["low", "medium", "high", "urgent"].index(level),
            )
        refined_priority = await refine_priority_with_feedback(predicted_priority, predicted_category, session=db)

        ticket = Ticket(
            id=uuid4(),
            employee_id=employee_id,
            requester_email=requester_email,
            subject=subject,
            description=description,
            category=predicted_category,
            priority=refined_priority,
            status="new",
            sla_hours=_sla_for_priority(refined_priority),
        )
        ticket.resolution_timeline = append_timeline_event(None, "Created")
        db.add(ticket)

        await db.flush()
        await assign_ticket(ticket, session=db)
        ticket.summary = generate_ticket_summary(ticket, "Ticket created")

        if (ticket.priority or "").lower() in {"critical", "urgent"}:
            await maybe_escalate_ticket(
                ticket=ticket,
                trigger="PRIORITY_CRITICAL",
                context={"priority": ticket.priority},
                session=db,
            )

        if should_commit:
            await db.commit()
            await db.refresh(ticket)
        return ticket


async def get_ticket(ticket_id: UUID, session: AsyncSession | None = None) -> Ticket:
    async with managed_session(session) as (db, _):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            raise AppError("Ticket not found", status_code=404)
        return ticket


async def list_tickets(employee_id: UUID | None = None, session: AsyncSession | None = None) -> list[Ticket]:
    async with managed_session(session) as (db, _):
        stmt = select(Ticket).order_by(Ticket.created_at.desc())
        if employee_id is not None:
            stmt = stmt.where(Ticket.employee_id == employee_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())


async def update_ticket_status(ticket_id: UUID, status: str, session: AsyncSession | None = None) -> Ticket:
    async with managed_session(session) as (db, should_commit):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            raise AppError("Ticket not found", status_code=404)
        previous_status = ticket.status
        ticket.status = status
        timeline_event = f"Status changed: {previous_status} -> {status}"
        ticket.summary = generate_ticket_summary(ticket, timeline_event)
        ticket.resolution_timeline = append_timeline_event(ticket.resolution_timeline, timeline_event)
        if status == "major_incident":
            await maybe_escalate_ticket(
                ticket=ticket,
                trigger="USER_REQUEST",
                context={"status": status, "note": "Marked as major incident"},
                session=db,
            )
        if status == "resolved":
            await record_resolution_feedback(ticket, session=db)
            await analyze_root_cause(ticket.id, session=db)
            await maybe_build_article_from_ticket(ticket, session=db)
        if should_commit:
            await db.commit()
            await db.refresh(ticket)
        else:
            await db.flush()
        return ticket


async def escalate_ticket(ticket_id: UUID, reason: str, session: AsyncSession | None = None) -> Ticket:
    async with managed_session(session) as (db, should_commit):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            raise AppError("Ticket not found", status_code=404)
        ticket.escalated = True
        ticket.status = "open"
        ticket.summary = generate_ticket_summary(ticket, f"Ticket escalated: {reason}")
        ticket.resolution_timeline = append_timeline_event(ticket.resolution_timeline, f"Escalated: {reason}")
        await maybe_escalate_ticket(
            ticket=ticket,
            trigger="USER_REQUEST",
            context={"reason": reason},
            session=db,
        )
        if should_commit:
            await db.commit()
            await db.refresh(ticket)
        else:
            await db.flush()
        return ticket
