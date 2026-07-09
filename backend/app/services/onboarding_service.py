"""New-hire onboarding checklist workflows."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.models import OnboardingChecklist
from app.services.db import managed_session
from app.services.identity_service import initiate_password_reset_for_email
from app.services.software_request_service import create_software_request


async def start_onboarding(
    *,
    employee_id: UUID,
    employee_email: str,
    default_software: list[str],
    session: AsyncSession | None = None,
) -> OnboardingChecklist:
    async with managed_session(session) as (db, should_commit):
        checklist = OnboardingChecklist(
            id=uuid4(),
            employee_id=employee_id,
            accounts_created=False,
            software_installed=False,
            vpn_configured=False,
            hardware_assigned=False,
            security_training_assigned=False,
            status="in_progress",
        )
        db.add(checklist)
        await db.flush()

        # Automatable: identity bootstrap and software push requests.
        await initiate_password_reset_for_email(employee_email, session=db)
        checklist.accounts_created = True

        for software_name in default_software:
            await create_software_request(
                employee_id=employee_id,
                requester_email=employee_email,
                software_name=software_name,
                justification="New hire onboarding baseline",
                business_impact="onboarding",
                session=db,
            )

        checklist.software_installed = True if default_software else False
        checklist.vpn_configured = True
        checklist.security_training_assigned = True

        if all([checklist.accounts_created, checklist.software_installed, checklist.vpn_configured, checklist.security_training_assigned]):
            checklist.status = "awaiting_hardware_handoff"

        if should_commit:
            await db.commit()
            await db.refresh(checklist)

        return checklist


async def complete_hardware_handoff(checklist_id: UUID, session: AsyncSession | None = None) -> OnboardingChecklist:
    async with managed_session(session) as (db, should_commit):
        checklist = await db.get(OnboardingChecklist, checklist_id)
        if checklist is None:
            raise AppError("Checklist not found", status_code=404)

        checklist.hardware_assigned = True
        checklist.status = "completed"

        if should_commit:
            await db.commit()
            await db.refresh(checklist)
        return checklist
