"""Skill-based and fallback routing for ticket assignment."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AgentSkill, Employee, Ticket
from app.services.db import managed_session


_round_robin_cursor = 0


def _next_round_robin_index(pool_size: int) -> int:
    global _round_robin_cursor
    if pool_size <= 0:
        return 0
    idx = _round_robin_cursor % pool_size
    _round_robin_cursor += 1
    return idx


async def assign_ticket(ticket: Ticket, session: AsyncSession | None = None) -> Ticket:
    """Assign a ticket using category skills, then fallback round-robin queue."""

    async with managed_session(session) as (db, should_commit):
        stmt = (
            select(AgentSkill)
            .where(AgentSkill.category == ticket.category)
            .order_by(AgentSkill.current_load.asc(), AgentSkill.updated_at.asc())
        )
        result = await db.execute(stmt)
        candidates = list(result.scalars().all())
        candidate = candidates[0] if candidates else None

        if candidate is None:
            fallback_stmt = (
                select(Employee)
                .where(Employee.role.in_(["it_agent", "admin"]), Employee.is_active.is_(True))
                .order_by(Employee.created_at.asc())
            )
            fallback_result = await db.execute(fallback_stmt)
            fallback_agents = list(fallback_result.scalars().all())
            if fallback_agents:
                ticket.assigned_agent_id = fallback_agents[_next_round_robin_index(len(fallback_agents))].id

        if candidate is not None:
            candidate.current_load += 1
            ticket.assigned_agent_id = candidate.agent_id

        if should_commit:
            await db.commit()
            await db.refresh(ticket)
        else:
            await db.flush()

        return ticket
