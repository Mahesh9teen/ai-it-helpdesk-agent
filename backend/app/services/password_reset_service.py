"""Password reset support helpers using pluggable identity providers."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.notification_service import send_notification
from app.services.identity_service import initiate_password_reset_for_email, verify_password_reset_token


async def initiate_password_reset(email: str, session: AsyncSession | None = None) -> str:
    reset_session = await initiate_password_reset_for_email(email, session=session)
    await send_notification(
        recipient=reset_session.employee_email,
        subject="Password reset request",
        message=(
            f"Use reset token: {reset_session.token}\n"
            f"One-time OTP: {reset_session.otp}\n"
            "This is a simulated OTP flow in mock identity mode."
        ),
    )
    return reset_session.token


async def verify_password_reset(token: str, otp: str, new_password: str, session: AsyncSession | None = None) -> None:
    _ = session
    await verify_password_reset_token(token, otp, new_password)
