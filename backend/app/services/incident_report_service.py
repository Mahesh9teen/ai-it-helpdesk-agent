"""Major incident report generation and export helpers."""

from __future__ import annotations

import io
from uuid import UUID, uuid4

import ollama
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.exceptions import AppError
from app.models import IncidentReport, Ticket
from app.services.db import managed_session


def _fallback_markdown(ticket: Ticket) -> str:
    return (
        f"# Incident Report - {ticket.subject}\n\n"
        f"## Summary\nTicket {ticket.id} in category {ticket.category} was handled as a major incident.\n\n"
        f"## Timeline\n{ticket.resolution_timeline or 'Timeline not available.'}\n\n"
        f"## Root Cause\nTBD\n\n"
        f"## Impact\nAffected users/systems pending confirmation.\n\n"
        f"## Resolution Steps\n{ticket.summary or 'See ticket notes.'}\n\n"
        f"## Preventive Actions\nDocument runbooks and monitoring alerts for recurrence prevention.\n"
    )


def _minimal_pdf_from_text(text: str) -> bytes:
    escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    stream = f"BT /F1 10 Tf 50 780 Td ({escaped[:2000]}) Tj ET"
    pdf = (
        "%PDF-1.4\n"
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n"
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        f"5 0 obj << /Length {len(stream)} >> stream\n{stream}\nendstream endobj\n"
        "xref\n0 6\n0000000000 65535 f \n"
        "trailer << /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF"
    )
    return pdf.encode("latin-1", errors="ignore")


async def generate_incident_report(ticket_id: UUID, session: AsyncSession | None = None) -> IncidentReport:
    async with managed_session(session) as (db, should_commit):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            raise AppError("Ticket not found", status_code=404)

        existing = await db.scalar(select(IncidentReport).where(IncidentReport.ticket_id == ticket_id))
        if existing is not None:
            return existing

        settings = get_settings()
        prompt = (
            "Create a structured post-incident report in markdown with sections: "
            "Summary, Timeline, Root Cause, Impact, Resolution Steps, Recommended Preventive Action.\n"
            f"Ticket Subject: {ticket.subject}\n"
            f"Description: {ticket.description}\n"
            f"Category: {ticket.category}\n"
            f"Priority: {ticket.priority}\n"
            f"Status: {ticket.status}\n"
            f"Timeline: {ticket.resolution_timeline}\n"
        )

        markdown = ""
        try:
            response = ollama.chat(model=settings.ollama_model_name, messages=[{"role": "user", "content": prompt}])
            markdown = response.get("message", {}).get("content", "").strip()
        except Exception:
            markdown = ""

        if not markdown:
            markdown = _fallback_markdown(ticket)

        report = IncidentReport(id=uuid4(), ticket_id=ticket_id, markdown_content=markdown, summary=ticket.summary)
        db.add(report)
        if should_commit:
            await db.commit()
            await db.refresh(report)
        return report


async def export_incident_markdown(ticket_id: UUID, session: AsyncSession | None = None) -> str:
    async with managed_session(session) as (db, _):
        report = await db.scalar(select(IncidentReport).where(IncidentReport.ticket_id == ticket_id))
        if report is None:
            raise AppError("Incident report not found", status_code=404)
        return report.markdown_content


async def export_incident_pdf(ticket_id: UUID, session: AsyncSession | None = None) -> bytes:
    markdown = await export_incident_markdown(ticket_id, session=session)
    return _minimal_pdf_from_text(markdown)
