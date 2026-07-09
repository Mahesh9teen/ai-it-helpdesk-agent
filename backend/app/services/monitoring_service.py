"""Predictive incident monitor using mock metric streams."""

from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass
from datetime import UTC, datetime

from app.services.ticket_service import create_ticket


@dataclass(slots=True)
class MetricPoint:
    cpu_percent: float
    disk_percent: float
    network_mbps: float
    login_failures: int
    app_error_rate: float
    captured_at: datetime


class MetricsSource:
    async def read(self) -> MetricPoint:
        raise NotImplementedError


class MockMetricsSource(MetricsSource):
    def __init__(self) -> None:
        self._disk = random.uniform(60, 84)

    async def read(self) -> MetricPoint:
        self._disk = min(99.0, self._disk + random.uniform(0.2, 2.5))
        return MetricPoint(
            cpu_percent=round(random.uniform(20, 88), 2),
            disk_percent=round(self._disk, 2),
            network_mbps=round(random.uniform(50, 800), 2),
            login_failures=int(random.uniform(0, 8)),
            app_error_rate=round(random.uniform(0.01, 0.11), 4),
            captured_at=datetime.now(UTC),
        )


class PredictiveMonitor:
    def __init__(self, interval_seconds: int = 15, source: MetricsSource | None = None) -> None:
        self.interval_seconds = interval_seconds
        self.source = source or MockMetricsSource()
        self._task: asyncio.Task | None = None
        self._running = False
        self._last_disk: float | None = None

    def start(self) -> None:
        if self._task is not None and not self._task.done():
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        self._running = False
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _loop(self) -> None:
        while self._running:
            try:
                await self.check_once()
            except Exception:
                pass
            await asyncio.sleep(self.interval_seconds)

    async def check_once(self) -> dict[str, object]:
        point = await self.source.read()
        projected_hours = None
        if self._last_disk is not None and point.disk_percent > self._last_disk:
            growth_per_interval = point.disk_percent - self._last_disk
            if growth_per_interval > 0:
                intervals_to_95 = max(0.0, (95.0 - point.disk_percent) / growth_per_interval)
                projected_hours = round((intervals_to_95 * self.interval_seconds) / 3600.0, 2)

        self._last_disk = point.disk_percent

        if projected_hours is not None and projected_hours <= 6:
            ticket = await create_ticket(
                employee_id=None,
                requester_email="monitoring@company.com",
                subject="Predicted Incident: Disk saturation risk",
                description=(
                    f"Disk at {point.disk_percent}% with projected outage in {projected_hours} hours. "
                    "Tagged as Predicted Incident for proactive action."
                ),
                category="predicted_incident",
                priority="high",
            )
            return {"created_ticket_id": str(ticket.id), "disk_percent": point.disk_percent, "projected_hours": projected_hours}

        return {"created_ticket_id": None, "disk_percent": point.disk_percent, "projected_hours": projected_hours}


predictive_monitor = PredictiveMonitor()
