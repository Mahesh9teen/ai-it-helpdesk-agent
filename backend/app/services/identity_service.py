"""Identity provider abstraction for password reset workflows."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from typing import Protocol

import httpx
import msal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.exceptions import AppError
from app.core.security import hash_password
from app.models import Employee
from app.services.db import managed_session


@dataclass(slots=True)
class PasswordResetSession:
    token: str
    employee_email: str
    otp: str
    expires_at: datetime


class IdentityProvider(Protocol):
    async def initiate_password_reset(self, employee: Employee) -> PasswordResetSession: ...
    async def verify_password_reset(self, token: str, otp: str, new_password: str) -> None: ...


_RESET_SESSIONS: dict[str, PasswordResetSession] = {}


class MockIdentityProvider:
    """Default provider for local demo. Simulates OTP and reset."""

    async def initiate_password_reset(self, employee: Employee) -> PasswordResetSession:
        token = token_urlsafe(24)
        otp = f"{abs(hash(employee.email + token)) % 1000000:06d}"
        session = PasswordResetSession(
            token=token,
            employee_email=employee.email,
            otp=otp,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=20),
        )
        _RESET_SESSIONS[token] = session
        return session

    async def verify_password_reset(self, token: str, otp: str, new_password: str) -> None:
        session = _RESET_SESSIONS.get(token)
        if session is None:
            raise AppError("Invalid reset token", status_code=400)
        if session.expires_at < datetime.now(timezone.utc):
            raise AppError("Reset token expired", status_code=400)
        if session.otp != otp:
            raise AppError("Invalid OTP", status_code=400)

        async with managed_session(None) as (db, should_commit):
            result = await db.execute(select(Employee).where(Employee.email == session.employee_email))
            employee = result.scalar_one_or_none()
            if employee is None:
                raise AppError("Account not found", status_code=404)
            employee.hashed_password = hash_password(new_password)
            if should_commit:
                await db.commit()

        _RESET_SESSIONS.pop(token, None)


class AzureADIdentityProvider:
    """Stubbed Azure AD provider.

    Requires real tenant credentials + admin consent. Not enabled by default.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.enabled = settings.azuread_enabled
        self.tenant_id = settings.azuread_tenant_id
        self.client_id = settings.azuread_client_id
        self.client_secret = settings.azuread_client_secret
        self.scope = [settings.azuread_graph_scope]

    def _acquire_graph_token(self) -> str:
        if not self.enabled:
            raise AppError("Azure AD provider disabled. Enable AZUREAD_ENABLED for tenant-backed reset.", status_code=400)
        if not all([self.tenant_id, self.client_id, self.client_secret]):
            raise AppError("Azure AD credentials are not configured.", status_code=500)

        authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        app = msal.ConfidentialClientApplication(
            client_id=self.client_id,
            authority=authority,
            client_credential=self.client_secret,
        )
        token = app.acquire_token_for_client(scopes=self.scope)
        access_token = token.get("access_token")
        if not access_token:
            raise AppError("Unable to acquire Microsoft Graph access token.", status_code=500)
        return access_token

    async def initiate_password_reset(self, employee: Employee) -> PasswordResetSession:
        token = self._acquire_graph_token()
        endpoint = f"https://graph.microsoft.com/v1.0/users/{employee.id}/authentication/methods"
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(endpoint, headers={"Authorization": f"Bearer {token}"})
            if response.status_code >= 400:
                raise AppError("Azure AD lookup failed. Requires real tenant credentials + admin consent.", status_code=502)

        session = PasswordResetSession(
            token=token_urlsafe(24),
            employee_email=employee.email,
            otp="000000",
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        )
        _RESET_SESSIONS[session.token] = session
        return session

    async def verify_password_reset(self, token: str, otp: str, new_password: str) -> None:
        session = _RESET_SESSIONS.get(token)
        if session is None:
            raise AppError("Invalid reset token", status_code=400)
        if session.expires_at < datetime.now(timezone.utc):
            raise AppError("Reset token expired", status_code=400)
        if otp != session.otp:
            raise AppError("Invalid OTP", status_code=400)

        raise AppError(
            "Azure AD password reset execution is intentionally stubbed. "
            "Requires real tenant credentials + admin consent and Graph write scopes.",
            status_code=501,
        )


def get_identity_provider() -> IdentityProvider:
    settings = get_settings()
    if settings.identity_provider.lower() == "azuread":
        return AzureADIdentityProvider()
    return MockIdentityProvider()


async def initiate_password_reset_for_email(email: str, session: AsyncSession | None = None) -> PasswordResetSession:
    async with managed_session(session) as (db, _):
        result = await db.execute(select(Employee).where(Employee.email == email.lower()))
        employee = result.scalar_one_or_none()
        if employee is None:
            raise AppError("Account not found", status_code=404)

    provider = get_identity_provider()
    return await provider.initiate_password_reset(employee)


async def verify_password_reset_token(token: str, otp: str, new_password: str) -> None:
    provider = get_identity_provider()
    await provider.verify_password_reset(token, otp, new_password)
