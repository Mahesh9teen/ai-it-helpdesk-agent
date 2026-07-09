"""Seed helpers for demo data."""

from __future__ import annotations

from datetime import date, timedelta
from uuid import NAMESPACE_DNS, uuid4, uuid5

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.session import get_async_session_factory
from app.models import Employee, LeaveBalance, LeaveHistory, SoftwareCatalogItem


def _employee_id(email: str):
    return uuid5(NAMESPACE_DNS, email.lower())


async def seed_demo_data() -> None:
    """Populate demo records for API demos and local testing."""

    session_factory = get_async_session_factory()
    async with session_factory() as session:
        existing_employees = await session.scalar(select(func.count()).select_from(Employee))
        if existing_employees and existing_employees > 0:
            return

        departments = ["IT", "HR", "Finance", "Operations", "Sales"]
        for index in range(20):
            email = f"employee{index + 1}@example.com"
            employee = Employee(
                id=_employee_id(email),
                email=email,
                hashed_password=hash_password("Password123!"),
                full_name=f"Employee {index + 1}",
                department=departments[index % len(departments)],
                role="employee",
                is_active=True,
            )
            session.add(employee)
            session.add(
                LeaveBalance(
                    id=uuid4(),
                    employee_id=employee.id,
                    casual_leave_days=float(12 - (index % 3)),
                    sick_leave_days=float(10 - (index % 2)),
                    earned_leave_days=float(15 - (index % 4)),
                    carried_over_days=float(index % 2),
                    as_of=date.today(),
                )
            )
            session.add_all(
                [
                    LeaveHistory(
                        id=uuid4(),
                        employee_id=employee.id,
                        leave_type="casual",
                        start_date=date.today() - timedelta(days=14 + index),
                        end_date=date.today() - timedelta(days=12 + index),
                        days=2.0,
                        status="approved",
                        reason="Personal work",
                    ),
                    LeaveHistory(
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
            )

        catalog_items = [
            ("Microsoft 365", "Office productivity suite", True, False, "productivity"),
            ("Slack", "Team messaging platform", True, False, "communication"),
            ("Zoom", "Video conferencing", True, False, "communication"),
            ("Google Chrome", "Web browser", True, False, "browser"),
            ("Firefox", "Web browser", True, False, "browser"),
            ("Visual Studio Code", "Code editor", True, False, "development"),
            ("GitHub Desktop", "Git client", True, False, "development"),
            ("Postman", "API testing client", True, False, "development"),
            ("Adobe Acrobat", "PDF editor", True, False, "productivity"),
            ("Confluence", "Knowledge base", True, False, "knowledge"),
            ("Jira", "Project tracking", True, False, "project-management"),
            ("1Password", "Password manager", True, False, "security"),
            ("Tableau", "Business intelligence", True, False, "analytics"),
            ("Figma", "Design collaboration", True, False, "design"),
            ("Python", "Runtime and interpreter package", True, False, "development"),
        ]

        for software_name, description, is_preapproved, approval_required, category in catalog_items:
            session.add(
                SoftwareCatalogItem(
                    id=uuid4(),
                    software_name=software_name,
                    description=description,
                    is_preapproved=is_preapproved,
                    approval_required=approval_required,
                    category=category,
                )
            )

        await session.commit()
