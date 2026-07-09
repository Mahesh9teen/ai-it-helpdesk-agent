"""Add Phase 9 autonomy and intelligence tables.

Revision ID: 20260703_0005
Revises: 20260703_0004
Create Date: 2026-07-03
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260703_0005"
down_revision = "20260703_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "rca_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=False, unique=True),
        sa.Column("likely_cause", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("affected_systems", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("similar_past_incidents", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("recommended_permanent_fix", sa.Text(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_rca_reports_ticket_id", "rca_reports", ["ticket_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("actor", sa.String(length=120), nullable=False),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("target_type", sa.String(length=120), nullable=False),
        sa.Column("target_id", sa.String(length=120), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("outcome", sa.String(length=60), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_actor", "audit_logs", ["actor"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_target_id", "audit_logs", ["target_id"])

    op.create_table(
        "infra_change_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("change_ref", sa.String(length=80), nullable=False),
        sa.Column("system", sa.String(length=120), nullable=False),
        sa.Column("change_type", sa.String(length=120), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("risk_level", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("change_ref", name="uq_infra_change_logs_change_ref"),
    )
    op.create_index("ix_infra_change_logs_change_ref", "infra_change_logs", ["change_ref"])
    op.create_index("ix_infra_change_logs_system", "infra_change_logs", ["system"])

    op.create_table(
        "security_login_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=80), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("ip_address", sa.String(length=80), nullable=True),
        sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("impossible_travel", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_security_login_events_employee_id", "security_login_events", ["employee_id"])
    op.create_index("ix_security_login_events_email", "security_login_events", ["email"])

    op.create_table(
        "remote_assist_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=True),
        sa.Column("requested_by_employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("script_name", sa.String(length=120), nullable=False),
        sa.Column("plain_english_plan", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending_approval"),
        sa.Column("execution_log", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_remote_assist_actions_ticket_id", "remote_assist_actions", ["ticket_id"])
    op.create_index("ix_remote_assist_actions_requested_by_employee_id", "remote_assist_actions", ["requested_by_employee_id"])
    op.create_index("ix_remote_assist_actions_status", "remote_assist_actions", ["status"])

    op.create_table(
        "employee_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("device_model", sa.String(length=120), nullable=True),
        sa.Column("os_name", sa.String(length=120), nullable=True),
        sa.Column("installed_software_fingerprint", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("department", sa.String(length=120), nullable=True),
        sa.Column("common_issue_history", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("preferred_language", sa.String(length=20), nullable=False, server_default="en"),
        sa.Column("resolution_preference", sa.String(length=40), nullable=False, server_default="guided"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("employee_id", name="uq_employee_profiles_employee_id"),
    )
    op.create_index("ix_employee_profiles_employee_id", "employee_profiles", ["employee_id"])


def downgrade() -> None:
    op.drop_index("ix_employee_profiles_employee_id", table_name="employee_profiles")
    op.drop_table("employee_profiles")

    op.drop_index("ix_remote_assist_actions_status", table_name="remote_assist_actions")
    op.drop_index("ix_remote_assist_actions_requested_by_employee_id", table_name="remote_assist_actions")
    op.drop_index("ix_remote_assist_actions_ticket_id", table_name="remote_assist_actions")
    op.drop_table("remote_assist_actions")

    op.drop_index("ix_security_login_events_email", table_name="security_login_events")
    op.drop_index("ix_security_login_events_employee_id", table_name="security_login_events")
    op.drop_table("security_login_events")

    op.drop_index("ix_infra_change_logs_system", table_name="infra_change_logs")
    op.drop_index("ix_infra_change_logs_change_ref", table_name="infra_change_logs")
    op.drop_table("infra_change_logs")

    op.drop_index("ix_audit_logs_target_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_rca_reports_ticket_id", table_name="rca_reports")
    op.drop_table("rca_reports")
