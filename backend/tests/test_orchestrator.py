"""Unit tests for deterministic routing in the helpdesk orchestrator."""

from __future__ import annotations

import asyncio
from uuid import uuid4

import app.agent.orchestrator as orchestrator_module
from app.agent.orchestrator import AgentOrchestrator, ExtractionResult, IntentClassification


def _run(coro):
    return asyncio.run(coro)


def test_rule_classifier_password_reset() -> None:
    agent = AgentOrchestrator()

    result = agent.classify_intent("Please reset my password right now")

    assert result.intent == "PASSWORD_RESET"
    assert result.confidence >= 0.9


def test_llm_classifier_fallback_when_rules_do_not_match(monkeypatch) -> None:
    agent = AgentOrchestrator()

    def fake_chat(**_: object) -> dict[str, object]:
        return {
            "message": {
                "content": '{"intent":"SMALL_TALK","confidence":0.72,"rationale":"social greeting"}'
            }
        }

    monkeypatch.setattr(orchestrator_module.ollama, "chat", fake_chat)

    result = agent.classify_intent("Hope your day is going well")

    assert result.intent == "SMALL_TALK"
    assert result.confidence == 0.72


def test_process_message_clarification_then_escalation(monkeypatch) -> None:
    agent = AgentOrchestrator()
    session_id = str(uuid4())

    monkeypatch.setattr(
        agent,
        "classify_intent",
        lambda _: IntentClassification(intent="SOFTWARE_REQUEST", confidence=0.95, rationale="forced"),
    )

    monkeypatch.setattr(
        agent,
        "_extract_entities",
        lambda **_: ExtractionResult(employee_id=None, software_name=None),
    )

    async def fake_escalate(_: str, __: str) -> str:
        return "I am escalating this to a human support agent. Escalation ID: test-id."

    monkeypatch.setattr(agent, "_escalate", fake_escalate)

    first = _run(agent.process_message(session_id=session_id, message="Please install software", employee_id=None))
    second = _run(agent.process_message(session_id=session_id, message="still waiting", employee_id=None))
    third = _run(agent.process_message(session_id=session_id, message="this still fails", employee_id=None))

    assert first.intent == "SOFTWARE_REQUEST"
    assert "software name" in first.response.lower()
    assert second.intent == "SOFTWARE_REQUEST"
    assert third.intent == "ESCALATE"


def test_tool_failure_routes_to_escalation(monkeypatch) -> None:
    agent = AgentOrchestrator()

    monkeypatch.setattr(
        agent,
        "_extract_entities",
        lambda **_: ExtractionResult(ticket_description="VPN fails", category="network", priority="high"),
    )

    async def broken_ticket_tool(*_: object, **__: object) -> dict[str, object]:
        raise RuntimeError("db down")

    async def fake_escalate(_: str, __: str) -> str:
        return "I am escalating this to a human support agent. Escalation ID: fallback-id."

    monkeypatch.setattr(orchestrator_module, "create_ticket_tool", broken_ticket_tool)
    monkeypatch.setattr(agent, "_escalate", fake_escalate)

    result = _run(agent.process_message(session_id=uuid4(), message="raise a ticket for VPN", employee_id=uuid4()))

    assert result.intent == "ESCALATE"
    assert "escalating" in result.response.lower()
