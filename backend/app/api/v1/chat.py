"""Chat endpoint that proxies to the helpdesk agent orchestrator."""

from __future__ import annotations

import json
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.orchestrator import orchestrator
from app.db.session import get_async_session
from app.schemas import ChatMessageRequest, ChatMessageResponse, MessageResponse, ScreenshotAnalysisResponse
from app.services.chat_service import append_chat_message, get_or_create_chat_session
from app.services.vision_service import analyze_screenshot

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    summary="Send a message to the helpdesk agent",
    status_code=status.HTTP_200_OK,
)
async def send_message(payload: ChatMessageRequest, session: AsyncSession = Depends(get_async_session)) -> ChatMessageResponse:
    """Accept a chat message and return the agent response."""

    session_key = str(payload.session_id or uuid4())
    chat_session = await get_or_create_chat_session(
        session_key=session_key,
        employee_id=payload.employee_id,
        session=session,
    )
    await append_chat_message(
        chat_session_id=chat_session.id,
        role="user",
        content=payload.message,
        session=session,
    )
    result = await orchestrator.process_message(
        session_id=session_key,
        message=payload.message,
        employee_id=payload.employee_id,
    )
    await append_chat_message(
        chat_session_id=chat_session.id,
        role="assistant",
        content=result.response,
        intent=result.intent,
        sources=result.sources,
        session=session,
    )
    return ChatMessageResponse(
        session_id=UUID(result.session_id),
        response=result.response,
        intent=result.intent,
        confidence=result.confidence,
        citations=result.sources,
    )


@router.get(
    "/stream",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Stream assistant response as server-sent events",
)
async def stream_message(
    message: str = Query(min_length=1),
    session_id: UUID | None = Query(default=None),
    employee_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    """Stream token-by-token chat responses for frontend consumption over SSE."""

    session_key = str(session_id or uuid4())
    chat_session = await get_or_create_chat_session(session_key=session_key, employee_id=employee_id, session=session)
    await append_chat_message(chat_session_id=chat_session.id, role="user", content=message, session=session)

    result = await orchestrator.process_message(session_id=session_key, message=message, employee_id=employee_id)
    await append_chat_message(
        chat_session_id=chat_session.id,
        role="assistant",
        content=result.response,
        intent=result.intent,
        sources=result.sources,
        session=session,
    )

    async def _event_stream():
        for token in result.response.split():
            payload = {"token": token, "intent": result.intent, "session_id": session_key}
            yield f"data: {json.dumps(payload)}\n\n"
        yield f"data: {json.dumps({'done': True, 'intent': result.intent, 'sources': result.sources, 'session_id': session_key})}\n\n"

    return StreamingResponse(_event_stream(), media_type="text/event-stream")


@router.post(
    "/upload-screenshot",
    response_model=ScreenshotAnalysisResponse,
    summary="Analyze uploaded screenshot and route extracted context through chat pipeline",
    status_code=status.HTTP_200_OK,
)
async def upload_screenshot(
    screenshot: UploadFile = File(...),
    message: str = Form(default="Please help analyze this screenshot issue."),
    session_id: UUID | None = Form(default=None),
    employee_id: UUID | None = Form(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> ScreenshotAnalysisResponse:
    raw = await screenshot.read()
    extracted = analyze_screenshot(raw)
    context_text = (
        f"Application: {extracted.get('application')}\n"
        f"OS: {extracted.get('os')}\n"
        f"Error codes: {', '.join(extracted.get('error_codes') or [])}\n"
        f"Messages: {' | '.join(extracted.get('messages') or [])}\n"
        f"Summary: {extracted.get('summary')}"
    )

    combined_message = f"{message}\n\nScreenshot context:\n{context_text}"
    session_key = str(session_id or uuid4())
    chat_session = await get_or_create_chat_session(session_key=session_key, employee_id=employee_id, session=session)
    await append_chat_message(chat_session_id=chat_session.id, role="user", content=combined_message, session=session)
    result = await orchestrator.process_message(session_id=session_key, message=combined_message, employee_id=employee_id)
    await append_chat_message(
        chat_session_id=chat_session.id,
        role="assistant",
        content=result.response,
        intent=result.intent,
        sources=result.sources,
        session=session,
    )
    return ScreenshotAnalysisResponse(
        session_id=UUID(result.session_id),
        extracted_context=context_text,
        response=result.response,
        intent=result.intent,
    )
