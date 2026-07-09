"""SLA policy lookup and periodic monitoring/escalation."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SLAPolicy, Ticket
from app.services.db import managed_session
from app.services.escalation_service import maybe_escalate_ticket


async def get_sla_target_hours(category: str, priority: str, session: AsyncSession | None = None) -> int:
    async with managed_session(session) as (db, _):
        policy = await db.scalar(
            select(SLAPolicy)
            .where(SLAPolicy.category == category, SLAPolicy.priority == priority.lower())
        )
        if policy is None:
            # Default target hours by priority
            defaults = {"low": 48, "medium": 24, "high": 8, "urgent": 2, "critical": 1}
            return defaults.get(priority.lower(), 24)
        return policy.target_resolution_hours


async def upsert_sla_policy(
    *,
    category: str,
    priority: str,
    target_resolution_hours: int,
    auto_escalate_on_breach: bool,
    session: AsyncSession | None = None,
) -> SLAPolicy:
    async with managed_session(session) as (db, should_commit):
        policy = await db.scalar(
            select(SLAPolicy).where(SLAPolicy.category == category, SLAPolicy.priority == priority.lower())
        )
        if policy is None:
            policy = SLAPolicy(
                id=uuid4(),
                category=category,
                priority=priority.lower(),
                target_resolution_hours=target_resolution_hours,
                auto_escalate_on_breach=auto_escalate_on_breach,
            )
            db.add(policy)
        else:
            policy.target_resolution_hours = target_resolution_hours
            policy.auto_escalate_on_breach = auto_escalate_on_breach

        if should_commit:
            await db.commit()
            await db.refresh(policy)
        else:
            await db.flush()
        return policy


async def list_sla_policies(session: AsyncSession | None = None) -> list[SLAPolicy]:
    async with managed_session(session) as (db, _):
        result = await db.execute(select(SLAPolicy).order_by(SLAPolicy.category.asc(), SLAPolicy.priority.asc()))
        return list(result.scalars().all())


async def check_sla_and_flag(session: AsyncSession | None = None) -> int:
    at_risk = 0
    now = datetime.now(UTC)
    async with managed_session(session) as (db, _):
        result = await db.execute(select(Ticket).where(Ticket.status.in_(["new", "open", "in_progress"])))
        tickets = list(result.scalars().all())

        for ticket in tickets:
            target_hours = await get_sla_target_hours(ticket.category or "Other", ticket.priority or "medium", session=db)
            age_hours = max((now - ticket.created_at).total_seconds() / 3600.0, 0.0)
            if age_hours >= 0.85 * target_hours:
                at_risk += 1
                await maybe_escalate_ticket(
                    ticket=ticket,
                    trigger="SLA_BREACH_APPROACHING" if age_hours < target_hours else "SLA_BREACHED",
                    context={"age_hours": round(age_hours, 2), "target_hours": target_hours},
                    session=db,
                )
    return at_risk


class SLAMonitor:
    def __init__(self, interval_seconds: int = 120) -> None:
        self.interval_seconds = interval_seconds
        self._task: asyncio.Task | None = None
        self._running = False

    async def _runner(self) -> None:
        while self._running:
            try:
                await check_sla_and_flag()
            except Exception:
                pass
            await asyncio.sleep(self.interval_seconds)

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._runner())

    async def stop(self) -> None:
        self._running = False
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except Exception:
                pass
            self._task = None


sla_monitor = SLAMonitor()
