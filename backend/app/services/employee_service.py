"""Employee lookups for authentication and profile APIs."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.models import Employee
from app.services.db import managed_session


async def get_employee_by_email(email: str, session: AsyncSession | None = None) -> Employee:
    async with managed_session(session) as (db, _):
        result = await db.execute(select(Employee).where(Employee.email == email.lower()))
        employee = result.scalar_one_or_none()
        if employee is None:
            raise AppError("User not found", status_code=404)
        return employee


async def get_employee_by_id(employee_id: UUID, session: AsyncSession | None = None) -> Employee:
    async with managed_session(session) as (db, _):
        employee = await db.get(Employee, employee_id)
        if employee is None:
            raise AppError("User not found", status_code=404)
        return employee
