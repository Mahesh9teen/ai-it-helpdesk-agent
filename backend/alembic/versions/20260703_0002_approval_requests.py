"""Create approval requests table.

Revision ID: 20260703_0002
Revises: 20260702_0001
Create Date: 2026-07-03 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260703_0002"
down_revision = "20260702_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "approval_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("task_type", sa.String(length=100), nullable=False),
        sa.Column("tool_name", sa.String(length=100), nullable=False),
        sa.Column("automation_level", sa.String(length=30), nullable=False),
        sa.Column("requires_approval", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("requested_by_employee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("approver", sa.String(length=255), nullable=True),
        sa.Column("systems_touched", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("payload", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_approval_requests_task_type"), "approval_requests", ["task_type"], unique=False)
    op.create_index(op.f("ix_approval_requests_requested_by_employee_id"), "approval_requests", ["requested_by_employee_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_approval_requests_requested_by_employee_id"), table_name="approval_requests")
    op.drop_index(op.f("ix_approval_requests_task_type"), table_name="approval_requests")
    op.drop_table("approval_requests")
