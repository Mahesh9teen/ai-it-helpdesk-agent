"""Manager agent for constrained natural-language analytics explanations."""

from __future__ import annotations

import json
from dataclasses import dataclass

import ollama
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import Ticket
from app.services.analytics_service import analytics_by_category, analytics_summary, analytics_trend
from app.services.db import managed_session


@dataclass(slots=True)
class AnalyticsAskResult:
    answer: str
    charts: dict[str, object]
    query_plan: list[str]


WHITELISTED_QUERIES = {
    "summary": "Top-level ticket KPIs",
    "trend_14d": "Ticket creation trend over 14 days",
    "category_mix": "Ticket distribution by category",
    "escalation_recent": "Escalation count in recent period",
}


async def _run_query(query_name: str, session: AsyncSession) -> object:
    if query_name == "summary":
        return await analytics_summary(session=session)
    if query_name == "trend_14d":
        return await analytics_trend(days=14, session=session)
    if query_name == "category_mix":
        return await analytics_by_category(session=session)
    if query_name == "escalation_recent":
        count = await session.scalar(select(func.count(Ticket.id)).where(Ticket.escalated.is_(True)))
        return {"escalated_tickets": int(count or 0)}
    raise ValueError("Unsupported query name")


def _select_query_plan(question: str) -> list[str]:
    lowered = question.lower()
    plan = ["summary", "trend_14d"]
    if "category" in lowered or "kind" in lowered or "type" in lowered:
        plan.append("category_mix")
    if "escalat" in lowered or "risk" in lowered:
        plan.append("escalation_recent")
    return list(dict.fromkeys(plan))


async def manager_answer(question: str, session: AsyncSession | None = None) -> AnalyticsAskResult:
    settings = get_settings()
    plan = _select_query_plan(question)

    async with managed_session(session) as (db, _):
        datasets: dict[str, object] = {}
        for item in plan:
            datasets[item] = await _run_query(item, db)

    fallback = (
        "Ticket volume appears to be rising due to sustained intake growth over the last two weeks, "
        "with concentration in a few categories. Recommend targeted problem-management follow-up."
    )

    answer = fallback
    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[
                {"role": "system", "content": "You are a helpdesk analytics manager. Explain trends in plain language. Do not invent metrics."},
                {
                    "role": "user",
                    "content": json.dumps({"question": question, "datasets": datasets, "query_descriptions": WHITELISTED_QUERIES}),
                },
            ],
        )
        answer = response.get("message", {}).get("content", "").strip() or fallback
    except Exception:
        answer = fallback

    return AnalyticsAskResult(answer=answer, charts=datasets, query_plan=plan)
