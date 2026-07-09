"""Notification service stubs for email and chat notifications."""

from __future__ import annotations

import json
import os

import httpx


async def send_notification(*, recipient: str, subject: str, message: str) -> None:
    """Record a mock notification for local development."""

    webhook = os.getenv("HELPDESK_TEAM_WEBHOOK")
    if webhook:
        payload = {"text": f"{subject}\n{message}", "recipient": recipient}
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                await client.post(webhook, json=payload)
        except Exception:
            pass

    _ = json.dumps({"recipient": recipient, "subject": subject, "message": message})
    return None
