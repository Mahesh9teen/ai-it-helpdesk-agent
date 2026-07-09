"""Analytics aggregations for dashboard endpoints."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Ticket
from app.services.db import managed_session


async def analytics_summary(session: AsyncSession | None = None) -> dict[str, float | int]:
    async with managed_session(session) as (db, _):
        total = await db.scalar(select(func.count(Ticket.id)))
        escalated = await db.scalar(select(func.count(Ticket.id)).where(Ticket.escalated.is_(True)))
        avg_resolution_hours = await db.scalar(
            select(
                func.avg(
                    case(
                        (Ticket.status == "resolved", func.extract("epoch", Ticket.updated_at - Ticket.created_at) / 3600.0),
                        else_=None,
                    )
                )
            )
        )
        escalation_rate = (float(escalated or 0) / float(total or 1)) * 100.0 if total else 0.0
        return {
            "total_tickets": int(total or 0),
            "escalated_tickets": int(escalated or 0),
            "escalation_rate": round(escalation_rate, 2),
            "avg_resolution_hours": round(float(avg_resolution_hours or 0.0), 2),
        }


async def analytics_by_category(session: AsyncSession | None = None) -> list[dict[str, int | str]]:
    async with managed_session(session) as (db, _):
        result = await db.execute(
            select(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).order_by(func.count(Ticket.id).desc())
        )
        return [{"category": row[0], "count": int(row[1])} for row in result.all()]


async def analytics_agent_performance(session: AsyncSession | None = None) -> list[dict[str, int | float | str | None]]:
    async with managed_session(session) as (db, _):
        result = await db.execute(
            select(
                Ticket.assigned_agent_id,
                func.count(Ticket.id),
                func.avg(
                    case(
                        (Ticket.status == "resolved", func.extract("epoch", Ticket.updated_at - Ticket.created_at) / 3600.0),
                        else_=None,
                    )
                ),
            )
            .group_by(Ticket.assigned_agent_id)
            .order_by(func.count(Ticket.id).desc())
        )
        return [
            {
                "agent_id": str(row[0]) if row[0] else None,
                "ticket_count": int(row[1] or 0),
                "avg_resolution_hours": round(float(row[2] or 0.0), 2),
            }
            for row in result.all()
        ]


async def analytics_trend(days: int = 14, session: AsyncSession | None = None) -> list[dict[str, int | str]]:
    start = datetime.now(UTC) - timedelta(days=days)
    async with managed_session(session) as (db, _):
        result = await db.execute(
            select(func.date_trunc("day", Ticket.created_at).label("day"), func.count(Ticket.id))
            .where(Ticket.created_at >= start)
            .group_by("day")
            .order_by("day")
        )
        return [{"day": row[0].strftime("%Y-%m-%d"), "count": int(row[1])} for row in result.all()]
