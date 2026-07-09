"""Laptop onboarding workflow endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import OnboardingChecklistResponse, OnboardingStartRequest
from app.services.onboarding_service import complete_hardware_handoff, start_onboarding

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post(
    "/start",
    response_model=OnboardingChecklistResponse,
    summary="Start a new-hire laptop onboarding workflow",
    status_code=status.HTTP_201_CREATED,
)
async def start(payload: OnboardingStartRequest, session: AsyncSession = Depends(get_async_session)) -> OnboardingChecklistResponse:
    checklist = await start_onboarding(
        employee_id=payload.employee_id,
        employee_email=str(payload.employee_email),
        default_software=payload.default_software,
        session=session,
    )
    return OnboardingChecklistResponse(
        checklist_id=checklist.id,
        employee_id=checklist.employee_id,
        status=checklist.status,
        accounts_created=checklist.accounts_created,
        software_installed=checklist.software_installed,
        vpn_configured=checklist.vpn_configured,
        hardware_assigned=checklist.hardware_assigned,
        security_training_assigned=checklist.security_training_assigned,
        notes=checklist.notes,
    )


@router.post(
    "/{checklist_id}/hardware-handoff",
    response_model=OnboardingChecklistResponse,
    summary="Mark physical hardware handoff complete",
    status_code=status.HTTP_200_OK,
)
async def hardware_handoff(checklist_id: UUID, session: AsyncSession = Depends(get_async_session)) -> OnboardingChecklistResponse:
    checklist = await complete_hardware_handoff(checklist_id, session=session)
    return OnboardingChecklistResponse(
        checklist_id=checklist.id,
        employee_id=checklist.employee_id,
        status=checklist.status,
        accounts_created=checklist.accounts_created,
        software_installed=checklist.software_installed,
        vpn_configured=checklist.vpn_configured,
        hardware_assigned=checklist.hardware_assigned,
        security_training_assigned=checklist.security_training_assigned,
        notes=checklist.notes,
    )
