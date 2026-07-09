"""Chat persistence helpers for sessions and message history."""

from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ChatMessage, ChatSession
from app.services.db import managed_session


async def get_or_create_chat_session(
    *,
    session_key: str,
    employee_id: UUID | None,
    session: AsyncSession | None = None,
) -> ChatSession:
    async with managed_session(session) as (db, should_commit):
        result = await db.execute(select(ChatSession).where(ChatSession.session_key == session_key))
        chat_session = result.scalar_one_or_none()
        if chat_session is None:
            chat_session = ChatSession(id=uuid4(), session_key=session_key, employee_id=employee_id)
            db.add(chat_session)
            if should_commit:
                await db.commit()
                await db.refresh(chat_session)
            else:
                await db.flush()
        return chat_session


async def append_chat_message(
    *,
    chat_session_id: UUID,
    role: str,
    content: str,
    intent: str | None = None,
    sources: list[str] | None = None,
    session: AsyncSession | None = None,
) -> ChatMessage:
    async with managed_session(session) as (db, should_commit):
        turn_index_result = await db.execute(
            select(ChatMessage.turn_index)
            .where(ChatMessage.session_id == chat_session_id)
            .order_by(ChatMessage.turn_index.desc())
            .limit(1)
        )
        last_index = turn_index_result.scalar_one_or_none()
        turn_index = (last_index + 1) if isinstance(last_index, int) else 1

        message = ChatMessage(
            id=uuid4(),
            session_id=chat_session_id,
            turn_index=turn_index,
            role=role,
            content=content,
            intent=intent,
            sources=sources or [],
        )
        db.add(message)
        if should_commit:
            await db.commit()
            await db.refresh(message)
        else:
            await db.flush()
        return message
