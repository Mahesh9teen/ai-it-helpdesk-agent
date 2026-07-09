"""In-memory helpdesk store used by the services layer."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from typing import Any
from uuid import UUID, NAMESPACE_DNS, uuid4, uuid5

from app.core.security import hash_password


def _employee_id(email: str) -> UUID:
    return uuid5(NAMESPACE_DNS, email.lower())


@dataclass(slots=True)
class EmployeeRecord:
    id: UUID
    email: str
    hashed_password: str
    full_name: str
    department: str
    role: str = "employee"
    is_active: bool = True


@dataclass(slots=True)
class TicketRecord:
    id: UUID
    employee_id: UUID | None
    requester_email: str | None
    subject: str
    description: str
    category: str
    priority: str
    status: str = "new"
    sla_hours: int = 24
    escalated: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class LeaveBalanceRecord:
    employee_id: UUID
    casual_leave_days: float
    sick_leave_days: float
    earned_leave_days: float
    carried_over_days: float
    as_of: date


@dataclass(slots=True)
class LeaveHistoryRecord:
    id: UUID
    employee_id: UUID
    leave_type: str
    start_date: date
    end_date: date
    days: float
    status: str
    reason: str | None


@dataclass(slots=True)
class SoftwareCatalogRecord:
    id: UUID
    software_name: str
    description: str
    is_preapproved: bool
    approval_required: bool
    category: str


@dataclass(slots=True)
class SoftwareRequestRecord:
    id: UUID
    employee_id: UUID | None
    requester_email: str | None
    software_name: str
    justification: str
    business_impact: str
    status: str = "requested"
    note: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class ChatSessionRecord:
    id: UUID
    session_key: str
    employee_id: UUID | None
    last_intent: str | None = None
    clarification_loops: int = 0
    resolved_intents: list[str] = field(default_factory=list)
    is_escalated: bool = False


@dataclass(slots=True)
class ChatMessageRecord:
    id: UUID
    session_id: UUID
    turn_index: int
    role: str
    content: str
    intent: str | None = None
    sources: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class EscalationRecord:
    id: UUID
    session_id: UUID
    ticket_id: UUID | None
    reason: str
    status: str = "queued"
    assigned_to: str | None = None
    webhook_target: str | None = None
    webhook_status: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class PasswordResetRecord:
    token: str
    email: str
    expires_at: datetime
    verified: bool = False


@dataclass(slots=True)
class HelpdeskStore:
    employees: dict[UUID, EmployeeRecord] = field(default_factory=dict)
    tickets: dict[UUID, TicketRecord] = field(default_factory=dict)
    leave_balances: dict[UUID, LeaveBalanceRecord] = field(default_factory=dict)
    leave_history: dict[UUID, list[LeaveHistoryRecord]] = field(default_factory=dict)
    software_catalog: dict[UUID, SoftwareCatalogRecord] = field(default_factory=dict)
    software_requests: dict[UUID, SoftwareRequestRecord] = field(default_factory=dict)
    chat_sessions: dict[str, ChatSessionRecord] = field(default_factory=dict)
    chat_messages: list[ChatMessageRecord] = field(default_factory=list)
    escalations: dict[UUID, EscalationRecord] = field(default_factory=dict)
    password_resets: dict[str, PasswordResetRecord] = field(default_factory=dict)

    def seed_demo_data(self) -> None:
        self.employees.clear()
        self.tickets.clear()
        self.leave_balances.clear()
        self.leave_history.clear()
        self.software_catalog.clear()
        self.software_requests.clear()
        self.chat_sessions.clear()
        self.chat_messages.clear()
        self.escalations.clear()
        self.password_resets.clear()

        departments = ["IT", "HR", "Finance", "Operations", "Sales"]
        employees: list[EmployeeRecord] = []
        for index in range(20):
            email = f"employee{index + 1}@example.com"
            employee = EmployeeRecord(
                id=_employee_id(email),
                email=email,
                hashed_password=hash_password("Password123!"),
                full_name=f"Employee {index + 1}",
                department=departments[index % len(departments)],
            )
            employees.append(employee)
            self.employees[employee.id] = employee
            self.leave_balances[employee.id] = LeaveBalanceRecord(
                employee_id=employee.id,
                casual_leave_days=12 - (index % 3),
                sick_leave_days=10 - (index % 2),
                earned_leave_days=15 - (index % 4),
                carried_over_days=float(index % 2),
                as_of=date.today(),
            )
            self.leave_history[employee.id] = [
                LeaveHistoryRecord(
                    id=uuid4(),
                    employee_id=employee.id,
                    leave_type="casual",
                    start_date=date.today() - timedelta(days=14 + index),
                    end_date=date.today() - timedelta(days=12 + index),
                    days=2.0,
                    status="approved",
                    reason="Personal work",
                ),
                LeaveHistoryRecord(
                    id=uuid4(),
                    employee_id=employee.id,
                    leave_type="sick",
                    start_date=date.today() - timedelta(days=45 + index),
                    end_date=date.today() - timedelta(days=44 + index),
                    days=1.0,
                    status="approved",
                    reason="Medical appointment",
                ),
            ]

        catalog_items = [
            ("Microsoft 365", "Office productivity suite", True, False, "productivity"),
            ("Slack", "Team messaging platform", True, False, "communication"),
            ("Zoom", "Video conferencing", True, False, "communication"),
            ("Google Chrome", "Web browser", True, False, "browser"),
            ("Firefox", "Web browser", True, False, "browser"),
            ("Visual Studio Code", "Code editor", True, False, "development"),
            ("GitHub Desktop", "Git client", True, False, "development"),
            ("Postman", "API testing client", True, False, "development"),
            ("Adobe Acrobat", "PDF viewer and editor", True, False, "productivity"),
            ("Confluence", "Knowledge base and documentation", True, False, "knowledge"),
            ("Jira", "Project tracking", True, False, "project-management"),
            ("1Password", "Password management", True, False, "security"),
            ("Tableau", "Business intelligence", True, False, "analytics"),
            ("Figma", "Design collaboration", True, False, "design"),
            ("Python", "Runtime and interpreter package", True, False, "development"),
        ]
        for software_name, description, is_preapproved, approval_required, category in catalog_items:
            item = SoftwareCatalogRecord(
                id=uuid4(),
                software_name=software_name,
                description=description,
                is_preapproved=is_preapproved,
                approval_required=approval_required,
                category=category,
            )
            self.software_catalog[item.id] = item

        first_employee = employees[0]
        ticket = TicketRecord(
            id=uuid4(),
            employee_id=first_employee.id,
            requester_email=first_employee.email,
            subject="VPN connection issue",
            description="Unable to connect to VPN from home network.",
            category="network",
            priority="high",
            status="open",
            sla_hours=8,
        )
        self.tickets[ticket.id] = ticket
        self.chat_sessions["demo-session"] = ChatSessionRecord(id=uuid4(), session_key="demo-session", employee_id=first_employee.id)

    def ensure_seeded(self) -> None:
        if not self.employees:
            self.seed_demo_data()

    def get_employee(self, employee_id: UUID) -> EmployeeRecord | None:
        self.ensure_seeded()
        return self.employees.get(employee_id)

    def get_employee_by_email(self, email: str) -> EmployeeRecord | None:
        self.ensure_seeded()
        normalized = email.lower()
        return next((employee for employee in self.employees.values() if employee.email.lower() == normalized), None)


STORE = HelpdeskStore()
STORE.seed_demo_data()


def get_store() -> HelpdeskStore:
    STORE.ensure_seeded()
    return STORE
