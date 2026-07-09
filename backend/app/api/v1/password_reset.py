"""Password reset workflow endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import MessageResponse, PasswordResetConfirmRequest, PasswordResetRequest, PasswordResetResponse
from app.services.password_reset_service import initiate_password_reset, verify_password_reset

router = APIRouter(prefix="/password-reset", tags=["Password Reset"])


@router.post(
    "/initiate",
    response_model=PasswordResetResponse,
    summary="Request a secure password reset",
    status_code=status.HTTP_202_ACCEPTED,
)
async def initiate(payload: PasswordResetRequest, session: AsyncSession = Depends(get_async_session)) -> PasswordResetResponse:
    """Start the password reset flow for a user account."""

    await initiate_password_reset(str(payload.email), session=session)
    return PasswordResetResponse(message="Password reset initiated. Check your registered email or SMS for secure steps.")


@router.post(
    "/verify",
    response_model=MessageResponse,
    summary="Verify a password reset token",
    status_code=status.HTTP_200_OK,
)
async def verify(payload: PasswordResetConfirmRequest, session: AsyncSession = Depends(get_async_session)) -> MessageResponse:
    """Finalize a password reset using the supplied token."""

    await verify_password_reset(payload.token, payload.otp, payload.new_password, session=session)
    return MessageResponse(message="Password reset verified")
