"""Conversation memory abstractions keyed by session ID."""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from threading import RLock
from typing import Any, Protocol
from uuid import UUID


@dataclass(slots=True)
class MemoryTurn:
    user_message: str
    assistant_message: str
    intent: str | None = None


class ConversationMemoryBackend(Protocol):
    """Redis-ready memory backend interface."""

    def append_turn(self, session_id: str, turn: MemoryTurn) -> None: ...

    def get_recent_turns(self, session_id: str, limit: int = 3) -> list[MemoryTurn]: ...

    def increment_clarification(self, session_id: str) -> int: ...

    def reset_clarification(self, session_id: str) -> None: ...

    def clarification_count(self, session_id: str) -> int: ...

    def resolved_intents(self, session_id: str, limit: int = 10) -> list[str]: ...

    def set_last_entities(self, session_id: str, entities: dict[str, Any]) -> None: ...

    def get_last_entities(self, session_id: str) -> dict[str, Any]: ...


@dataclass(slots=True)
class SessionState:
    turns: deque[MemoryTurn]
    resolved_intents: deque[str]
    clarification_loops: int = 0
    last_entities: dict[str, Any] | None = None


class InMemoryConversationMemory:
    """Thread-safe in-memory session store used for local development."""

    def __init__(self, max_turns: int = 25) -> None:
        self._max_turns = max_turns
        self._sessions: dict[str, SessionState] = defaultdict(
            lambda: SessionState(turns=deque(maxlen=max_turns), resolved_intents=deque(maxlen=max_turns))
        )
        self._lock = RLock()

    def _session(self, session_id: str) -> SessionState:
        return self._sessions[session_id]

    def append_turn(self, session_id: str, turn: MemoryTurn) -> None:
        with self._lock:
            session = self._session(session_id)
            session.turns.append(turn)
            if turn.intent:
                session.resolved_intents.append(turn.intent)

    def get_recent_turns(self, session_id: str, limit: int = 3) -> list[MemoryTurn]:
        with self._lock:
            turns = list(self._session(session_id).turns)
        return turns[-limit:]

    def increment_clarification(self, session_id: str) -> int:
        with self._lock:
            session = self._session(session_id)
            session.clarification_loops += 1
            return session.clarification_loops

    def reset_clarification(self, session_id: str) -> None:
        with self._lock:
            self._session(session_id).clarification_loops = 0

    def clarification_count(self, session_id: str) -> int:
        with self._lock:
            return self._session(session_id).clarification_loops

    def resolved_intents(self, session_id: str, limit: int = 10) -> list[str]:
        with self._lock:
            intents = list(self._session(session_id).resolved_intents)
        return intents[-limit:]

    def set_last_entities(self, session_id: str, entities: dict[str, Any]) -> None:
        with self._lock:
            self._session(session_id).last_entities = dict(entities)

    def get_last_entities(self, session_id: str) -> dict[str, Any]:
        with self._lock:
            entities = self._session(session_id).last_entities or {}
        return dict(entities)


def normalize_session_id(session_id: str | UUID | None) -> str:
    return str(session_id or "anonymous")


conversation_memory = InMemoryConversationMemory()
