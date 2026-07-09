"""Rule-based diagnostics assistants for VPN and Outlook issues."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class DiagnosticResult:
    issue_type: str
    step: int
    question: str
    recommendation: str | None
    resolved: bool
    escalate: bool
    final_reason: str | None = None


def _response_flag(value: str | None) -> bool:
    lowered = (value or "").strip().lower()
    return lowered in {"y", "yes", "true", "1", "done", "completed"}


def run_vpn_diagnostic_step(step: int, response: str | None) -> DiagnosticResult:
    checks = [
        ("Are your credentials expired or recently changed?", "Re-authenticate with updated credentials and retry."),
        ("Can you confirm VPN client version v4.2+ is installed?", "Upgrade VPN client to v4.2+ and retry."),
        ("Did network team report firewall policy changes today?", "Allow VPN ports 500/4500/443 and retry."),
        ("Does DNS resolve the VPN gateway hostname successfully?", "Set DNS to corporate resolver and flush DNS cache."),
    ]

    if step >= len(checks):
        return DiagnosticResult(
            issue_type="vpn",
            step=step,
            question="",
            recommendation=None,
            resolved=False,
            escalate=True,
            final_reason="All automated VPN checks failed.",
        )

    question, remediation = checks[step]
    if response is None:
        return DiagnosticResult(issue_type="vpn", step=step, question=question, recommendation=None, resolved=False, escalate=False)

    if _response_flag(response):
        return DiagnosticResult(
            issue_type="vpn",
            step=step,
            question=question,
            recommendation=remediation,
            resolved=True,
            escalate=False,
            final_reason="Automated VPN remediation identified.",
        )

    next_step = step + 1
    if next_step >= len(checks):
        return DiagnosticResult(
            issue_type="vpn",
            step=next_step,
            question="",
            recommendation=None,
            resolved=False,
            escalate=True,
            final_reason="All automated VPN checks failed.",
        )

    next_question = checks[next_step][0]
    return DiagnosticResult(issue_type="vpn", step=next_step, question=next_question, recommendation=None, resolved=False, escalate=False)


def run_outlook_diagnostic_step(step: int, response: str | None) -> DiagnosticResult:
    checks = [
        ("Is the mailbox over quota/full?", "Clear mailbox space or request quota increase."),
        ("Does creating a new Outlook profile fix the issue?", "Recreate Outlook profile from Mail settings and retry."),
        ("Do cached credentials prompt repeatedly?", "Clear cached credentials in Credential Manager and re-login."),
        ("Does Outlook work in safe mode without add-ins?", "Disable conflicting add-ins and restart Outlook."),
    ]

    if step >= len(checks):
        return DiagnosticResult(
            issue_type="outlook",
            step=step,
            question="",
            recommendation=None,
            resolved=False,
            escalate=True,
            final_reason="All automated Outlook checks failed.",
        )

    question, remediation = checks[step]
    if response is None:
        return DiagnosticResult(issue_type="outlook", step=step, question=question, recommendation=None, resolved=False, escalate=False)

    if _response_flag(response):
        return DiagnosticResult(
            issue_type="outlook",
            step=step,
            question=question,
            recommendation=remediation,
            resolved=True,
            escalate=False,
            final_reason="Automated Outlook remediation identified.",
        )

    next_step = step + 1
    if next_step >= len(checks):
        return DiagnosticResult(
            issue_type="outlook",
            step=next_step,
            question="",
            recommendation=None,
            resolved=False,
            escalate=True,
            final_reason="All automated Outlook checks failed.",
        )

    next_question = checks[next_step][0]
    return DiagnosticResult(issue_type="outlook", step=next_step, question=next_question, recommendation=None, resolved=False, escalate=False)
