"""Shared API schemas used across the helpdesk routes."""

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field


class APIModel(BaseModel):
    """Base model that forbids unexpected fields in API payloads."""

    model_config = ConfigDict(extra="forbid")


class HealthResponse(APIModel):
    status: Literal["ok"] = "ok"
    service: str = Field(default="AI IT Helpdesk Agent")
    version: str = Field(default="0.1.0")


class MessageResponse(APIModel):
    message: str


class APIErrorResponse(APIModel):
    error: str
    detail: str | None = None


class SourceDocument(APIModel):
    source_filename: str
    category: str
    last_updated: date | None = None
    header: str | None = None
    page_content: str | None = None


class ChatMessageRequest(APIModel):
    session_id: UUID | None = None
    message: str = Field(min_length=1, max_length=10000)
    employee_id: UUID | None = Field(default=None, validation_alias=AliasChoices("employee_id", "user_id"))


class ChatMessageResponse(APIModel):
    session_id: UUID | None = None
    response: str
    intent: str = Field(default="unknown")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    citations: list[str] = Field(default_factory=list)
    sources: list[SourceDocument] = Field(default_factory=list)


class ScreenshotAnalysisResponse(APIModel):
    session_id: UUID | None = None
    extracted_context: str
    response: str
    intent: str


class VoiceTranscribeResponse(APIModel):
    transcript: str
    response: str
    intent: str


class VoiceSpeakRequest(APIModel):
    text: str = Field(min_length=1, max_length=10000)


class AuthLoginRequest(APIModel):
    email: EmailStr
    password: str = Field(min_length=8)


class AuthTokenResponse(APIModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"


class CurrentUserResponse(APIModel):
    user_id: UUID
    email: EmailStr
    full_name: str | None = None
    roles: list[str] = Field(default_factory=list)
    is_active: bool = True


class PasswordResetRequest(APIModel):
    email: EmailStr


class PasswordResetConfirmRequest(APIModel):
    token: str = Field(min_length=1)
    otp: str = Field(min_length=4, max_length=10)
    new_password: str = Field(min_length=12)


class PasswordResetResponse(APIModel):
    message: str


class LeaveBalanceResponse(APIModel):
    employee_id: UUID | None = None
    casual_leave_days: float = Field(ge=0)
    sick_leave_days: float = Field(ge=0)
    earned_leave_days: float = Field(ge=0)
    carried_over_days: float = Field(default=0, ge=0)
    as_of: date


class LeaveRequestCreateRequest(APIModel):
    employee_id: UUID | None = Field(default=None, validation_alias=AliasChoices("employee_id", "user_id"))
    start_date: date
    end_date: date
    reason: str = Field(min_length=1, max_length=500)


class LeaveRequestResponse(APIModel):
    request_id: UUID
    status: Literal["draft", "submitted", "approved", "rejected", "cancelled"]
    start_date: date
    end_date: date
    reason: str
    submitted_at: datetime | None = None


class LeaveHistoryItemResponse(APIModel):
    history_id: UUID
    leave_type: Literal["casual", "sick", "earned", "unpaid"]
    start_date: date
    end_date: date
    days: float
    status: Literal["pending", "approved", "rejected", "cancelled"]
    reason: str | None = None


class LeaveHistoryResponse(APIModel):
    employee_id: UUID | None = None
    history: list[LeaveHistoryItemResponse] = Field(default_factory=list)


class TicketCreateRequest(APIModel):
    employee_id: UUID | None = Field(default=None, validation_alias=AliasChoices("employee_id", "user_id"))
    requester_email: EmailStr | None = None
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10000)
    category: str = Field(default="general", max_length=100)
    priority: Literal["low", "medium", "high", "urgent", "critical"] = "medium"
    employee_role: str | None = Field(default=None, max_length=80)
    tried_suggestions: bool = False


class TicketSuggestionRequest(APIModel):
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10000)


class KBSuggestionResponse(APIModel):
    source: str
    snippet: str
    score: float


class TicketSuggestionResponse(APIModel):
    suggestions: list[KBSuggestionResponse] = Field(default_factory=list)


class TicketStatusUpdateRequest(APIModel):
    status: Literal["new", "open", "in_progress", "resolved", "closed", "major_incident"]


class TicketResponse(APIModel):
    ticket_id: UUID
    employee_id: UUID | None = None
    status: Literal["new", "open", "in_progress", "resolved", "closed"]
    subject: str
    requester_email: EmailStr | None = None
    category: str | None = None
    priority: str | None = None
    description: str | None = None
    summary: str | None = None
    resolution_timeline: str | None = None
    assigned_agent_id: UUID | None = None
    created_at: datetime | None = None


class RCAResponse(APIModel):
    ticket_id: UUID
    likely_cause: str
    confidence: float
    affected_systems: list[str] = Field(default_factory=list)
    similar_past_incidents: list[str] = Field(default_factory=list)
    recommended_permanent_fix: str


class AutonomousResolveResponse(APIModel):
    ticket_id: UUID
    status: str
    attempts: list[dict[str, object]] = Field(default_factory=list)


class OnboardingStartRequest(APIModel):
    employee_id: UUID
    employee_email: EmailStr
    default_software: list[str] = Field(default_factory=lambda: ["Microsoft 365", "Visual Studio Code", "Slack"])


class OnboardingChecklistResponse(APIModel):
    checklist_id: UUID
    employee_id: UUID
    status: str
    accounts_created: bool
    software_installed: bool
    vpn_configured: bool
    hardware_assigned: bool
    security_training_assigned: bool
    notes: str | None = None


class DiagnosticRequest(APIModel):
    step: int = 0
    response: str | None = None
    ticket_id: UUID | None = None


class DiagnosticResponse(APIModel):
    issue_type: Literal["vpn", "outlook"]
    step: int
    question: str
    recommendation: str | None = None
    resolved: bool
    escalate: bool
    final_reason: str | None = None


class AnalyticsSummaryResponse(APIModel):
    total_tickets: int
    escalated_tickets: int
    escalation_rate: float
    avg_resolution_hours: float


class AnalyticsCategoryItem(APIModel):
    category: str
    count: int


class AnalyticsCategoryResponse(APIModel):
    items: list[AnalyticsCategoryItem] = Field(default_factory=list)


class AnalyticsAgentPerformanceItem(APIModel):
    agent_id: UUID | None = None
    ticket_count: int
    avg_resolution_hours: float


class AnalyticsAgentPerformanceResponse(APIModel):
    items: list[AnalyticsAgentPerformanceItem] = Field(default_factory=list)


class AnalyticsTrendItem(APIModel):
    day: str
    count: int


class AnalyticsTrendResponse(APIModel):
    items: list[AnalyticsTrendItem] = Field(default_factory=list)


class AnalyticsAskRequest(APIModel):
    question: str = Field(min_length=3, max_length=2000)


class AnalyticsAskResponse(APIModel):
    answer: str
    query_plan: list[str] = Field(default_factory=list)
    charts: dict[str, object] = Field(default_factory=dict)


class IncidentReportResponse(APIModel):
    ticket_id: UUID
    markdown_content: str


class SLAPolicyRequest(APIModel):
    category: str = Field(min_length=1, max_length=100)
    priority: str = Field(min_length=1, max_length=20)
    target_resolution_hours: int = Field(gt=0, le=720)
    auto_escalate_on_breach: bool = True


class SLAPolicyResponse(APIModel):
    policy_id: UUID
    category: str
    priority: str
    target_resolution_hours: int
    auto_escalate_on_breach: bool


class SLACheckResponse(APIModel):
    at_risk_count: int


class TicketListResponse(APIModel):
    tickets: list[TicketResponse] = Field(default_factory=list)


class SoftwareRequestCreateRequest(APIModel):
    employee_id: UUID | None = Field(default=None, validation_alias=AliasChoices("employee_id", "user_id"))
    requester_email: EmailStr | None = None
    software_name: str = Field(min_length=1, max_length=200)
    justification: str = Field(min_length=1, max_length=2000)
    business_impact: str = Field(default="standard", max_length=100)


class SoftwareRequestResponse(APIModel):
    request_id: UUID
    status: Literal["requested", "under_review", "approved", "rejected", "fulfilled"]
    software_name: str
    employee_id: UUID | None = None
    requester_email: EmailStr | None = None
    created_at: datetime | None = None
    note: str | None = None


class SoftwareCatalogItemResponse(APIModel):
    item_id: UUID
    software_name: str
    description: str
    is_preapproved: bool = True
    approval_required: bool = False
    category: str = "general"


class SoftwareCatalogResponse(APIModel):
    items: list[SoftwareCatalogItemResponse] = Field(default_factory=list)


class SoftwareRequestStatusResponse(APIModel):
    request_id: UUID
    status: Literal["requested", "under_review", "approved", "rejected", "fulfilled"]
    note: str | None = None


class EscalationCreateRequest(APIModel):
    session_id: UUID
    ticket_id: UUID | None = None
    reason: str = Field(min_length=1, max_length=1000)
    urgency: Literal["normal", "high", "critical"] = "normal"


class EscalationResponse(APIModel):
    escalation_id: UUID
    session_id: UUID
    ticket_id: UUID | None = None
    status: Literal["queued", "assigned", "in_review", "resolved"]
    assigned_to: str | None = None
    message: str


class EscalationQueueResponse(APIModel):
    items: list[EscalationResponse] = Field(default_factory=list)


class RemoteAssistProposeRequest(APIModel):
    ticket_id: UUID | None = None
    employee_id: UUID | None = Field(default=None, validation_alias=AliasChoices("employee_id", "user_id"))
    script_name: str = Field(min_length=1, max_length=120)


class RemoteAssistResponse(APIModel):
    action_id: UUID
    status: str
    script_name: str
    plan: str
    execution_log: list[str] = Field(default_factory=list)
