"""Priority prediction and adaptive feedback for ticket triage."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PriorityFeedback, Ticket
from app.services.db import managed_session

_PRIORITY_ORDER = ["low", "medium", "high", "urgent", "critical"]


def _bump(priority: str, steps: int = 1) -> str:
    idx = _PRIORITY_ORDER.index(priority)
    return _PRIORITY_ORDER[min(len(_PRIORITY_ORDER) - 1, idx + steps)]


def normalize_priority(priority: str) -> str:
    value = (priority or "medium").lower()
    if value not in _PRIORITY_ORDER:
        return "medium"
    return value


def predict_priority(description: str, category: str, employee_role: str | None) -> str:
    """Predict ticket priority from issue text, category, and requester role."""

    text = f"{description} {category}".lower()
    priority = "medium"

    if any(keyword in text for keyword in ("password reset", "software install", "access request", "how to")):
        priority = "low"

    if any(keyword in text for keyword in ("cannot work", "can't work", "blocked", "production down", "sev1", "outage")):
        priority = "high"

    if any(keyword in text for keyword in ("entire team", "all users", "everyone", "company-wide")):
        priority = _bump(priority, 1)

    if employee_role and employee_role.lower() in {"vp", "executive", "ciso", "cto"}:
        priority = _bump(priority, 1)

    return priority


async def refine_priority_with_feedback(priority: str, category: str, session: AsyncSession | None = None) -> str:
    """Adjust priority based on historical average resolution times by category."""

    async with managed_session(session) as (db, _):
        result = await db.execute(select(PriorityFeedback).where(PriorityFeedback.category == category))
        feedback = result.scalar_one_or_none()
        if feedback is None or feedback.sample_count < 3:
            return priority

        if feedback.average_resolution_hours >= 72:
            return _bump(priority, 2)
        if feedback.average_resolution_hours >= 36:
            return _bump(priority, 1)
        return priority


async def record_resolution_feedback(ticket: Ticket, session: AsyncSession | None = None) -> None:
    """Update category-level resolution-time aggregates when tickets resolve."""

    if ticket.status != "resolved" or ticket.created_at is None:
        return

    now = datetime.now(UTC)
    resolution_hours = max((now - ticket.created_at).total_seconds() / 3600.0, 0.1)

    async with managed_session(session) as (db, should_commit):
        result = await db.execute(select(PriorityFeedback).where(PriorityFeedback.category == ticket.category))
        feedback = result.scalar_one_or_none()

        if feedback is None:
            feedback = PriorityFeedback(
                id=uuid4(),
                category=ticket.category,
                sample_count=1,
                total_resolution_hours=resolution_hours,
                average_resolution_hours=resolution_hours,
            )
            db.add(feedback)
        else:
            feedback.sample_count += 1
            feedback.total_resolution_hours += resolution_hours
            feedback.average_resolution_hours = feedback.total_resolution_hours / feedback.sample_count

        if should_commit:
            await db.commit()
