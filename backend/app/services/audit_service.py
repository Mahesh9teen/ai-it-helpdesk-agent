"""Centralized audit log writes for all autonomous and remote actions."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditLog
from app.services.db import managed_session


async def write_audit_log(
    *,
    actor: str,
    action: str,
    target_type: str,
    target_id: str | None,
    reason: str | None,
    outcome: str,
    details: dict[str, Any] | None = None,
    session: AsyncSession | None = None,
) -> AuditLog:
    async with managed_session(session) as (db, should_commit):
        entry = AuditLog(
            id=uuid4(),
            actor=actor,
            action=action,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            outcome=outcome,
            details=details or {},
        )
        db.add(entry)
        if should_commit:
            await db.commit()
        else:
            await db.flush()
        await db.refresh(entry)
        return entry
