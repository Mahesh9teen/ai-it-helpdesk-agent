"""LangGraph multi-agent orchestration entrypoint."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal, TypedDict
from uuid import NAMESPACE_URL, UUID, uuid5

import ollama
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

from app.agent.memory import MemoryTurn, conversation_memory, normalize_session_id
from app.agent.tools import create_ticket_tool, faq_rag_tool, get_leave_balance_tool, reset_password_tool, software_request_tool
from app.config import get_settings
from app.services.automation_agent_service import execute_state_change
from app.services.device_health_service import get_device_health_client
from app.services.employee_profile_service import append_profile_issue, get_or_create_employee_profile
from app.services.manager_agent_service import manager_answer
from app.services.security_review_service import review_login_anomalies

Intent = Literal[
    "TICKET",
    "KNOWLEDGE",
    "DEVICE",
    "NETWORK",
    "SECURITY",
    "AUTOMATION",
    "MANAGER",
    "ESCALATE",
    "SMALL_TALK",
]

LegacyIntent = Literal[
    "PASSWORD_RESET",
    "LEAVE_BALANCE",
    "CREATE_TICKET",
    "SOFTWARE_REQUEST",
    "FAQ_RAG",
    "ESCALATE",
    "SMALL_TALK",
]


class IntentClassification(BaseModel):
    intent: LegacyIntent
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = ""


class ExtractionResult(BaseModel):
    employee_id: UUID | None = None
    ticket_description: str | None = None
    category: str | None = None
    priority: Literal["low", "medium", "high", "urgent"] | None = None
    software_name: str | None = None
    justification: str | None = None
    query: str | None = None
    reason: str | None = None


class AgentState(TypedDict):
    session_id: str
    message: str
    employee_id: UUID | None
    plan: list[str]
    step: int
    intent: str
    confidence: float
    response_chunks: list[str]
    sources: list[str]
    context: dict[str, object]


@dataclass(slots=True)
class AgentResult:
    session_id: str
    intent: str
    response: str
    confidence: float = 1.0
    sources: list[str] = field(default_factory=list)
    stream: list[str] = field(default_factory=list)


SYSTEM_PROMPTS = {
    "SupervisorAgent": "Route each user request to specialist agents and allow chaining when needed.",
    "TicketAgent": "Own ticket create/update/query operations.",
    "KnowledgeAgent": "Own RAG retrieval and KB search.",
    "DeviceAgent": "Own endpoint health checks via DeviceHealthClient.",
    "NetworkAgent": "Own VPN/Wi-Fi diagnostics.",
    "SecurityAgent": "Review login anomalies and always require human security review for lock actions.",
    "AutomationAgent": "Only execute state-changing actions and only when automation policy permits.",
    "ManagerAgent": "Meta-agent for analytics explanations from constrained query plans.",
}


def _contains_any(text: str, patterns: list[str]) -> bool:
    lowered = text.lower()
    return any(re.search(pattern, lowered) for pattern in patterns)


def _session_uuid(session_id: str) -> UUID:
    try:
        return UUID(session_id)
    except Exception:
        return uuid5(NAMESPACE_URL, session_id)


class AgentOrchestrator:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.graph = self._build_graph().compile()

    def _build_graph(self):
        graph = StateGraph(AgentState)
        graph.add_node("supervisor", self._supervisor_node)
        graph.add_node("ticket", self._ticket_node)
        graph.add_node("knowledge", self._knowledge_node)
        graph.add_node("device", self._device_node)
        graph.add_node("network", self._network_node)
        graph.add_node("security", self._security_node)
        graph.add_node("automation", self._automation_node)
        graph.add_node("manager", self._manager_node)
        graph.add_node("finish", self._finish_node)

        graph.set_entry_point("supervisor")
        graph.add_conditional_edges(
            "supervisor",
            self._route_next,
            {
                "ticket": "ticket",
                "knowledge": "knowledge",
                "device": "device",
                "network": "network",
                "security": "security",
                "automation": "automation",
                "manager": "manager",
                "finish": "finish",
            },
        )

        for node in ("ticket", "knowledge", "device", "network", "security", "automation", "manager"):
            graph.add_conditional_edges(
                node,
                self._route_next,
                {
                    "ticket": "ticket",
                    "knowledge": "knowledge",
                    "device": "device",
                    "network": "network",
                    "security": "security",
                    "automation": "automation",
                    "manager": "manager",
                    "finish": "finish",
                },
            )
        graph.add_edge("finish", END)
        return graph

    @staticmethod
    def _route_next(state: AgentState) -> str:
        if state["step"] >= len(state["plan"]):
            return "finish"
        return state["plan"][state["step"]]

    async def _supervisor_node(self, state: AgentState) -> AgentState:
        message = state["message"].lower()
        plan: list[str] = []
        intent: Intent = "SMALL_TALK"
        confidence = 0.72

        if _contains_any(message, [r"why are tickets", r"trend", r"analytics", r"dashboard"]):
            plan = ["knowledge"]
            intent = "KNOWLEDGE"
            confidence = 0.82
        elif _contains_any(message, [r"vpn", r"wifi", r"outlook", r"network"]):
            plan = ["network"]
            if _contains_any(message, [r"create ticket", r"raise ticket", r"log ticket"]):
                plan.append("ticket")
            if _contains_any(message, [r"kb", r"knowledge", r"article"]):
                plan.append("knowledge")
            intent = "NETWORK"
            confidence = 0.93
        elif _contains_any(message, [r"ticket", r"incident", r"status", r"close"]):
            plan = ["ticket"]
            intent = "TICKET"
            confidence = 0.92
        elif _contains_any(message, [r"policy", r"how do i", r"faq", r"knowledge"]):
            plan = ["knowledge"]
            intent = "KNOWLEDGE"
            confidence = 0.9
        elif _contains_any(message, [r"battery", r"disk", r"cpu", r"device", r"laptop"]):
            plan = ["device"]
            intent = "DEVICE"
            confidence = 0.9
        elif _contains_any(message, [r"failed login", r"impossible travel", r"security", r"suspicious"]):
            plan = ["security"]
            intent = "SECURITY"
            confidence = 0.92
        elif _contains_any(message, [r"restart", r"clear cache", r"install software", r"automate"]):
            plan = ["automation"]
            intent = "AUTOMATION"
            confidence = 0.88

        # LLM nudge for ambiguity.
        if not plan:
            try:
                response = ollama.chat(
                    model=self.settings.ollama_model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPTS["SupervisorAgent"]},
                        {"role": "user", "content": state["message"]},
                    ],
                )
                text = response.get("message", {}).get("content", "")
                if "ticket" in text.lower():
                    plan = ["ticket"]
                    intent = "TICKET"
                    confidence = 0.65
                else:
                    plan = ["knowledge"]
                    intent = "KNOWLEDGE"
                    confidence = 0.61
            except Exception:
                plan = ["knowledge"]
                intent = "KNOWLEDGE"
                confidence = 0.58

        # Pull digital twin context for all downstream agents.
        profile_payload: dict[str, object] = {}
        if state["employee_id"] is not None:
            profile = await get_or_create_employee_profile(state["employee_id"])
            profile_payload = {
                "device_model": profile.device_model,
                "os_name": profile.os_name,
                "department": profile.department,
                "resolution_preference": profile.resolution_preference,
                "preferred_language": profile.preferred_language,
            }

        state["plan"] = plan
        state["intent"] = intent
        state["confidence"] = confidence
        state["context"] = {"profile": profile_payload}
        state["step"] = 0
        return state

    async def _ticket_node(self, state: AgentState) -> AgentState:
        employee_id = state["employee_id"]
        result = await create_ticket_tool(
            employee_id=employee_id,
            category="network" if "vpn" in state["message"].lower() else "general",
            description=state["message"],
            priority="high" if "urgent" in state["message"].lower() else "medium",
        )
        if result.get("status") == "try_first":
            chunk = "TicketAgent: KB suggestions found before ticket creation."
        elif result.get("status") == "pending_approval":
            chunk = f"TicketAgent: action pending approval ({result.get('approval_request_id')})."
        else:
            chunk = f"TicketAgent: created ticket {result.get('ticket_id')}."
        state["response_chunks"].append(chunk)
        if result.get("ticket_id"):
            state["sources"].append(str(result["ticket_id"]))
        state["step"] += 1
        return state

    async def _knowledge_node(self, state: AgentState) -> AgentState:
        answer = await faq_rag_tool(state["message"])
        response = str(answer.get("response") or answer.get("message") or "No KB match found.")
        state["response_chunks"].append(f"KnowledgeAgent: {response}")
        state["sources"].extend([str(item) for item in answer.get("sources") or [] if item])
        state["step"] += 1
        return state

    async def _device_node(self, state: AgentState) -> AgentState:
        employee_id = state["employee_id"]
        if employee_id is None:
            state["response_chunks"].append("DeviceAgent: employee ID required to inspect endpoint health.")
            state["step"] += 1
            return state
        client = get_device_health_client()
        snapshot = await client.get_health(employee_id)
        state["response_chunks"].append(
            "DeviceAgent: "
            f"CPU {snapshot.cpu_percent}%, disk {snapshot.disk_percent}%, battery {snapshot.battery_percent}% ({snapshot.health_status})."
        )
        await append_profile_issue(employee_id, f"Device health check: {snapshot.health_status}")
        state["step"] += 1
        return state

    async def _network_node(self, state: AgentState) -> AgentState:
        message = state["message"].lower()
        if "vpn" in message:
            question = "Check VPN credentials and client version."
            state["response_chunks"].append(f"NetworkAgent: {question}")
        elif "outlook" in message or "email" in message:
            state["response_chunks"].append("NetworkAgent: Check mailbox quota and Outlook profile integrity.")
        else:
            state["response_chunks"].append("NetworkAgent: Run Wi-Fi reset and DNS validation path.")
        state["step"] += 1
        return state

    async def _security_node(self, state: AgentState) -> AgentState:
        review = await review_login_anomalies(state["employee_id"])
        if review["requires_human_review"]:
            state["response_chunks"].append(
                "SecurityAgent: suspicious login patterns detected; queued for human security review "
                f"(approval request {review.get('approval_request_id')})."
            )
        else:
            state["response_chunks"].append("SecurityAgent: no high-risk anomalies detected.")
        state["step"] += 1
        return state

    async def _automation_node(self, state: AgentState) -> AgentState:
        message = state["message"].lower()
        if "install" in message and "software" in message:
            task_type = "INSTALL_SOFTWARE"
            from app.agent.automation_matrix import TaskType

            result = await execute_state_change(
                task_type=TaskType.INSTALL_SOFTWARE,
                action_name="automation_install_software",
                reason="Supervisor delegated automation",
                ticket_id=None,
                employee_id=state["employee_id"],
                payload={"software_name": "Postman"},
            )
        elif "password" in message and "reset" in message:
            from app.agent.automation_matrix import TaskType

            result = await execute_state_change(
                task_type=TaskType.PASSWORD_RESET,
                action_name="automation_password_reset",
                reason="Supervisor delegated automation",
                ticket_id=None,
                employee_id=state["employee_id"],
                payload={"email": state["context"].get("profile", {}).get("email")},
            )
            task_type = "PASSWORD_RESET"
        else:
            from app.agent.automation_matrix import TaskType

            result = await execute_state_change(
                task_type=TaskType.VPN_ISSUES,
                action_name="automation_restart_service",
                reason="Supervisor delegated automation",
                ticket_id=None,
                employee_id=state["employee_id"],
                payload={"service": "vpn-client"},
            )
            task_type = "VPN_ISSUES"

        state["response_chunks"].append(f"AutomationAgent ({task_type}): {result.message}.")
        state["step"] += 1
        return state

    async def _manager_node(self, state: AgentState) -> AgentState:
        result = await manager_answer(state["message"])
        state["response_chunks"].append(f"ManagerAgent: {result.answer}")
        state["context"]["charts"] = result.charts
        state["context"]["query_plan"] = result.query_plan
        state["step"] += 1
        return state

    async def _finish_node(self, state: AgentState) -> AgentState:
        return state

    def draw_mermaid(self) -> str:
        return self.graph.get_graph().draw_mermaid()

    def classify_intent(self, message: str) -> IntentClassification:
        lowered = message.lower()
        if re.search(r"\b(reset|forgot|change).{0,20}\bpassword\b|\bcan't log in\b", lowered):
            return IntentClassification(intent="PASSWORD_RESET", confidence=0.98, rationale="password rule")
        if re.search(r"\b(leave balance|pto balance|vacation balance|sick leave|earned leave)\b", lowered):
            return IntentClassification(intent="LEAVE_BALANCE", confidence=0.96, rationale="leave rule")
        if re.search(r"\b(raise|open|create|log).{0,15}\bticket\b|\breport (an )?issue\b", lowered):
            return IntentClassification(intent="CREATE_TICKET", confidence=0.96, rationale="ticket rule")
        if re.search(r"\b(install|request|get).{0,25}\b(software|license|application|app)\b", lowered):
            return IntentClassification(intent="SOFTWARE_REQUEST", confidence=0.96, rationale="software rule")
        if re.search(r"\b(escalate|supervisor|manager|human agent)\b", lowered):
            return IntentClassification(intent="ESCALATE", confidence=0.99, rationale="escalation rule")
        if re.search(r"\b(hi|hello|thanks|thank you|good morning|good afternoon)\b", lowered):
            return IntentClassification(intent="SMALL_TALK", confidence=0.86, rationale="small-talk rule")

        try:
            response = ollama.chat(
                model=self.settings.ollama_model_name,
                messages=[
                    {"role": "system", "content": "Classify to PASSWORD_RESET, LEAVE_BALANCE, CREATE_TICKET, SOFTWARE_REQUEST, FAQ_RAG, ESCALATE, SMALL_TALK and return JSON."},
                    {"role": "user", "content": message},
                ],
                format="json",
            )
            return IntentClassification.model_validate_json(response.get("message", {}).get("content", "{}"))
        except Exception:
            return IntentClassification(intent="FAQ_RAG", confidence=0.45, rationale="fallback")

    def _extract_entities(
        self,
        *,
        intent: str,
        message: str,
        employee_id: UUID | None,
        session_id: str,
    ) -> ExtractionResult:
        _ = (intent, session_id)
        data = {
            "employee_id": employee_id,
            "ticket_description": message,
            "query": message,
            "justification": message,
        }
        return ExtractionResult.model_validate(data)

    async def _escalate(self, session_id: str, reason: str) -> str:
        _ = (_session_uuid(session_id), reason)
        return "I am escalating this to a human support agent. Escalation ID: auto-generated."

    def _clarification_prompt(self, intent: str) -> str:
        if intent == "SOFTWARE_REQUEST":
            return "Please share the software name and a short business justification so I can submit the request."
        if intent == "CREATE_TICKET":
            return "Please share a brief issue description so I can create a support ticket."
        return "Please share a bit more detail so I can proceed."

    @staticmethod
    def _requires_clarification(intent: str, entities: ExtractionResult, original_message: str) -> bool:
        if intent == "SOFTWARE_REQUEST":
            return not bool((entities.software_name or "").strip())
        if intent == "CREATE_TICKET":
            content = (entities.ticket_description or original_message or "").strip()
            return len(content) < 6
        return False

    async def _run_legacy_intent(
        self,
        *,
        intent: str,
        message: str,
        employee_id: UUID | None,
        entities: ExtractionResult,
        session_id: str,
    ) -> tuple[str, list[str]]:
        if intent == "PASSWORD_RESET":
            return await reset_password_tool(employee_id), []
        if intent == "LEAVE_BALANCE":
            payload = await get_leave_balance_tool(employee_id)
            if "message" in payload:
                return str(payload["message"]), []
            return (
                f"Casual: {payload['casual_leave_days']} days, Sick: {payload['sick_leave_days']} days, "
                f"Earned: {payload['earned_leave_days']} days.",
                [],
            )
        if intent == "CREATE_TICKET":
            result = await create_ticket_tool(
                employee_id or entities.employee_id,
                entities.category or "general",
                entities.ticket_description or message,
                entities.priority or "medium",
            )
            if result.get("status") == "try_first":
                return "Try this first before opening a ticket.", []
            return f"Ticket {result['ticket_id']} created.", [str(result.get("ticket_id"))]
        if intent == "SOFTWARE_REQUEST":
            result = await software_request_tool(
                employee_id or entities.employee_id,
                entities.software_name or "",
                entities.justification or message,
            )
            if result.get("status") == "pending_approval":
                return "This software action needs approval before execution.", []
            return f"Software request submitted. Request ID: {result['request_id']}", []
        if intent == "FAQ_RAG":
            result = await faq_rag_tool(entities.query or message)
            return str(result.get("response") or result.get("message") or "No answer available."), [str(item) for item in result.get("sources") or []]
        if intent == "ESCALATE":
            return await self._escalate(session_id, entities.reason or "User requested escalation"), []
        return "How can I help with IT support today?", []

    async def process_message(self, session_id: UUID | str, message: str, employee_id: UUID | None = None) -> AgentResult:
        normalized_session_id = normalize_session_id(session_id)

        classification = self.classify_intent(message)
        entities = self._extract_entities(
            intent=classification.intent,
            message=message,
            employee_id=employee_id,
            session_id=normalized_session_id,
        )

        if self._requires_clarification(classification.intent, entities, message):
            loops = conversation_memory.increment_clarification(normalized_session_id)
            if loops >= 3:
                response = await self._escalate(normalized_session_id, "Repeated clarification failure")
                intent = "ESCALATE"
                confidence = 1.0
                sources: list[str] = []
            else:
                response = self._clarification_prompt(classification.intent)
                intent = classification.intent
                confidence = classification.confidence
                sources = []

            conversation_memory.append_turn(normalized_session_id, MemoryTurn(user_message=message, assistant_message=response, intent=intent))
            return AgentResult(
                session_id=normalized_session_id,
                intent=intent,
                response=response,
                confidence=confidence,
                sources=sources,
            )

        if classification.intent in {"PASSWORD_RESET", "LEAVE_BALANCE", "CREATE_TICKET", "SOFTWARE_REQUEST", "FAQ_RAG", "ESCALATE"}:
            try:
                response, sources = await self._run_legacy_intent(
                    intent=classification.intent,
                    message=message,
                    employee_id=employee_id,
                    entities=entities,
                    session_id=normalized_session_id,
                )
                intent = classification.intent
                confidence = classification.confidence
                conversation_memory.reset_clarification(normalized_session_id)
            except Exception:
                intent = "ESCALATE"
                confidence = 1.0
                response = await self._escalate(normalized_session_id, "Automated tool execution failed")
                sources = []

            conversation_memory.append_turn(normalized_session_id, MemoryTurn(user_message=message, assistant_message=response, intent=intent))
            return AgentResult(
                session_id=normalized_session_id,
                intent=intent,
                response=response,
                confidence=confidence,
                sources=sources,
            )

        initial_state: AgentState = {
            "session_id": normalized_session_id,
            "message": message,
            "employee_id": employee_id,
            "plan": [],
            "step": 0,
            "intent": "KNOWLEDGE",
            "confidence": 0.5,
            "response_chunks": [],
            "sources": [],
            "context": {},
        }
        final_state = await self.graph.ainvoke(initial_state)

        response = "\n".join(final_state.get("response_chunks") or ["How can I help with IT support today?"])
        intent = str(final_state.get("intent") or "KNOWLEDGE")
        confidence = float(final_state.get("confidence") or 0.5)
        sources = [str(item) for item in final_state.get("sources") or []]

        conversation_memory.set_last_entities(
            normalized_session_id,
            {
                "employee_id": str(employee_id) if employee_id else None,
                "intent": intent,
                "last_updated": datetime.now(UTC).isoformat(),
            },
        )
        conversation_memory.append_turn(
            normalized_session_id,
            MemoryTurn(user_message=message, assistant_message=response, intent=intent),
        )

        return AgentResult(
            session_id=normalized_session_id,
            intent=intent,
            response=response,
            confidence=confidence,
            sources=sources,
        )


orchestrator = AgentOrchestrator()
