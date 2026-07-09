"""Utilities for managing SQLAlchemy sessions in service functions."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session_factory


@asynccontextmanager
async def managed_session(session: AsyncSession | None = None) -> AsyncIterator[tuple[AsyncSession, bool]]:
    """Yield a session and whether the caller should commit it."""

    if session is not None:
        yield session, False
        return

    session_factory = get_async_session_factory()
    async with session_factory() as owned_session:
        yield owned_session, True
