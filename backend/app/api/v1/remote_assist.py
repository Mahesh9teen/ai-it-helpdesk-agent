"""Strict approval-based remote assistant endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import RemoteAssistProposeRequest, RemoteAssistResponse
from app.services.remote_assistant_service import approve_action, execute_approved_action, propose_action

router = APIRouter(prefix="/remote-assist", tags=["Remote Assist"])


@router.post("", response_model=RemoteAssistResponse, status_code=status.HTTP_201_CREATED)
async def propose(payload: RemoteAssistProposeRequest, session: AsyncSession = Depends(get_async_session)) -> RemoteAssistResponse:
    action = await propose_action(
        ticket_id=payload.ticket_id,
        requested_by_employee_id=payload.employee_id,
        script_name=payload.script_name,
        session=session,
    )
    return RemoteAssistResponse(
        action_id=action.id,
        status=action.status,
        script_name=action.script_name,
        plan=action.plain_english_plan,
        execution_log=action.execution_log,
    )


@router.post("/{action_id}/approve", response_model=RemoteAssistResponse, status_code=status.HTTP_200_OK)
async def approve(action_id: UUID, session: AsyncSession = Depends(get_async_session)) -> RemoteAssistResponse:
    action = await approve_action(action_id, session=session)
    return RemoteAssistResponse(
        action_id=action.id,
        status=action.status,
        script_name=action.script_name,
        plan=action.plain_english_plan,
        execution_log=action.execution_log,
    )


@router.post("/{action_id}/execute", response_model=RemoteAssistResponse, status_code=status.HTTP_200_OK)
async def execute(action_id: UUID, session: AsyncSession = Depends(get_async_session)) -> RemoteAssistResponse:
    action = await execute_approved_action(action_id, session=session)
    return RemoteAssistResponse(
        action_id=action.id,
        status=action.status,
        script_name=action.script_name,
        plan=action.plain_english_plan,
        execution_log=action.execution_log,
    )
