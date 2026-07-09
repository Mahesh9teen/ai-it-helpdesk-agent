"""Automation policy matrix for helpdesk task execution."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class AutomationLevel(StrEnum):
    FULL_AUTO = "Full-Auto"
    ASSISTED = "Assisted"
    HUMAN_REQUIRED = "Human-Required"


class TaskType(StrEnum):
    PASSWORD_RESET = "password_reset"
    UNLOCK_USER_ACCOUNT = "unlock_user_account"
    CREATE_EMPLOYEE_ACCOUNT = "create_employee_account"
    MANAGE_ACCESS_PERMISSIONS = "manage_access_permissions"
    LAPTOP_SETUP = "laptop_setup"
    INSTALL_WINDOWS_MACOS = "install_windows_macos"
    TROUBLESHOOT_SLOW_PC = "troubleshoot_slow_pc"
    HARDWARE_REPAIR = "hardware_repair"
    INSTALL_SOFTWARE = "install_software"
    UPDATE_SOFTWARE = "update_software"
    OUTLOOK_EMAIL_ISSUES = "outlook_email_issues"
    VPN_ISSUES = "vpn_issues"
    WIFI_TROUBLESHOOTING = "wifi_troubleshooting"
    PRINTER_ISSUES = "printer_issues"
    TICKET_CREATION = "ticket_creation"
    TICKET_RESOLUTION = "ticket_resolution"
    TICKET_ESCALATION = "ticket_escalation"
    PHONE_CHAT_EMAIL_SUPPORT = "phone_chat_email_support"
    REMOTE_SUPPORT = "remote_support"
    LEAVE_BALANCE = "leave_balance"
    FAQ_RAG = "faq_rag"


@dataclass(frozen=True, slots=True)
class AutomationPolicy:
    automation_level: AutomationLevel
    requires_approval: bool
    systems_touched: tuple[str, ...]
    notes: str


AUTOMATION_MATRIX: dict[TaskType, AutomationPolicy] = {
    TaskType.PASSWORD_RESET: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("Identity System", "Policy Engine"),
        notes="Identity system + policy check.",
    ),
    TaskType.UNLOCK_USER_ACCOUNT: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("Identity System",),
        notes="Unlock action can run directly in identity tooling.",
    ),
    TaskType.CREATE_EMPLOYEE_ACCOUNT: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("HRIS", "Identity System"),
        notes="Triggered from HR onboarding workflow.",
    ),
    TaskType.MANAGE_ACCESS_PERMISSIONS: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=True,
        systems_touched=("Identity System", "Security Controls"),
        notes="Needs manager/security approval.",
    ),
    TaskType.LAPTOP_SETUP: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("MDM", "Software Deployment"),
        notes="Software setup is automated; physical unboxing is human.",
    ),
    TaskType.INSTALL_WINDOWS_MACOS: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("MDM", "Endpoint Provisioning"),
        notes="Trigger imaging via device management, not physical install.",
    ),
    TaskType.TROUBLESHOOT_SLOW_PC: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("Endpoint Diagnostics",),
        notes="Run diagnostics and suggest common fixes.",
    ),
    TaskType.HARDWARE_REPAIR: AutomationPolicy(
        automation_level=AutomationLevel.HUMAN_REQUIRED,
        requires_approval=False,
        systems_touched=("Field Service",),
        notes="Physical repair requires a technician.",
    ),
    TaskType.INSTALL_SOFTWARE: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("Software Catalog", "MDM", "Endpoint Management"),
        notes="Pre-approved installs can run automatically; non-preapproved routes to human approval.",
    ),
    TaskType.UPDATE_SOFTWARE: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("Patch Management", "Endpoint Management"),
        notes="Routine software updates can run unattended.",
    ),
    TaskType.OUTLOOK_EMAIL_ISSUES: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("Email Platform", "Client Configuration"),
        notes="Diagnose and auto-remediate common issues.",
    ),
    TaskType.VPN_ISSUES: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("VPN Gateway", "Endpoint Network Stack"),
        notes="Diagnose and apply common VPN fixes.",
    ),
    TaskType.WIFI_TROUBLESHOOTING: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("Wireless Controller", "Endpoint Network Stack"),
        notes="Guided steps plus automated diagnostics.",
    ),
    TaskType.PRINTER_ISSUES: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("Print Server", "Endpoint Driver Store"),
        notes="Configuration is automatable; hardware issues need humans.",
    ),
    TaskType.TICKET_CREATION: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("ITSM" ,),
        notes="AI can create, categorize, and set urgency.",
    ),
    TaskType.TICKET_RESOLUTION: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("ITSM", "Knowledge Base"),
        notes="Repetitive requests are automatable.",
    ),
    TaskType.TICKET_ESCALATION: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("ITSM", "Routing Rules"),
        notes="AI routes to the right team.",
    ),
    TaskType.PHONE_CHAT_EMAIL_SUPPORT: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=False,
        systems_touched=("Omnichannel Platform", "Knowledge Base"),
        notes="AI chat/voice handles many requests before human handoff.",
    ),
    TaskType.REMOTE_SUPPORT: AutomationPolicy(
        automation_level=AutomationLevel.ASSISTED,
        requires_approval=True,
        systems_touched=("Remote Support Tooling", "Endpoint Management"),
        notes="Approved remote actions can be initiated; complex sessions need humans.",
    ),
    TaskType.LEAVE_BALANCE: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("HRIS",),
        notes="Policy-backed leave lookup.",
    ),
    TaskType.FAQ_RAG: AutomationPolicy(
        automation_level=AutomationLevel.FULL_AUTO,
        requires_approval=False,
        systems_touched=("Knowledge Base", "Vector Index"),
        notes="Read-only retrieval and response generation.",
    ),
}


def get_automation_policy(task_type: TaskType) -> AutomationPolicy:
    """Return the automation policy for the given task type."""

    return AUTOMATION_MATRIX[task_type]
