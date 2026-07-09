"""Async SQLAlchemy session configuration."""

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings

settings = get_settings()
engine: AsyncEngine | None = None
AsyncSessionFactory: async_sessionmaker[AsyncSession] | None = None


def get_async_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return a lazily initialized async session factory."""

    global engine, AsyncSessionFactory
    if AsyncSessionFactory is None:
        engine = create_async_engine(settings.database_url, pool_pre_ping=True)
        AsyncSessionFactory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    return AsyncSessionFactory


async def get_async_session() -> AsyncIterator[AsyncSession]:
    """Yield a database session for FastAPI dependencies."""

    session_factory = get_async_session_factory()
    async with session_factory() as session:
        yield session
