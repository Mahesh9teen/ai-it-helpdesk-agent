"""Permissioned remote assistant flow with explicit user approval and audit trail."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RemoteAssistAction
from app.services.audit_service import write_audit_log
from app.services.db import managed_session

ALLOWED_SCRIPTS = {
    "clear_dns_cache.sh": ["Flushing DNS resolver cache", "Verifying resolver refresh"],
    "restart_print_spooler.sh": ["Stopping spooler", "Starting spooler", "Checking print queue"],
    "flush_outlook_cache.sh": ["Stopping Outlook process", "Flushing local cache", "Starting Outlook process"],
}


async def propose_action(
    *,
    ticket_id: UUID | None,
    requested_by_employee_id: UUID | None,
    script_name: str,
    session: AsyncSession | None = None,
) -> RemoteAssistAction:
    if script_name not in ALLOWED_SCRIPTS:
        raise ValueError("Script is not allow-listed")

    plan = (
        f"This action will run {script_name}. "
        "No hidden steps will run. Execution requires your explicit approval."
    )

    async with managed_session(session) as (db, should_commit):
        action = RemoteAssistAction(
            id=uuid4(),
            ticket_id=ticket_id,
            requested_by_employee_id=requested_by_employee_id,
            script_name=script_name,
            plain_english_plan=plan,
            status="pending_approval",
            execution_log=[],
        )
        db.add(action)
        await write_audit_log(
            actor="RemoteAssistant",
            action="propose_action",
            target_type="remote_assist_action",
            target_id=str(action.id),
            reason="User requested remote remediation",
            outcome="pending_approval",
            details={"script_name": script_name, "ticket_id": str(ticket_id) if ticket_id else None},
            session=db,
        )
        if should_commit:
            await db.commit()
            await db.refresh(action)
        else:
            await db.flush()
        return action


async def execute_approved_action(action_id: UUID, session: AsyncSession | None = None) -> RemoteAssistAction:
    async with managed_session(session) as (db, should_commit):
        action = await db.get(RemoteAssistAction, action_id)
        if action is None:
            raise ValueError("Remote assist action not found")
        if action.status != "approved":
            raise ValueError("Action must be approved before execution")

        steps = ALLOWED_SCRIPTS.get(action.script_name)
        if not steps:
            raise ValueError("Script is not allow-listed")

        log = []
        for idx, step in enumerate(steps, start=1):
            log.append(f"Step {idx}/{len(steps)}: {step}... done")

        action.execution_log = log
        action.status = "completed"

        await write_audit_log(
            actor="RemoteAssistant",
            action="execute_approved_action",
            target_type="remote_assist_action",
            target_id=str(action.id),
            reason="User explicitly approved",
            outcome="completed",
            details={"script_name": action.script_name, "steps": log},
            session=db,
        )

        if should_commit:
            await db.commit()
            await db.refresh(action)
        else:
            await db.flush()
        return action


async def approve_action(action_id: UUID, session: AsyncSession | None = None) -> RemoteAssistAction:
    async with managed_session(session) as (db, should_commit):
        action = await db.get(RemoteAssistAction, action_id)
        if action is None:
            raise ValueError("Remote assist action not found")
        action.status = "approved"
        await write_audit_log(
            actor="RemoteAssistant",
            action="approve_action",
            target_type="remote_assist_action",
            target_id=str(action.id),
            reason="Explicit user confirmation",
            outcome="approved",
            details={"script_name": action.script_name},
            session=db,
        )
        if should_commit:
            await db.commit()
            await db.refresh(action)
        else:
            await db.flush()
        return action
