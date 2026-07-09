"""Leave service for balances and history lookups."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.models import LeaveBalance, LeaveHistory
from app.services.db import managed_session


async def get_leave_balance(employee_id: UUID, session: AsyncSession | None = None) -> LeaveBalance:
    async with managed_session(session) as (db, _):
        result = await db.execute(select(LeaveBalance).where(LeaveBalance.employee_id == employee_id))
        balance = result.scalar_one_or_none()
        if balance is None:
            raise AppError("Leave balance not found", status_code=404)
        return balance


async def get_leave_history(employee_id: UUID, session: AsyncSession | None = None) -> list[LeaveHistory]:
    async with managed_session(session) as (db, _):
        result = await db.execute(
            select(LeaveHistory)
            .where(LeaveHistory.employee_id == employee_id)
            .order_by(LeaveHistory.start_date.desc())
        )
        history = result.scalars().all()
        if not history:
            raise AppError("Leave history not found", status_code=404)
        return list(history)
