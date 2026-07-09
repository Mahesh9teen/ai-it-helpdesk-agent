"""Tool functions the agent can invoke to complete helpdesk actions."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from langchain_core.tools import StructuredTool, Tool

from app.agent.automation_matrix import TaskType, get_automation_policy
from app.rag.retriever import RAGChain
from app.services.approval_service import create_pending_approval_request

rag_chain = RAGChain()


async def _approval_gate(
    *,
    task_type: TaskType,
    tool_name: str,
    employee_id: UUID | None,
    payload: dict[str, Any],
) -> dict[str, object] | None:
    policy = get_automation_policy(task_type)
    if not policy.requires_approval:
        return None

    request = await create_pending_approval_request(
        task_type=task_type,
        policy=policy,
        tool_name=tool_name,
        requested_by_employee_id=employee_id,
        payload=payload,
    )
    return {
        "status": "pending_approval",
        "approval_request_id": str(request.id),
        "task_type": task_type.value,
        "message": "Approval is required before this action can be executed.",
    }


async def reset_password_tool(employee_id: UUID | None) -> str:
    from app.services.password_reset_service import initiate_password_reset
    from app.services.employee_service import get_employee_by_id

    if employee_id is None:
        return "I need an authenticated session to start a password reset."

    gate = await _approval_gate(
        task_type=TaskType.PASSWORD_RESET,
        tool_name="reset_password_tool",
        employee_id=employee_id,
        payload={"employee_id": str(employee_id)},
    )
    if gate is not None:
        return gate["message"]

    try:
        employee = await get_employee_by_id(employee_id)
    except Exception:
        return "I could not find your employee account. I can escalate this to IT support."
    await initiate_password_reset(employee.email)
    return (
        "I initiated a secure password reset for your registered account.\n"
        "1. Check your registered email for the reset link or one-time token.\n"
        "2. Verify the request on the official reset screen.\n"
        "3. Set a new password directly in that secure screen.\n"
        "4. Do not share passwords or tokens with anyone, including support."
    )


async def get_leave_balance_tool(employee_id: UUID | None) -> dict[str, object]:
    from app.services.leave_service import get_leave_balance as load_leave_balance

    if employee_id is None:
        return {"message": "I need an authenticated session to look up leave balance."}

    gate = await _approval_gate(
        task_type=TaskType.LEAVE_BALANCE,
        tool_name="get_leave_balance_tool",
        employee_id=employee_id,
        payload={"employee_id": str(employee_id)},
    )
    if gate is not None:
        return gate

    balance = await load_leave_balance(employee_id)
    return {
        "employee_id": str(balance.employee_id),
        "casual_leave_days": balance.casual_leave_days,
        "sick_leave_days": balance.sick_leave_days,
        "earned_leave_days": balance.earned_leave_days,
        "carried_over_days": balance.carried_over_days,
        "as_of": balance.as_of.isoformat(),
    }


async def create_ticket_tool(employee_id: UUID | None, category: str, description: str, priority: str) -> dict[str, object]:
    from app.services.ticket_service import create_ticket as create_ticket_record
    from app.services.kb_suggestion_service import get_ticket_suggestions

    suggestions = get_ticket_suggestions(description)
    if suggestions:
        return {
            "status": "try_first",
            "suggestions": [
                {"source": item.source, "snippet": item.snippet, "score": item.score}
                for item in suggestions[:2]
            ],
        }

    gate = await _approval_gate(
        task_type=TaskType.TICKET_CREATION,
        tool_name="create_ticket_tool",
        employee_id=employee_id,
        payload={
            "employee_id": str(employee_id) if employee_id else None,
            "category": category,
            "description": description,
            "priority": priority,
        },
    )
    if gate is not None:
        return gate

    ticket = await create_ticket_record(
        employee_id=employee_id,
        requester_email=None,
        subject=category.replace("_", " ").title(),
        description=description,
        category=category,
        priority=priority,
    )
    return {
        "ticket_id": str(ticket.id),
        "status": ticket.status,
        "sla_hours": ticket.sla_hours,
        "category": ticket.category,
        "priority": ticket.priority,
        "summary": ticket.summary,
        "assigned_agent_id": str(ticket.assigned_agent_id) if ticket.assigned_agent_id else None,
    }


async def software_request_tool(employee_id: UUID | None, software_name: str, justification: str) -> dict[str, object]:
    from app.services.software_request_service import create_software_request as create_software_request_record

    gate = await _approval_gate(
        task_type=TaskType.INSTALL_SOFTWARE,
        tool_name="software_request_tool",
        employee_id=employee_id,
        payload={
            "employee_id": str(employee_id) if employee_id else None,
            "software_name": software_name,
            "justification": justification,
        },
    )
    if gate is not None:
        return gate

    request = await create_software_request_record(
        employee_id=employee_id,
        requester_email=None,
        software_name=software_name,
        justification=justification,
        business_impact="standard",
    )
    return {"request_id": str(request.id), "status": request.status, "note": request.note}


async def faq_rag_tool(query: str) -> dict[str, object]:
    gate = await _approval_gate(
        task_type=TaskType.FAQ_RAG,
        tool_name="faq_rag_tool",
        employee_id=None,
        payload={"query": query},
    )
    if gate is not None:
        return gate

    stream, source_documents = rag_chain.answer(query, memory=[])
    response = "".join(list(stream))
    return {
        "response": response,
        "sources": [document.metadata.get("source_filename") for document in source_documents],
    }


async def start_onboarding_tool(employee_id: UUID, employee_email: str, default_software: list[str] | None = None) -> dict[str, object]:
    from app.services.onboarding_service import start_onboarding

    gate = await _approval_gate(
        task_type=TaskType.LAPTOP_SETUP,
        tool_name="start_onboarding_tool",
        employee_id=employee_id,
        payload={
            "employee_id": str(employee_id),
            "employee_email": employee_email,
            "default_software": default_software or [],
        },
    )
    if gate is not None:
        return gate

    checklist = await start_onboarding(
        employee_id=employee_id,
        employee_email=employee_email,
        default_software=default_software or ["Microsoft 365", "Visual Studio Code", "Slack"],
    )
    return {
        "checklist_id": str(checklist.id),
        "status": checklist.status,
        "accounts_created": checklist.accounts_created,
        "software_installed": checklist.software_installed,
        "hardware_assigned": checklist.hardware_assigned,
    }


async def vpn_diagnostics_tool(step: int = 0, response: str | None = None) -> dict[str, object]:
    from app.services.diagnostics_service import run_vpn_diagnostic_step

    result = run_vpn_diagnostic_step(step, response)
    return {
        "issue_type": result.issue_type,
        "step": result.step,
        "question": result.question,
        "recommendation": result.recommendation,
        "resolved": result.resolved,
        "escalate": result.escalate,
        "final_reason": result.final_reason,
    }


async def outlook_diagnostics_tool(step: int = 0, response: str | None = None) -> dict[str, object]:
    from app.services.diagnostics_service import run_outlook_diagnostic_step

    result = run_outlook_diagnostic_step(step, response)
    return {
        "issue_type": result.issue_type,
        "step": result.step,
        "question": result.question,
        "recommendation": result.recommendation,
        "resolved": result.resolved,
        "escalate": result.escalate,
        "final_reason": result.final_reason,
    }


async def escalate_ticket_tool(ticket_id: UUID, reason: str = "User requested escalation") -> dict[str, object]:
    from app.services.escalation_service import maybe_escalate_ticket
    from app.services.ticket_service import get_ticket

    ticket = await get_ticket(ticket_id)
    escalation = await maybe_escalate_ticket(
        ticket=ticket,
        trigger="USER_REQUEST",
        context={"reason": reason},
    )
    if escalation is None:
        return {"status": "not_escalated", "reason": "No escalation needed"}
    return {"status": "escalated", "escalation_id": str(escalation.id), "ticket_id": str(ticket.id)}


async def sla_check_tool() -> dict[str, object]:
    from app.services.sla_service import check_sla_and_flag

    at_risk = await check_sla_and_flag()
    return {"at_risk_count": at_risk}


async def analytics_summary_tool() -> dict[str, object]:
    from app.services.analytics_service import analytics_summary

    return await analytics_summary()


async def generate_incident_report_tool(ticket_id: UUID) -> dict[str, object]:
    from app.services.incident_report_service import generate_incident_report

    report = await generate_incident_report(ticket_id)
    return {"ticket_id": str(report.ticket_id), "report_id": str(report.id), "summary": report.summary}


def build_langchain_tools() -> list[Tool | StructuredTool]:
    return [
        StructuredTool.from_function(coroutine=reset_password_tool, name="reset_password_tool", description="Initiate a secure password reset flow."),
        StructuredTool.from_function(coroutine=get_leave_balance_tool, name="get_leave_balance_tool", description="Return leave balance breakdown."),
        StructuredTool.from_function(coroutine=create_ticket_tool, name="create_ticket_tool", description="Create an IT support ticket."),
        StructuredTool.from_function(coroutine=software_request_tool, name="software_request_tool", description="Create a software request."),
        StructuredTool.from_function(coroutine=faq_rag_tool, name="faq_rag_tool", description="Answer policy questions from the knowledge base."),
        StructuredTool.from_function(coroutine=start_onboarding_tool, name="start_onboarding_tool", description="Start new-hire onboarding checklist automation."),
        StructuredTool.from_function(coroutine=vpn_diagnostics_tool, name="vpn_diagnostics_tool", description="Run VPN diagnostic decision tree workflow."),
        StructuredTool.from_function(coroutine=outlook_diagnostics_tool, name="outlook_diagnostics_tool", description="Run Outlook diagnostic decision tree workflow."),
        StructuredTool.from_function(coroutine=escalate_ticket_tool, name="escalate_ticket_tool", description="Escalate an issue to human support with context."),
        StructuredTool.from_function(coroutine=sla_check_tool, name="sla_check_tool", description="Run SLA monitor pass and return at-risk count."),
        StructuredTool.from_function(coroutine=analytics_summary_tool, name="analytics_summary_tool", description="Return top-line enterprise helpdesk analytics metrics."),
        StructuredTool.from_function(coroutine=generate_incident_report_tool, name="generate_incident_report_tool", description="Generate major incident postmortem report for a ticket."),
    ]
