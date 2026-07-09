"""SQLAlchemy entities for the helpdesk domain."""

from __future__ import annotations

from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Employee(TimestampMixin, Base):
    __tablename__ = "employees"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="employee", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    leave_balance: Mapped["LeaveBalance"] = relationship(back_populates="employee", uselist=False)


class Ticket(TimestampMixin, Base):
    __tablename__ = "tickets"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    requester_email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="general", nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="new", nullable=False)
    sla_hours: Mapped[int] = mapped_column(Integer, default=24, nullable=False)
    escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolution_timeline: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_agent_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)


class LeaveBalance(TimestampMixin, Base):
    __tablename__ = "leave_balances"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), unique=True, nullable=False)
    casual_leave_days: Mapped[float] = mapped_column(Float, default=12, nullable=False)
    sick_leave_days: Mapped[float] = mapped_column(Float, default=10, nullable=False)
    earned_leave_days: Mapped[float] = mapped_column(Float, default=15, nullable=False)
    carried_over_days: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    as_of: Mapped[date] = mapped_column(Date, nullable=False)

    employee: Mapped[Employee] = relationship(back_populates="leave_balance")


class LeaveHistory(TimestampMixin, Base):
    __tablename__ = "leave_history"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), index=True, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    days: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="approved", nullable=False)
    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)


class SoftwareCatalogItem(TimestampMixin, Base):
    __tablename__ = "software_catalog_items"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    software_name: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_preapproved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    approval_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="general", nullable=False)


class SoftwareRequest(TimestampMixin, Base):
    __tablename__ = "software_requests"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    requester_email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    software_name: Mapped[str] = mapped_column(String(200), nullable=False)
    justification: Mapped[str] = mapped_column(Text, nullable=False)
    business_impact: Mapped[str] = mapped_column(String(100), default="standard", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="requested", nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    catalog_item_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("software_catalog_items.id"), nullable=True)


class ChatSession(TimestampMixin, Base):
    __tablename__ = "chat_sessions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    session_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    last_intent: Mapped[str | None] = mapped_column(String(50), nullable=True)
    clarification_loops: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolved_intents: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    is_escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class ChatMessage(TimestampMixin, Base):
    __tablename__ = "chat_messages"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("chat_sessions.id"), index=True, nullable=False)
    turn_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sources: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)


class EscalationLog(TimestampMixin, Base):
    __tablename__ = "escalation_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("chat_sessions.id"), index=True, nullable=False)
    ticket_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("tickets.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="queued", nullable=False)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    webhook_target: Mapped[str | None] = mapped_column(String(500), nullable=True)
    webhook_status: Mapped[str | None] = mapped_column(String(50), nullable=True)


class ApprovalRequest(TimestampMixin, Base):
    __tablename__ = "approval_requests"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)
    automation_level: Mapped[str] = mapped_column(String(30), nullable=False)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
    requested_by_employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    approver: Mapped[str | None] = mapped_column(String(255), nullable=True)
    systems_touched: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    payload: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class PriorityFeedback(TimestampMixin, Base):
    __tablename__ = "priority_feedback"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    category: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_resolution_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    average_resolution_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)


class AgentSkill(TimestampMixin, Base):
    __tablename__ = "agent_skills"
    __table_args__ = (UniqueConstraint("agent_id", "category", name="uq_agent_skills_agent_category"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    current_load: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class OnboardingChecklist(TimestampMixin, Base):
    __tablename__ = "onboarding_checklists"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    accounts_created: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    software_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    vpn_configured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hardware_assigned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    security_training_assigned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="in_progress", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class SLAPolicy(TimestampMixin, Base):
    __tablename__ = "sla_policies"
    __table_args__ = (UniqueConstraint("category", "priority", name="uq_sla_category_priority"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    target_resolution_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    auto_escalate_on_breach: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class IncidentReport(TimestampMixin, Base):
    __tablename__ = "incident_reports"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    ticket_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False, unique=True, index=True)
    markdown_content: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)


class RCAReport(TimestampMixin, Base):
    __tablename__ = "rca_reports"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    ticket_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False, unique=True, index=True)
    likely_cause: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    affected_systems: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    similar_past_incidents: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    recommended_permanent_fix: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)


class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    actor: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    target_type: Mapped[str] = mapped_column(String(120), nullable=False)
    target_id: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    outcome: Mapped[str] = mapped_column(String(60), nullable=False)
    details: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)


class InfraChangeLog(TimestampMixin, Base):
    __tablename__ = "infra_change_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    change_ref: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    system: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    change_type: Mapped[str] = mapped_column(String(120), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)


class SecurityLoginEvent(TimestampMixin, Base):
    __tablename__ = "security_login_events"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(80), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(80), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    impossible_travel: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class RemoteAssistAction(TimestampMixin, Base):
    __tablename__ = "remote_assist_actions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    ticket_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("tickets.id"), nullable=True, index=True)
    requested_by_employee_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True)
    script_name: Mapped[str] = mapped_column(String(120), nullable=False)
    plain_english_plan: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending_approval", nullable=False, index=True)
    execution_log: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)


class EmployeeProfile(TimestampMixin, Base):
    __tablename__ = "employee_profiles"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("employees.id"), unique=True, nullable=False, index=True)
    device_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    os_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    installed_software_fingerprint: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    common_issue_history: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(20), default="en", nullable=False)
    resolution_preference: Mapped[str] = mapped_column(String(40), default="guided", nullable=False)
