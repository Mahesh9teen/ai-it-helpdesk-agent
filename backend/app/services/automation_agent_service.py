"""Automation agent executor with strict policy and audit rails."""

from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.automation_matrix import AutomationLevel, TaskType, get_automation_policy
from app.models import Ticket
from app.services.audit_service import write_audit_log
from app.services.db import managed_session
from app.services.device_management_service import get_device_management_client
from app.services.diagnostics_service import run_outlook_diagnostic_step, run_vpn_diagnostic_step
from app.services.identity_service import initiate_password_reset_for_email
from app.services.notification_service import send_notification
from app.services.ticket_service import update_ticket_status


@dataclass(slots=True)
class AutomationExecutionResult:
    ok: bool
    message: str
    details: dict[str, object]


async def execute_state_change(
    *,
    task_type: TaskType,
    action_name: str,
    reason: str,
    ticket_id: UUID | None,
    employee_id: UUID | None,
    payload: dict[str, object],
    session: AsyncSession | None = None,
) -> AutomationExecutionResult:
    policy = get_automation_policy(task_type)
    if policy.requires_approval:
        await write_audit_log(
            actor="AutomationAgent",
            action=action_name,
            target_type="ticket" if ticket_id else "employee",
            target_id=str(ticket_id or employee_id),
            reason=reason,
            outcome="blocked_requires_approval",
            details={"task_type": task_type.value, "payload": payload},
            session=session,
        )
        return AutomationExecutionResult(False, "Action blocked: approval required", {"task_type": task_type.value})

    details: dict[str, object] = {"task_type": task_type.value, "action": action_name}
    if task_type == TaskType.INSTALL_SOFTWARE and employee_id is not None:
        client = get_device_management_client()
        job = await client.push_install(
            employee_id=employee_id,
            software_name=str(payload.get("software_name", "Unknown")),
            requested_by="automation-agent",
        )
        details["install_job_id"] = str(job.job_id)
    elif task_type == TaskType.PASSWORD_RESET and payload.get("email"):
        await initiate_password_reset_for_email(str(payload["email"]), session=session)
    elif task_type in {TaskType.VPN_ISSUES, TaskType.OUTLOOK_EMAIL_ISSUES}:
        details["mock_action"] = "service_restart_and_cache_clear"
    else:
        details["mock_action"] = "no-op"

    await write_audit_log(
        actor="AutomationAgent",
        action=action_name,
        target_type="ticket" if ticket_id else "employee",
        target_id=str(ticket_id or employee_id),
        reason=reason,
        outcome="executed",
        details=details,
        session=session,
    )
    return AutomationExecutionResult(True, "Action executed", details)


async def autonomous_resolve(ticket_id: UUID, session: AsyncSession | None = None) -> dict[str, object]:
    async with managed_session(session) as (db, should_commit):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            return {"status": "not_found"}

        category = (ticket.category or "").lower()
        if "vpn" in category or "network" in category:
            task_type = TaskType.VPN_ISSUES
            verify = lambda: run_vpn_diagnostic_step(0, "yes").resolved
        elif "outlook" in category or "email" in category:
            task_type = TaskType.OUTLOOK_EMAIL_ISSUES
            verify = lambda: run_outlook_diagnostic_step(0, "yes").resolved
        else:
            task_type = TaskType.TICKET_RESOLUTION
            verify = lambda: False

        policy = get_automation_policy(task_type)
        if policy.automation_level != AutomationLevel.FULL_AUTO:
            await write_audit_log(
                actor="AutomationAgent",
                action="autonomous_resolve",
                target_type="ticket",
                target_id=str(ticket_id),
                reason="Policy not full auto",
                outcome="blocked_policy",
                details={"task_type": task_type.value, "automation_level": policy.automation_level.value},
                session=db,
            )
            return {"status": "blocked_policy", "task_type": task_type.value}

        attempts: list[dict[str, object]] = []
        for retry in range(2):
            exec_result = await execute_state_change(
                task_type=task_type,
                action_name="autonomous_ticket_resolution",
                reason=f"Autonomous resolve attempt {retry + 1}",
                ticket_id=ticket_id,
                employee_id=ticket.employee_id,
                payload={"category": ticket.category, "description": ticket.description},
                session=db,
            )
            verified = bool(exec_result.ok and verify())
            attempts.append({"attempt": retry + 1, "executed": exec_result.ok, "verified": verified, "details": exec_result.details})
            if verified:
                await update_ticket_status(ticket_id, "closed", session=db)
                if ticket.requester_email:
                    await send_notification(
                        recipient=ticket.requester_email,
                        subject=f"Ticket {ticket_id} auto-resolved",
                        message="Automation resolved your issue and verified the fix.",
                    )
                if should_commit:
                    await db.commit()
                return {"status": "auto_closed", "attempts": attempts}

        await update_ticket_status(ticket_id, "open", session=db)
        await write_audit_log(
            actor="AutomationAgent",
            action="autonomous_resolve",
            target_type="ticket",
            target_id=str(ticket_id),
            reason="Verification failed after one retry",
            outcome="escalated",
            details={"attempts": attempts},
            session=db,
        )
        if should_commit:
            await db.commit()
        return {"status": "escalated", "attempts": attempts}
