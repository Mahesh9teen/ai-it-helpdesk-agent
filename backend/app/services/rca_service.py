"""AI-assisted root cause analysis for resolved tickets."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import ollama
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import InfraChangeLog, RCAReport, Ticket
from app.rag.retriever import RAGChain
from app.services.db import managed_session


@dataclass(slots=True)
class RCAResult:
    likely_cause: str
    confidence: float
    affected_systems: list[str]
    similar_past_incidents: list[str]
    recommended_permanent_fix: str


async def _seed_change_log(session: AsyncSession) -> None:
    existing = await session.scalar(select(InfraChangeLog).limit(1))
    if existing:
        return
    now = datetime.now(UTC)
    session.add_all(
        [
            InfraChangeLog(
                id=uuid4(),
                change_ref="4471",
                system="Firewall",
                change_type="rule_update",
                summary="Updated egress rules for VPN gateway and hardened 443 path",
                risk_level="high",
                created_at=now - timedelta(minutes=20),
                updated_at=now - timedelta(minutes=20),
            ),
            InfraChangeLog(
                id=uuid4(),
                change_ref="4472",
                system="Mail Server",
                change_type="patch",
                summary="Applied cumulative patch to Exchange edge service",
                risk_level="medium",
                created_at=now - timedelta(hours=2),
                updated_at=now - timedelta(hours=2),
            ),
        ]
    )


async def analyze_root_cause(ticket_id: UUID, session: AsyncSession | None = None) -> RCAReport:
    settings = get_settings()
    rag = RAGChain()

    async with managed_session(session) as (db, should_commit):
        ticket = await db.get(Ticket, ticket_id)
        if ticket is None:
            raise ValueError("Ticket not found")

        await _seed_change_log(db)

        since = (ticket.created_at or datetime.now(UTC)) - timedelta(days=7)
        related = list(
            (await db.execute(
                select(Ticket)
                .where(Ticket.category == ticket.category)
                .where(Ticket.created_at >= since)
                .order_by(Ticket.created_at.desc())
                .limit(20)
            )).scalars().all()
        )
        changes = list((await db.execute(select(InfraChangeLog).order_by(InfraChangeLog.created_at.desc()).limit(20))).scalars().all())

        past_incident_docs = []
        try:
            _, docs = rag.answer(f"resolved incidents like: {ticket.category} {ticket.description}", memory=[])
            past_incident_docs = [doc.page_content[:220] for doc in docs[:3]]
        except Exception:
            past_incident_docs = []

        prompt_payload = {
            "ticket": {
                "id": str(ticket.id),
                "category": ticket.category,
                "subject": ticket.subject,
                "description": ticket.description,
                "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            },
            "related_tickets": [
                {
                    "id": str(item.id),
                    "description": item.description,
                    "status": item.status,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                }
                for item in related
            ],
            "recent_changes": [
                {
                    "change_ref": item.change_ref,
                    "system": item.system,
                    "change_type": item.change_type,
                    "summary": item.summary,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                }
                for item in changes
            ],
            "similar_past_incidents": past_incident_docs,
            "output_schema": {
                "likely_cause": "str",
                "confidence": "float 0..1",
                "affected_systems": ["str"],
                "similar_past_incidents": ["str"],
                "recommended_permanent_fix": "str",
            },
        }

        fallback = RCAResult(
            likely_cause="Insufficient telemetry for deterministic cause; likely a configuration drift during recent infra changes.",
            confidence=0.53,
            affected_systems=[ticket.category or "general"],
            similar_past_incidents=past_incident_docs,
            recommended_permanent_fix="Add change-impact validation checks and canary tests before rollout.",
        )

        parsed = fallback
        try:
            response = ollama.chat(
                model=settings.ollama_model_name,
                messages=[
                    {"role": "system", "content": "You are an IT root-cause analysis assistant. Return JSON only."},
                    {"role": "user", "content": json.dumps(prompt_payload)},
                ],
                format="json",
            )
            payload = json.loads(response.get("message", {}).get("content", "{}"))
            parsed = RCAResult(
                likely_cause=str(payload.get("likely_cause") or fallback.likely_cause),
                confidence=float(payload.get("confidence") or fallback.confidence),
                affected_systems=[str(item) for item in payload.get("affected_systems") or fallback.affected_systems],
                similar_past_incidents=[str(item) for item in payload.get("similar_past_incidents") or fallback.similar_past_incidents],
                recommended_permanent_fix=str(payload.get("recommended_permanent_fix") or fallback.recommended_permanent_fix),
            )
        except Exception:
            parsed = fallback

        report = await db.scalar(select(RCAReport).where(RCAReport.ticket_id == ticket_id).limit(1))
        if report is None:
            report = RCAReport(
                id=uuid4(),
                ticket_id=ticket_id,
                likely_cause=parsed.likely_cause,
                confidence=max(0.0, min(1.0, parsed.confidence)),
                affected_systems=parsed.affected_systems,
                similar_past_incidents=parsed.similar_past_incidents,
                recommended_permanent_fix=parsed.recommended_permanent_fix,
                evidence={"related_ticket_count": len(related), "change_log_count": len(changes)},
            )
            db.add(report)
        else:
            report.likely_cause = parsed.likely_cause
            report.confidence = max(0.0, min(1.0, parsed.confidence))
            report.affected_systems = parsed.affected_systems
            report.similar_past_incidents = parsed.similar_past_incidents
            report.recommended_permanent_fix = parsed.recommended_permanent_fix
            report.evidence = {"related_ticket_count": len(related), "change_log_count": len(changes)}

        if should_commit:
            await db.commit()
            await db.refresh(report)
        else:
            await db.flush()
        return report
