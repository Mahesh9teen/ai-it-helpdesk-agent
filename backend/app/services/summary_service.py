"""Ticket summary generation for list and timeline views."""

from __future__ import annotations

import json
from datetime import UTC, datetime

import ollama

from app.config import get_settings
from app.models import Ticket


def _fallback_summary(ticket: Ticket) -> str:
    return (
        f"{ticket.subject} is currently {ticket.status} with {ticket.priority} priority "
        f"in category {ticket.category}."
    )


def generate_ticket_summary(ticket: Ticket, event: str) -> str:
    """Generate a concise 1-2 sentence summary for a ticket event."""

    settings = get_settings()
    prompt = (
        "Write a concise 1-2 sentence IT helpdesk ticket summary. "
        "Return strict JSON {\"summary\": \"...\"}.\n"
        f"Subject: {ticket.subject}\n"
        f"Description: {ticket.description}\n"
        f"Category: {ticket.category}\n"
        f"Priority: {ticket.priority}\n"
        f"Status: {ticket.status}\n"
        f"Event: {event}\n"
    )

    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        payload = response.get("message", {}).get("content", "{}")
        parsed = json.loads(payload)
        summary = str(parsed.get("summary", "")).strip()
        if summary:
            return summary
    except Exception:
        pass
    return _fallback_summary(ticket)


def append_timeline_event(existing_timeline: str | None, event: str) -> str:
    """Append a timestamped event to the ticket resolution timeline."""

    timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")
    entry = f"{timestamp}: {event}"
    if not existing_timeline:
        return entry
    return f"{existing_timeline}\n{entry}"
