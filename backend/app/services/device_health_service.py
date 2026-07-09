"""Device health interface used by DeviceAgent."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(slots=True)
class DeviceHealthSnapshot:
    employee_id: UUID
    cpu_percent: float
    disk_percent: float
    battery_percent: float
    memory_percent: float
    health_status: str


class DeviceHealthClient(Protocol):
    async def get_health(self, employee_id: UUID) -> DeviceHealthSnapshot: ...


class MockDeviceHealthClient:
    async def get_health(self, employee_id: UUID) -> DeviceHealthSnapshot:
        cpu = round(random.uniform(15, 94), 2)
        disk = round(random.uniform(30, 97), 2)
        battery = round(random.uniform(8, 100), 2)
        memory = round(random.uniform(20, 90), 2)
        degraded = cpu > 85 or disk > 92 or battery < 15 or memory > 85
        return DeviceHealthSnapshot(
            employee_id=employee_id,
            cpu_percent=cpu,
            disk_percent=disk,
            battery_percent=battery,
            memory_percent=memory,
            health_status="degraded" if degraded else "healthy",
        )


def get_device_health_client() -> DeviceHealthClient:
    return MockDeviceHealthClient()
