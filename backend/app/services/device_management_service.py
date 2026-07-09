"""Device management interface for software push installs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol
from uuid import UUID, uuid4


@dataclass(slots=True)
class DeviceInstallJob:
    job_id: str
    status: str
    note: str | None = None


class DeviceManagementClient(Protocol):
    async def push_install(self, *, employee_id: UUID | None, software_name: str) -> DeviceInstallJob: ...


class MockDeviceManagementClient:
    async def push_install(self, *, employee_id: UUID | None, software_name: str) -> DeviceInstallJob:
        _ = employee_id
        return DeviceInstallJob(
            job_id=f"mock-install-{uuid4()}",
            status="queued",
            note=f"Simulated Intune/SCCM install push for {software_name}",
        )


def get_device_management_client() -> DeviceManagementClient:
    return MockDeviceManagementClient()
