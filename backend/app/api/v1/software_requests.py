"""Software request intake and status endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas import SoftwareCatalogResponse, SoftwareCatalogItemResponse, SoftwareRequestCreateRequest, SoftwareRequestResponse, SoftwareRequestStatusResponse
from app.services.software_request_service import create_software_request, get_software_request, list_software_catalog

router = APIRouter(prefix="/software", tags=["Software Requests"])


@router.get(
    "/catalog",
    response_model=SoftwareCatalogResponse,
    summary="Get the approved software catalog",
    status_code=status.HTTP_200_OK,
)
async def catalog(session: AsyncSession = Depends(get_async_session)) -> SoftwareCatalogResponse:
    """Return the pre-approved software catalog."""

    items = await list_software_catalog(session=session)
    return SoftwareCatalogResponse(
        items=[
            SoftwareCatalogItemResponse(
                item_id=item.id,
                software_name=item.software_name,
                description=item.description,
                is_preapproved=item.is_preapproved,
                approval_required=item.approval_required,
                category=item.category,
            )
            for item in items
        ]
    )


@router.post(
    "/request",
    response_model=SoftwareRequestResponse,
    summary="Submit a software request",
    status_code=status.HTTP_201_CREATED,
)
async def request(payload: SoftwareRequestCreateRequest, session: AsyncSession = Depends(get_async_session)) -> SoftwareRequestResponse:
    """Create a software procurement or access request."""

    record = await create_software_request(
        employee_id=payload.employee_id,
        requester_email=str(payload.requester_email) if payload.requester_email else None,
        software_name=payload.software_name,
        justification=payload.justification,
        business_impact=payload.business_impact,
        session=session,
    )
    return SoftwareRequestResponse(
        request_id=record.id,
        status=record.status,
        software_name=record.software_name,
        employee_id=record.employee_id,
        requester_email=record.requester_email,
        created_at=record.created_at,
        note=record.note,
    )


@router.get(
    "/request/{request_id}/status",
    response_model=SoftwareRequestStatusResponse,
    summary="Get software request status",
    status_code=status.HTTP_200_OK,
)
async def request_status(request_id: UUID, session: AsyncSession = Depends(get_async_session)) -> SoftwareRequestStatusResponse:
    """Retrieve the status for a software request."""

    record = await get_software_request(request_id, session=session)
    return SoftwareRequestStatusResponse(request_id=record.id, status=record.status, note=record.note)
