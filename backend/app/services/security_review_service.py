"""Security anomaly checks for failed logins and impossible-travel patterns."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.automation_matrix import TaskType, get_automation_policy
from app.models import Employee, SecurityLoginEvent
from app.services.approval_service import create_pending_approval_request
from app.services.db import managed_session


async def seed_mock_security_events(session: AsyncSession | None = None) -> None:
    async with managed_session(session) as (db, should_commit):
        count = await db.scalar(select(func.count(SecurityLoginEvent.id)))
        if int(count or 0) > 0:
            return
        employee = (await db.execute(select(Employee).limit(1))).scalars().first()
        if employee is None:
            return

        now = datetime.now(UTC)
        db.add_all(
            [
                SecurityLoginEvent(
                    id=uuid4(),
                    employee_id=employee.id,
                    email=employee.email,
                    country="US",
                    city="Seattle",
                    ip_address="10.10.10.2",
                    success=False,
                    impossible_travel=False,
                    created_at=now - timedelta(minutes=12),
                    updated_at=now - timedelta(minutes=12),
                ),
                SecurityLoginEvent(
                    id=uuid4(),
                    employee_id=employee.id,
                    email=employee.email,
                    country="DE",
                    city="Berlin",
                    ip_address="10.10.10.9",
                    success=True,
                    impossible_travel=True,
                    created_at=now - timedelta(minutes=2),
                    updated_at=now - timedelta(minutes=2),
                ),
            ]
        )
        if should_commit:
            await db.commit()


async def review_login_anomalies(employee_id: UUID | None, session: AsyncSession | None = None) -> dict[str, object]:
    async with managed_session(session) as (db, _):
        await seed_mock_security_events(session=db)

        stmt = select(SecurityLoginEvent)
        if employee_id is not None:
            stmt = stmt.where(SecurityLoginEvent.employee_id == employee_id)
        events = list((await db.execute(stmt.order_by(SecurityLoginEvent.created_at.desc()).limit(50))).scalars().all())

        failed_count = sum(1 for item in events if not item.success)
        impossible_travel_count = sum(1 for item in events if item.impossible_travel)
        requires_human_review = failed_count >= 3 or impossible_travel_count > 0

        approval_id = None
        if requires_human_review:
            policy = get_automation_policy(TaskType.MANAGE_ACCESS_PERMISSIONS)
            request = await create_pending_approval_request(
                task_type=TaskType.MANAGE_ACCESS_PERMISSIONS,
                policy=policy,
                tool_name="security_review_agent",
                requested_by_employee_id=employee_id,
                payload={
                    "employee_id": str(employee_id) if employee_id else None,
                    "failed_count": failed_count,
                    "impossible_travel_count": impossible_travel_count,
                    "note": "Security agent never auto-locks account; requires human review.",
                },
                session=db,
            )
            approval_id = str(request.id)

        return {
            "failed_login_count": failed_count,
            "impossible_travel_count": impossible_travel_count,
            "requires_human_review": requires_human_review,
            "approval_request_id": approval_id,
        }
