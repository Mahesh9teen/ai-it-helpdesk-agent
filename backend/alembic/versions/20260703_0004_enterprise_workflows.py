"""Add enterprise workflow tables.

Revision ID: 20260703_0004
Revises: 20260703_0003
Create Date: 2026-07-03 01:30:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260703_0004"
down_revision = "20260703_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "onboarding_checklists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("accounts_created", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("software_installed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("vpn_configured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("hardware_assigned", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("security_training_assigned", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="in_progress"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_onboarding_checklists_employee_id"), "onboarding_checklists", ["employee_id"], unique=False)

    op.create_table(
        "sla_policies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("target_resolution_hours", sa.Integer(), nullable=False),
        sa.Column("auto_escalate_on_breach", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("category", "priority", name="uq_sla_category_priority"),
    )
    op.create_index(op.f("ix_sla_policies_category"), "sla_policies", ["category"], unique=False)
    op.create_index(op.f("ix_sla_policies_priority"), "sla_policies", ["priority"], unique=False)

    op.create_table(
        "incident_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tickets.id"), nullable=False),
        sa.Column("markdown_content", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("ticket_id"),
    )
    op.create_index(op.f("ix_incident_reports_ticket_id"), "incident_reports", ["ticket_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_incident_reports_ticket_id"), table_name="incident_reports")
    op.drop_table("incident_reports")

    op.drop_index(op.f("ix_sla_policies_priority"), table_name="sla_policies")
    op.drop_index(op.f("ix_sla_policies_category"), table_name="sla_policies")
    op.drop_table("sla_policies")

    op.drop_index(op.f("ix_onboarding_checklists_employee_id"), table_name="onboarding_checklists")
    op.drop_table("onboarding_checklists")
