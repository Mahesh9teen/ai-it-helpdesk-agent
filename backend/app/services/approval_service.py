"""Service helpers for creating and notifying pending approval requests."""

from __future__ import annotations

import os
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.automation_matrix import AutomationPolicy, TaskType
from app.models import ApprovalRequest
from app.services.db import managed_session
from app.services.notification_service import send_notification


def _resolve_approver(task_type: TaskType) -> str:
    default_approver = os.getenv("HELPDESK_DEFAULT_APPROVER", "it-approver@company.local")
    if task_type == TaskType.MANAGE_ACCESS_PERMISSIONS:
        return os.getenv("HELPDESK_SECURITY_APPROVER", default_approver)
    if task_type == TaskType.REMOTE_SUPPORT:
        return os.getenv("HELPDESK_REMOTE_APPROVER", default_approver)
    return default_approver


async def create_pending_approval_request(
    *,
    task_type: TaskType,
    policy: AutomationPolicy,
    tool_name: str,
    requested_by_employee_id: UUID | None,
    payload: dict[str, object],
    session: AsyncSession | None = None,
) -> ApprovalRequest:
    """Persist a pending approval request and notify the configured approver."""

    approver = _resolve_approver(task_type)

    async with managed_session(session) as (db, should_commit):
        request = ApprovalRequest(
            id=uuid4(),
            task_type=task_type.value,
            tool_name=tool_name,
            automation_level=policy.automation_level.value,
            requires_approval=policy.requires_approval,
            status="pending",
            requested_by_employee_id=requested_by_employee_id,
            approver=approver,
            systems_touched=list(policy.systems_touched),
            payload=payload,
            notes=policy.notes,
        )
        db.add(request)
        if should_commit:
            await db.commit()
        else:
            await db.flush()
        await db.refresh(request)

    await send_notification(
        recipient=approver,
        subject=f"Approval needed for {task_type.value}",
        message=(
            f"Tool {tool_name} requested approval for task {task_type.value}. "
            f"Request ID: {request.id}."
        ),
    )
    return request
