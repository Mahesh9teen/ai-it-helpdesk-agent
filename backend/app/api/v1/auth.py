"""Authentication endpoints for access token issuance and user lookup."""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.core.security import create_access_token, decode_access_token, verify_password
from app.db.session import get_async_session
from app.schemas import AuthLoginRequest, AuthTokenResponse, CurrentUserResponse, MessageResponse
from app.services.employee_service import get_employee_by_email

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def _get_employee_from_token(token: str, session: AsyncSession):
    if not token:
        raise AppError("Missing bearer token", status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise AppError("Invalid token", status_code=status.HTTP_401_UNAUTHORIZED) from exc
    email = payload.get("sub")
    if not email:
        raise AppError("Invalid token", status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        return await get_employee_by_email(email, session=session)
    except AppError as exc:
        raise AppError("User not found", status_code=status.HTTP_401_UNAUTHORIZED) from exc


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="Authenticate a user and issue a JWT",
    status_code=status.HTTP_200_OK,
)
async def login(payload: AuthLoginRequest, session: AsyncSession = Depends(get_async_session)) -> AuthTokenResponse:
    """Authenticate a user with email and password."""

    try:
        employee = await get_employee_by_email(str(payload.email), session=session)
    except AppError as exc:
        raise AppError("Invalid credentials", status_code=status.HTTP_401_UNAUTHORIZED) from exc
    if not verify_password(payload.password, employee.hashed_password):
        raise AppError("Invalid credentials", status_code=status.HTTP_401_UNAUTHORIZED)
    token = create_access_token(employee.email, expires_delta=timedelta(minutes=60))
    return AuthTokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Return the current authenticated user",
    status_code=status.HTTP_200_OK,
)
async def me(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_async_session)) -> CurrentUserResponse:
    """Return the active user profile for the current request."""

    employee = await _get_employee_from_token(token, session)
    return CurrentUserResponse(user_id=employee.id, email=employee.email, full_name=employee.full_name, roles=[employee.role], is_active=employee.is_active)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Invalidate the current session",
    status_code=status.HTTP_200_OK,
)
async def logout(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_async_session)) -> MessageResponse:
    """Log the current user out of the active session."""

    await _get_employee_from_token(token, session)
    return MessageResponse(message="Logged out")
