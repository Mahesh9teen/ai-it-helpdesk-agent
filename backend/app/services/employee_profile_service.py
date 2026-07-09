"""Employee digital twin profile loading and updates."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Employee, EmployeeProfile
from app.services.db import managed_session


async def get_or_create_employee_profile(employee_id: UUID, session: AsyncSession | None = None) -> EmployeeProfile:
    async with managed_session(session) as (db, should_commit):
        profile = await db.scalar(select(EmployeeProfile).where(EmployeeProfile.employee_id == employee_id).limit(1))
        if profile is None:
            employee = await db.get(Employee, employee_id)
            profile = EmployeeProfile(
                id=uuid4(),
                employee_id=employee_id,
                device_model="MacBook Pro" if employee and employee.department in {"IT", "Engineering"} else "Dell Latitude",
                os_name="macOS Sonoma" if employee and employee.department in {"IT", "Engineering"} else "Windows 11",
                installed_software_fingerprint=["Microsoft 365", "Slack", "Zoom"],
                department=employee.department if employee else None,
                common_issue_history=[],
                preferred_language="en",
                resolution_preference="guided",
            )
            db.add(profile)
            if should_commit:
                await db.commit()
            else:
                await db.flush()
            await db.refresh(profile)
        return profile


async def append_profile_issue(employee_id: UUID, issue: str, session: AsyncSession | None = None) -> None:
    async with managed_session(session) as (db, should_commit):
        profile = await get_or_create_employee_profile(employee_id, session=db)
        history = list(profile.common_issue_history or [])
        history.append(issue)
        profile.common_issue_history = history[-20:]
        if should_commit:
            await db.commit()
        else:
            await db.flush()
