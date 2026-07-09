"""Predictive monitoring endpoints for manual checks."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.services.monitoring_service import predictive_monitor

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.post("/check-now", status_code=status.HTTP_200_OK)
async def check_now() -> dict[str, object]:
    return await predictive_monitor.check_once()
