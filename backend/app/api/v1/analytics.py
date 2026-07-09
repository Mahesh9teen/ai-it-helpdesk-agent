"""Analytics endpoints for enterprise dashboard views."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import (
    AnalyticsAskRequest,
    AnalyticsAskResponse,
    AnalyticsAgentPerformanceItem,
    AnalyticsAgentPerformanceResponse,
    AnalyticsCategoryItem,
    AnalyticsCategoryResponse,
    AnalyticsSummaryResponse,
    AnalyticsTrendItem,
    AnalyticsTrendResponse,
)
from app.services.analytics_service import analytics_agent_performance, analytics_by_category, analytics_summary, analytics_trend
from app.services.manager_agent_service import manager_answer

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse, status_code=status.HTTP_200_OK)
async def summary(session: AsyncSession = Depends(get_async_session)) -> AnalyticsSummaryResponse:
    data = await analytics_summary(session=session)
    return AnalyticsSummaryResponse(**data)


@router.get("/by-category", response_model=AnalyticsCategoryResponse, status_code=status.HTTP_200_OK)
async def by_category(session: AsyncSession = Depends(get_async_session)) -> AnalyticsCategoryResponse:
    items = await analytics_by_category(session=session)
    return AnalyticsCategoryResponse(items=[AnalyticsCategoryItem(**item) for item in items])


@router.get("/agent-performance", response_model=AnalyticsAgentPerformanceResponse, status_code=status.HTTP_200_OK)
async def agent_performance(session: AsyncSession = Depends(get_async_session)) -> AnalyticsAgentPerformanceResponse:
    items = await analytics_agent_performance(session=session)
    return AnalyticsAgentPerformanceResponse(items=[AnalyticsAgentPerformanceItem(**item) for item in items])


@router.get("/trend", response_model=AnalyticsTrendResponse, status_code=status.HTTP_200_OK)
async def trend(days: int = Query(default=14, ge=3, le=90), session: AsyncSession = Depends(get_async_session)) -> AnalyticsTrendResponse:
    items = await analytics_trend(days=days, session=session)
    return AnalyticsTrendResponse(items=[AnalyticsTrendItem(**item) for item in items])


@router.post("/ask", response_model=AnalyticsAskResponse, status_code=status.HTTP_200_OK)
async def ask(payload: AnalyticsAskRequest, session: AsyncSession = Depends(get_async_session)) -> AnalyticsAskResponse:
    result = await manager_answer(payload.question, session=session)
    return AnalyticsAskResponse(answer=result.answer, query_plan=result.query_plan, charts=result.charts)
