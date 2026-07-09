"""Software catalog and request helpers."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.agent.automation_matrix import TaskType, get_automation_policy
from app.models import SoftwareCatalogItem, SoftwareRequest
from app.services.approval_service import create_pending_approval_request
from app.services.db import managed_session
from app.services.device_management_service import get_device_management_client


async def list_software_catalog(session: AsyncSession | None = None) -> list[SoftwareCatalogItem]:
    async with managed_session(session) as (db, _):
        result = await db.execute(select(SoftwareCatalogItem).order_by(SoftwareCatalogItem.software_name.asc()))
        return list(result.scalars().all())


async def create_software_request(
    *,
    employee_id: UUID | None,
    requester_email: str | None,
    software_name: str,
    justification: str,
    business_impact: str,
    session: AsyncSession | None = None,
) -> SoftwareRequest:
    async with managed_session(session) as (db, should_commit):
        result = await db.execute(
            select(SoftwareCatalogItem).where(SoftwareCatalogItem.software_name.ilike(software_name))
        )
        catalog_match = result.scalar_one_or_none()

        note = None
        status = "requested"

        if catalog_match is not None and catalog_match.is_preapproved and not catalog_match.approval_required:
            client = get_device_management_client()
            install_job = await client.push_install(employee_id=employee_id, software_name=software_name)
            status = "approved"
            note = f"Auto-approved pre-approved software. Device push job: {install_job.job_id} ({install_job.status})."
        else:
            policy = get_automation_policy(TaskType.INSTALL_SOFTWARE)
            approval = await create_pending_approval_request(
                task_type=TaskType.INSTALL_SOFTWARE,
                policy=policy,
                tool_name="software_request_service.create_software_request",
                requested_by_employee_id=employee_id,
                payload={
                    "software_name": software_name,
                    "justification": justification,
                    "business_impact": business_impact,
                    "requester_email": requester_email,
                },
                session=db,
            )
            note = f"Software requires human approval. Approval request ID: {approval.id}."
            status = "under_review"

        request = SoftwareRequest(
            id=uuid4(),
            employee_id=employee_id,
            requester_email=requester_email,
            software_name=software_name,
            justification=justification,
            business_impact=business_impact,
            status=status,
            note=note,
            catalog_item_id=catalog_match.id if catalog_match else None,
        )
        db.add(request)
        if should_commit:
            await db.commit()
            await db.refresh(request)
        else:
            await db.flush()
        return request


async def get_software_request(request_id: UUID, session: AsyncSession | None = None) -> SoftwareRequest:
    async with managed_session(session) as (db, _):
        request = await db.get(SoftwareRequest, request_id)
        if request is None:
            raise AppError("Software request not found", status_code=404)
        return request
