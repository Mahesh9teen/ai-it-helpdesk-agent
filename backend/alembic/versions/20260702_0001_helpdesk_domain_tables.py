"""Create helpdesk domain tables.

Revision ID: 20260702_0001
Revises:
Create Date: 2026-07-02 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260702_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("department", sa.String(length=120), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="employee"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_employees_email"), "employees", ["email"], unique=True)

    op.create_table(
        "tickets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("requester_email", sa.String(length=255), nullable=True),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False, server_default="general"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="new"),
        sa.Column("sla_hours", sa.Integer(), nullable=False, server_default="24"),
        sa.Column("escalated", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_tickets_employee_id"), "tickets", ["employee_id"], unique=False)
    op.create_index(op.f("ix_tickets_requester_email"), "tickets", ["requester_email"], unique=False)

    op.create_table(
        "leave_balances",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("casual_leave_days", sa.Float(), nullable=False, server_default="12"),
        sa.Column("sick_leave_days", sa.Float(), nullable=False, server_default="10"),
        sa.Column("earned_leave_days", sa.Float(), nullable=False, server_default="15"),
        sa.Column("carried_over_days", sa.Float(), nullable=False, server_default="0"),
        sa.Column("as_of", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("employee_id"),
    )

    op.create_table(
        "leave_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("leave_type", sa.String(length=20), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("days", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="approved"),
        sa.Column("reason", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_leave_history_employee_id"), "leave_history", ["employee_id"], unique=False)

    op.create_table(
        "software_catalog_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("software_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_preapproved", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("approval_required", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("category", sa.String(length=100), nullable=False, server_default="general"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_software_catalog_items_software_name"), "software_catalog_items", ["software_name"], unique=True)

    op.create_table(
        "software_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("requester_email", sa.String(length=255), nullable=True),
        sa.Column("software_name", sa.String(length=200), nullable=False),
        sa.Column("justification", sa.Text(), nullable=False),
        sa.Column("business_impact", sa.String(length=100), nullable=False, server_default="standard"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="requested"),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("catalog_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("software_catalog_items.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_software_requests_employee_id"), "software_requests", ["employee_id"], unique=False)
    op.create_index(op.f("ix_software_requests_requester_email"), "software_requests", ["requester_email"], unique=False)

    op.create_table(
        "chat_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_key", sa.String(length=100), nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("last_intent", sa.String(length=50), nullable=True),
        sa.Column("clarification_loops", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resolved_intents", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("is_escalated", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_chat_sessions_employee_id"), "chat_sessions", ["employee_id"], unique=False)
    op.create_index(op.f("ix_chat_sessions_session_key"), "chat_sessions", ["session_key"], unique=True)

    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("turn_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("intent", sa.String(length=50), nullable=True),
        sa.Column("sources", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_chat_messages_session_id"), "chat_messages", ["session_id"], unique=False)

    op.create_table(
        "escalation_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id"), nullable=False),
        sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="queued"),
        sa.Column("assigned_to", sa.String(length=255), nullable=True),
        sa.Column("webhook_target", sa.String(length=500), nullable=True),
        sa.Column("webhook_status", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_escalation_logs_session_id"), "escalation_logs", ["session_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_escalation_logs_session_id"), table_name="escalation_logs")
    op.drop_table("escalation_logs")

    op.drop_index(op.f("ix_chat_messages_session_id"), table_name="chat_messages")
    op.drop_table("chat_messages")

    op.drop_index(op.f("ix_chat_sessions_session_key"), table_name="chat_sessions")
    op.drop_index(op.f("ix_chat_sessions_employee_id"), table_name="chat_sessions")
    op.drop_table("chat_sessions")

    op.drop_index(op.f("ix_software_requests_requester_email"), table_name="software_requests")
    op.drop_index(op.f("ix_software_requests_employee_id"), table_name="software_requests")
    op.drop_table("software_requests")

    op.drop_index(op.f("ix_software_catalog_items_software_name"), table_name="software_catalog_items")
    op.drop_table("software_catalog_items")

    op.drop_index(op.f("ix_leave_history_employee_id"), table_name="leave_history")
    op.drop_table("leave_history")

    op.drop_table("leave_balances")

    op.drop_index(op.f("ix_tickets_requester_email"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_employee_id"), table_name="tickets")
    op.drop_table("tickets")

    op.drop_index(op.f("ix_employees_email"), table_name="employees")
    op.drop_table("employees")
