"""Auto-generate KB articles from resolved tickets and incrementally add to FAISS."""

from __future__ import annotations

import json
from pathlib import Path

import ollama
from langchain_core.documents import Document
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import Ticket
from app.rag.vector_store import add_documents_incremental
from app.services.db import managed_session


async def maybe_build_article_from_ticket(ticket: Ticket, session: AsyncSession | None = None) -> dict[str, object]:
    settings = get_settings()
    should_publish = ticket.status == "resolved" and bool(ticket.resolution_timeline)
    if not should_publish:
        return {"published": False, "reason": "ticket_not_resolved"}

    prompt = {
        "ticket": {
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "summary": ticket.summary,
            "timeline": ticket.resolution_timeline,
        },
        "task": "Decide if this is reusable as KB and produce JSON with fields: publish(bool), problem, symptoms, root_cause, resolution_steps(list), applies_to(list)",
    }

    response_payload = {
        "publish": True,
        "problem": ticket.subject,
        "symptoms": ticket.description,
        "root_cause": ticket.category,
        "resolution_steps": ["Follow documented remediation", "Validate service restored"],
        "applies_to": [ticket.category or "general"],
    }
    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[
                {"role": "system", "content": "Return JSON only."},
                {"role": "user", "content": json.dumps(prompt)},
            ],
            format="json",
        )
        response_payload = json.loads(response.get("message", {}).get("content", "{}")) or response_payload
    except Exception:
        pass

    if not bool(response_payload.get("publish", False)):
        return {"published": False, "reason": "llm_rejected"}

    article_text = "\n".join(
        [
            f"# {response_payload.get('problem', ticket.subject)}",
            f"Symptoms: {response_payload.get('symptoms', ticket.description)}",
            f"Root cause: {response_payload.get('root_cause', ticket.category)}",
            "Resolution steps:",
            *[f"- {step}" for step in (response_payload.get("resolution_steps") or ["Investigate and remediate"])],
            f"Applies to: {', '.join(response_payload.get('applies_to') or ['general'])}",
        ]
    )

    doc = Document(
        page_content=article_text,
        metadata={
            "source": f"generated/ticket-{ticket.id}.md",
            "source_filename": f"ticket-{ticket.id}.md",
            "category": ticket.category or "general",
            "header": response_payload.get("problem", ticket.subject),
            "last_updated": str(ticket.updated_at.date() if ticket.updated_at else ""),
        },
    )
    await add_documents_incremental([doc])
    return {"published": True, "source_filename": doc.metadata["source_filename"]}


async def maybe_build_article_for_ticket_id(ticket_id, session: AsyncSession | None = None) -> dict[str, object]:
    async with managed_session(session) as (db, _):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            return {"published": False, "reason": "ticket_not_found"}
        return await maybe_build_article_from_ticket(ticket, session=db)
