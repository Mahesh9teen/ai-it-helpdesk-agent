"""Leave balance and history endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import LeaveBalanceResponse, LeaveHistoryItemResponse, LeaveHistoryResponse
from app.services.leave_service import get_leave_balance, get_leave_history

router = APIRouter(prefix="/leave", tags=["Leave"])


@router.get(
    "/balance/{employee_id}",
    response_model=LeaveBalanceResponse,
    summary="Get the current leave balance",
    status_code=status.HTTP_200_OK,
)
async def balance(employee_id: UUID, session: AsyncSession = Depends(get_async_session)) -> LeaveBalanceResponse:
    """Return the employee leave balance."""

    balance_record = await get_leave_balance(employee_id, session=session)
    return LeaveBalanceResponse(
        employee_id=balance_record.employee_id,
        casual_leave_days=balance_record.casual_leave_days,
        sick_leave_days=balance_record.sick_leave_days,
        earned_leave_days=balance_record.earned_leave_days,
        carried_over_days=balance_record.carried_over_days,
        as_of=balance_record.as_of,
    )


@router.get(
    "/history/{employee_id}",
    response_model=LeaveHistoryResponse,
    summary="Get leave history",
    status_code=status.HTTP_200_OK,
)
async def history(employee_id: UUID, session: AsyncSession = Depends(get_async_session)) -> LeaveHistoryResponse:
    """Return leave history for an employee."""

    records = await get_leave_history(employee_id, session=session)
    return LeaveHistoryResponse(
        employee_id=employee_id,
        history=[
            LeaveHistoryItemResponse(
                history_id=record.id,
                leave_type=record.leave_type,
                start_date=record.start_date,
                end_date=record.end_date,
                days=record.days,
                status=record.status,
                reason=record.reason,
            )
            for record in records
        ],
    )
