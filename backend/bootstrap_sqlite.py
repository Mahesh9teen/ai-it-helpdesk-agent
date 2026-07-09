from __future__ import annotations

import asyncio

from app.db.seed_data import seed_demo_data
from app.db.session import get_async_session_factory
from app.models import Base


async def main() -> None:
    session_factory = get_async_session_factory()
    engine = session_factory.kw["bind"]
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    await seed_demo_data()
    await engine.dispose()
    print("db-ready")


if __name__ == "__main__":
    asyncio.run(main())
