"""SLA policy endpoints and manual monitor execution."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import SLACheckResponse, SLAPolicyRequest, SLAPolicyResponse
from app.services.sla_service import check_sla_and_flag, list_sla_policies, upsert_sla_policy

router = APIRouter(prefix="/sla", tags=["SLA"])


@router.post("/policies", response_model=SLAPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_policy(payload: SLAPolicyRequest, session: AsyncSession = Depends(get_async_session)) -> SLAPolicyResponse:
    policy = await upsert_sla_policy(
        category=payload.category,
        priority=payload.priority,
        target_resolution_hours=payload.target_resolution_hours,
        auto_escalate_on_breach=payload.auto_escalate_on_breach,
        session=session,
    )
    return SLAPolicyResponse(
        policy_id=policy.id,
        category=policy.category,
        priority=policy.priority,
        target_resolution_hours=policy.target_resolution_hours,
        auto_escalate_on_breach=policy.auto_escalate_on_breach,
    )


@router.get("/policies", response_model=list[SLAPolicyResponse], status_code=status.HTTP_200_OK)
async def list_policies(session: AsyncSession = Depends(get_async_session)) -> list[SLAPolicyResponse]:
    items = await list_sla_policies(session=session)
    return [
        SLAPolicyResponse(
            policy_id=item.id,
            category=item.category,
            priority=item.priority,
            target_resolution_hours=item.target_resolution_hours,
            auto_escalate_on_breach=item.auto_escalate_on_breach,
        )
        for item in items
    ]


@router.post("/check-now", response_model=SLACheckResponse, status_code=status.HTTP_200_OK)
async def check_now(session: AsyncSession = Depends(get_async_session)) -> SLACheckResponse:
    at_risk = await check_sla_and_flag(session=session)
    return SLACheckResponse(at_risk_count=at_risk)
