"""Ticket category prediction using Ollama JSON output with taxonomy fallback."""

from __future__ import annotations

import json

import ollama

from app.config import get_settings

TICKET_TAXONOMY = ("Hardware", "Software", "Network", "Access/Identity", "Email", "Other")


def _fallback_category(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in ("vpn", "wifi", "wi-fi", "network", "lan", "internet")):
        return "Network"
    if any(token in lowered for token in ("outlook", "mail", "email", "inbox", "smtp")):
        return "Email"
    if any(token in lowered for token in ("password", "login", "account", "mfa", "access", "permission")):
        return "Access/Identity"
    if any(token in lowered for token in ("laptop", "keyboard", "screen", "battery", "mouse", "printer", "hardware")):
        return "Hardware"
    if any(token in lowered for token in ("software", "app", "application", "install", "update", "license")):
        return "Software"
    return "Other"


def classify_ticket_category(subject: str, description: str) -> str:
    """Classify a ticket into the fixed taxonomy."""

    settings = get_settings()
    prompt = (
        "Classify the IT helpdesk ticket into exactly one category from this list: "
        "Hardware, Software, Network, Access/Identity, Email, Other. "
        "Return strict JSON: {\"category\": \"<value>\"}.\n"
        f"Subject: {subject}\nDescription: {description}"
    )

    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        payload = response.get("message", {}).get("content", "{}")
        parsed = json.loads(payload)
        category = str(parsed.get("category", "")).strip()
        if category in TICKET_TAXONOMY:
            return category
    except Exception:
        pass

    return _fallback_category(f"{subject}\n{description}")
