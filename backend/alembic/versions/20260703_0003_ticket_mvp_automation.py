"""Add ticket MVP automation tables and fields.

Revision ID: 20260703_0003
Revises: 20260703_0002
Create Date: 2026-07-03 00:30:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260703_0003"
down_revision = "20260703_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("summary", sa.Text(), nullable=True))
    op.add_column("tickets", sa.Column("resolution_timeline", sa.Text(), nullable=True))
    op.add_column("tickets", sa.Column("assigned_agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=True))
    op.create_index(op.f("ix_tickets_assigned_agent_id"), "tickets", ["assigned_agent_id"], unique=False)

    op.create_table(
        "priority_feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("sample_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_resolution_hours", sa.Float(), nullable=False, server_default="0"),
        sa.Column("average_resolution_hours", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("category"),
    )
    op.create_index(op.f("ix_priority_feedback_category"), "priority_feedback", ["category"], unique=True)

    op.create_table(
        "agent_skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employees.id"), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("current_load", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("agent_id", "category", name="uq_agent_skills_agent_category"),
    )
    op.create_index(op.f("ix_agent_skills_agent_id"), "agent_skills", ["agent_id"], unique=False)
    op.create_index(op.f("ix_agent_skills_category"), "agent_skills", ["category"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_agent_skills_category"), table_name="agent_skills")
    op.drop_index(op.f("ix_agent_skills_agent_id"), table_name="agent_skills")
    op.drop_table("agent_skills")

    op.drop_index(op.f("ix_priority_feedback_category"), table_name="priority_feedback")
    op.drop_table("priority_feedback")

    op.drop_index(op.f("ix_tickets_assigned_agent_id"), table_name="tickets")
    op.drop_column("tickets", "assigned_agent_id")
    op.drop_column("tickets", "resolution_timeline")
    op.drop_column("tickets", "summary")
