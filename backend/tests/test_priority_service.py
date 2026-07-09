"""Unit tests for ticket priority prediction rules."""

from app.services.priority_service import predict_priority


def test_predict_priority_defaults_to_medium() -> None:
    assert predict_priority("General help needed", "Other", "employee") == "medium"


def test_predict_priority_bumps_for_blocking_keywords() -> None:
    assert predict_priority("I cannot work because production down", "Software", "employee") in {"high", "urgent"}


def test_predict_priority_bumps_for_executive_role() -> None:
    assert predict_priority("Need access to dashboard", "Access/Identity", "VP") in {"high", "urgent"}


def test_predict_priority_marks_routine_requests_lower() -> None:
    assert predict_priority("Please do a password reset", "Access/Identity", "employee") == "low"
