"""Unit tests for automation-policy approval gates in agent tools."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from uuid import uuid4

import app.agent.tools as tools_module
from app.agent.automation_matrix import AutomationLevel, AutomationPolicy
import app.services.employee_service as employee_service
import app.services.leave_service as leave_service
import app.services.password_reset_service as password_reset_service
import app.services.software_request_service as software_request_service
import app.services.ticket_service as ticket_service


def _run(coro):
    return asyncio.run(coro)


def _should_not_execute(*args, **kwargs):
    raise AssertionError("Tool implementation should not run when approval is required")


async def _should_not_execute_async(*args, **kwargs):
    raise AssertionError("Tool implementation should not run when approval is required")


def test_every_tool_respects_approval_gate(monkeypatch) -> None:
    captured_tasks: list[str] = []

    def fake_get_automation_policy(task_type):
        captured_tasks.append(task_type.value)
        return AutomationPolicy(
            automation_level=AutomationLevel.ASSISTED,
            requires_approval=True,
            systems_touched=("Identity System",),
            notes="approval required",
        )

    async def fake_create_pending_approval_request(**kwargs):
        return SimpleNamespace(id=uuid4(), **kwargs)

    monkeypatch.setattr(tools_module, "get_automation_policy", fake_get_automation_policy)
    monkeypatch.setattr(tools_module, "create_pending_approval_request", fake_create_pending_approval_request)

    monkeypatch.setattr(employee_service, "get_employee_by_id", _should_not_execute_async)
    monkeypatch.setattr(password_reset_service, "initiate_password_reset", _should_not_execute_async)
    monkeypatch.setattr(leave_service, "get_leave_balance", _should_not_execute_async)
    monkeypatch.setattr(ticket_service, "create_ticket", _should_not_execute_async)
    monkeypatch.setattr(software_request_service, "create_software_request", _should_not_execute_async)
    monkeypatch.setattr(software_request_service, "list_software_catalog", _should_not_execute_async)
    monkeypatch.setattr(tools_module.rag_chain, "answer", _should_not_execute)

    employee_id = uuid4()

    reset_result = _run(tools_module.reset_password_tool(employee_id))
    leave_result = _run(tools_module.get_leave_balance_tool(employee_id))
    ticket_result = _run(tools_module.create_ticket_tool(employee_id, "network", "VPN keeps dropping", "high"))
    software_result = _run(tools_module.software_request_tool(employee_id, "Postman", "API testing workflow"))
    rag_result = _run(tools_module.faq_rag_tool("How does password reset work?"))

    assert "Approval is required" in reset_result
    assert leave_result["status"] == "pending_approval"
    assert ticket_result["status"] == "pending_approval"
    assert software_result["status"] == "pending_approval"
    assert rag_result["status"] == "pending_approval"

    assert set(captured_tasks) == {
        "password_reset",
        "leave_balance",
        "ticket_creation",
        "install_software",
        "faq_rag",
    }
