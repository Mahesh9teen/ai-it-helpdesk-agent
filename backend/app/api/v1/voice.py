"""Voice help desk endpoints for local STT and TTS."""

from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.orchestrator import orchestrator
from app.db.session import get_async_session
from app.schemas import VoiceSpeakRequest, VoiceTranscribeResponse
from app.services.chat_service import append_chat_message, get_or_create_chat_session
from app.services.voice_service import synthesize_speech, transcribe_audio_file

router = APIRouter(prefix="/voice", tags=["Voice"])


@router.post("/transcribe", response_model=VoiceTranscribeResponse, status_code=status.HTTP_200_OK)
async def transcribe(
    audio: UploadFile = File(...),
    session_id: UUID | None = Form(default=None),
    employee_id: UUID | None = Form(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> VoiceTranscribeResponse:
    raw = await audio.read()
    transcript = await transcribe_audio_file(raw)
    if not transcript:
        transcript = "I could not transcribe that audio."

    session_key = str(session_id or uuid4())
    chat_session = await get_or_create_chat_session(session_key=session_key, employee_id=employee_id, session=session)
    await append_chat_message(chat_session_id=chat_session.id, role="user", content=transcript, session=session)
    result = await orchestrator.process_message(session_id=session_key, message=transcript, employee_id=employee_id)
    await append_chat_message(
        chat_session_id=chat_session.id,
        role="assistant",
        content=result.response,
        intent=result.intent,
        sources=result.sources,
        session=session,
    )
    return VoiceTranscribeResponse(transcript=transcript, response=result.response, intent=result.intent)


@router.post("/speak", status_code=status.HTTP_200_OK)
async def speak(payload: VoiceSpeakRequest) -> Response:
    audio = await synthesize_speech(payload.text)
    return Response(content=audio, media_type="audio/wav")
