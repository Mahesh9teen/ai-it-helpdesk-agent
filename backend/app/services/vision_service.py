"""Screenshot understanding via local vision-capable Ollama models."""

from __future__ import annotations

import base64
import json

import ollama

from app.config import get_settings


def analyze_screenshot(image_bytes: bytes) -> dict[str, object]:
    settings = get_settings()
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    fallback = {
        "application": "unknown",
        "os": "unknown",
        "error_codes": [],
        "messages": ["Unable to parse screenshot with vision model; fallback context used."],
        "summary": "Screenshot analysis unavailable.",
    }

    for model in ("llava", "bakllava", settings.ollama_model_name):
        try:
            response = ollama.chat(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Extract visible app, OS, errors, and concise issue summary. "
                            "Return JSON fields: application, os, error_codes(list), messages(list), summary."
                        ),
                    },
                    {
                        "role": "user",
                        "content": "Analyze this screenshot for IT troubleshooting context.",
                        "images": [b64],
                    },
                ],
                format="json",
            )
            content = response.get("message", {}).get("content", "{}")
            payload = json.loads(content)
            if isinstance(payload, dict):
                return {
                    "application": str(payload.get("application") or "unknown"),
                    "os": str(payload.get("os") or "unknown"),
                    "error_codes": [str(item) for item in payload.get("error_codes") or []],
                    "messages": [str(item) for item in payload.get("messages") or []],
                    "summary": str(payload.get("summary") or ""),
                }
        except Exception:
            continue

    return fallback
