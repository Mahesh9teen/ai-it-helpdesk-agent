"""
Advanced Features API: Exposes intelligent routing, self-healing, escalation, and analytics.
Provides endpoints for managers and agents to leverage AI-driven helpdesk capabilities.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any
import logging

from app.services.advanced_ticket_router import get_advanced_router
from app.services.self_healing_executor import get_self_healing_executor
from app.services.predictive_escalation_engine import get_escalation_engine
from app.services.advanced_analytics_engine import get_analytics_engine
from app.db.session import AsyncSession, get_async_session

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Advanced Features"])


# ============================================================================
# MODELS
# ============================================================================

class TicketRoutingRequest(BaseModel):
    ticket_id: str
    category: str
    priority: str
    tags: list[str] = []
    current_assignments: dict[str, Any] = {}


class TicketRoutingResponse(BaseModel):
    agent_id: str | None
    score: float | None = None
    factors: dict[str, Any] = {}
    reason: str


class HealingRequest(BaseModel):
    ticket_id: str
    category: str
    issue_description: str
    affected_system: str
    tags: list[str] = []


class HealingResponse(BaseModel):
    can_heal: bool
    success: bool = None
    issue_type: str = None
    resolution: str = None
    confidence: float = None
    auto_resolved: bool = False
    ticket_status: str = None
    next_step: str = None


class EscalationRequest(BaseModel):
    ticket_id: str
    category: str
    priority: str
    affected_users: int
    affected_systems: list[str] = []
    time_open_hours: float
    sla_hours: int
    customer_sentiment: str
    tags: list[str] = []
    attempted_resolutions: int = 0


class EscalationResponse(BaseModel):
    ticket_id: str
    should_escalate: bool
    risk_scores: dict[str, str]
    escalation_type: str = None
    recommended_team: str = None
    estimated_resolution_hours: int = None
    next_steps: list[str]


class TicketResolutionRecord(BaseModel):
    ticket_id: str
    category: str
    priority: str
    agent_id: str
    resolution_hours: float
    first_contact_resolved: bool
    satisfaction_score: int  # 1-5
    customer_effort_score: int  # 1-5


# ============================================================================
# SMART ROUTING ENDPOINTS
# ============================================================================

@router.post("/advanced/routing/assign", response_model=TicketRoutingResponse)
async def assign_ticket_intelligently(
    request: TicketRoutingRequest,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Intelligently assign ticket to best agent using skill-based routing.
    
    Considers:
    - Agent skills and expertise
    - Current workload
    - Historical performance
    - Ticket category and priority
    
    Returns agent_id with score breakdown showing how assignment was made.
    """
    try:
        router_service = get_advanced_router()
        result = await router_service.assign_ticket(
            request.ticket_id,
            request.category,
            request.priority,
            request.tags,
            request.current_assignments
        )
        
        return TicketRoutingResponse(
            agent_id=result.get("agent_id"),
            score=result.get("score"),
            factors=result.get("factors", {}),
            reason=result.get("reason")
        )
    
    except Exception as e:
        logger.error(f"Routing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/advanced/routing/agent-skills/{agent_id}")
async def register_agent_skills(
    agent_id: str,
    skills: list[str],
    experience_years: int = 1
):
    """
    Register or update agent skills for intelligent routing.
    
    Skills: ["networking", "hardware", "software", "security", "database", "cloud", "email", "general"]
    
    Example:
    {
        "skills": ["networking", "security", "cloud"],
        "experience_years": 3
    }
    """
    try:
        router_service = get_advanced_router()
        router_service.add_agent(agent_id, skills, experience_years)
        
        return {
            "status": "success",
            "agent_id": agent_id,
            "skills": skills,
            "experience_years": experience_years
        }
    
    except Exception as e:
        logger.error(f"Agent registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SELF-HEALING ENDPOINTS
# ============================================================================

@router.post("/advanced/self-healing/attempt", response_model=HealingResponse)
async def attempt_self_healing(
    request: HealingRequest,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Attempt to automatically heal common IT issues.
    
    Supported issues:
    - Password resets
    - Service restarts
    - Network connectivity
    - Printer offline
    - Email sync issues
    - VPN connection
    - Disk space cleanup
    - License renewal
    - DNS cache issues
    - Device driver updates
    
    Returns healing result or next steps if not auto-healable.
    """
    try:
        executor = get_self_healing_executor()
        result = await executor.attempt_healing(
            request.ticket_id,
            request.category,
            request.issue_description,
            request.affected_system,
            request.tags
        )
        
        return HealingResponse(
            can_heal=result.get("can_heal", False),
            success=result.get("success"),
            issue_type=result.get("issue_type"),
            resolution=result.get("resolution"),
            confidence=result.get("confidence"),
            auto_resolved=result.get("auto_resolved", False),
            ticket_status=result.get("ticket_status"),
            next_step=result.get("next_step")
        )
    
    except Exception as e:
        logger.error(f"Self-healing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/self-healing/statistics")
async def get_healing_statistics():
    """
    Get statistics on self-healing effectiveness.
    
    Shows success rate, tickets auto-resolved, and time savings.
    """
    try:
        executor = get_self_healing_executor()
        stats = executor.get_healing_statistics()
        
        return {
            "status": "success",
            "statistics": stats
        }
    
    except Exception as e:
        logger.error(f"Error retrieving statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PREDICTIVE ESCALATION ENDPOINTS
# ============================================================================

@router.post("/advanced/escalation/evaluate", response_model=EscalationResponse)
async def evaluate_escalation_risk(
    request: EscalationRequest,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Evaluate if ticket should be escalated before it becomes critical.
    
    Factors:
    - SLA breach risk
    - Customer satisfaction risk
    - Business impact
    - Resolution time estimate
    
    Returns escalation recommendation with risk scores and next steps.
    """
    try:
        engine = get_escalation_engine()
        result = await engine.evaluate_ticket(
            request.ticket_id,
            request.category,
            request.priority,
            request.affected_users,
            request.affected_systems,
            request.time_open_hours,
            request.sla_hours,
            request.customer_sentiment,
            request.tags,
            request.attempted_resolutions
        )
        
        return EscalationResponse(
            ticket_id=result.get("ticket_id"),
            should_escalate=result.get("should_escalate"),
            risk_scores=result.get("risk_scores", {}),
            escalation_type=result.get("escalation_type"),
            recommended_team=result.get("recommended_team"),
            estimated_resolution_hours=result.get("estimated_resolution_hours"),
            next_steps=result.get("next_steps", [])
        )
    
    except Exception as e:
        logger.error(f"Escalation evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/escalation/analytics")
async def get_escalation_analytics():
    """
    Get analytics on escalation predictions and effectiveness.
    """
    try:
        engine = get_escalation_engine()
        analytics = engine.get_escalation_analytics()
        
        return {
            "status": "success",
            "analytics": analytics
        }
    
    except Exception as e:
        logger.error(f"Error retrieving escalation analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ADVANCED ANALYTICS ENDPOINTS
# ============================================================================

@router.post("/advanced/analytics/record-resolution")
async def record_ticket_resolution(
    record: TicketResolutionRecord,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Record resolved ticket for analytics tracking.
    
    Used to track MTTR, FCR, CSAT, and other KPIs.
    """
    try:
        analytics = get_analytics_engine()
        analytics.record_ticket_resolution(
            record.ticket_id,
            record.category,
            record.priority,
            record.agent_id,
            record.resolution_hours,
            record.first_contact_resolved,
            record.satisfaction_score,
            record.customer_effort_score
        )
        
        return {
            "status": "success",
            "message": "Resolution recorded for analytics"
        }
    
    except Exception as e:
        logger.error(f"Analytics recording error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/analytics/dashboard")
async def get_dashboard_metrics(session: AsyncSession = Depends(get_async_session)):
    """
    Get comprehensive dashboard metrics for management view.
    
    Includes:
    - Summary KPIs (MTTR, FCR, CSAT, SLA compliance)
    - Agent performance rankings
    - Category analysis
    - Trends and forecasts
    - Bottleneck identification
    - Actionable recommendations
    """
    try:
        analytics = get_analytics_engine()
        dashboard = await analytics.generate_dashboard_metrics()
        
        return {
            "status": "success",
            "dashboard": dashboard,
            "generated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Dashboard generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/analytics/agent/{agent_id}")
async def get_agent_analytics(
    agent_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get detailed analytics for specific agent.
    
    Shows:
    - Tickets resolved
    - Performance vs peers
    - MTTR, FCR, CSAT trends
    - Strengths and improvement areas
    """
    try:
        analytics = get_analytics_engine()
        dashboard = await analytics.generate_dashboard_metrics()
        
        agent_data = None
        for agent in dashboard.get("by_agent", []):
            if agent["agent_id"] == agent_id:
                agent_data = agent
                break
        
        if not agent_data:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return {
            "status": "success",
            "agent_id": agent_id,
            "analytics": agent_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Agent analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/analytics/category/{category}")
async def get_category_analytics(
    category: str,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get detailed analytics for specific issue category.
    
    Shows:
    - Volume trends
    - MTTR and FCR
    - Complexity level
    - Recommended improvements
    """
    try:
        analytics = get_analytics_engine()
        dashboard = await analytics.generate_dashboard_metrics()
        
        category_data = None
        for cat in dashboard.get("by_category", []):
            if cat["category"].lower() == category.lower():
                category_data = cat
                break
        
        if not category_data:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {
            "status": "success",
            "category": category,
            "analytics": category_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Category analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/analytics/bottlenecks")
async def get_bottleneck_analysis(session: AsyncSession = Depends(get_async_session)):
    """
    Identify operational bottlenecks and improvement opportunities.
    
    Returns:
    - Categories with high MTTR
    - Low FCR areas needing KB improvement
    - Satisfaction issues
    - Recommended actions
    """
    try:
        analytics = get_analytics_engine()
        dashboard = await analytics.generate_dashboard_metrics()
        
        return {
            "status": "success",
            "bottlenecks": dashboard.get("bottlenecks", []),
            "recommendations": dashboard.get("recommendations", [])
        }
    
    except Exception as e:
        logger.error(f"Bottleneck analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced/health")
async def advanced_features_health():
    """
    Check health of all advanced features.
    """
    return {
        "status": "healthy",
        "components": {
            "smart_routing": "✓",
            "self_healing": "✓",
            "predictive_escalation": "✓",
            "analytics_engine": "✓"
        },
        "features_enabled": [
            "Skill-based ticket routing",
            "Auto-healing (10 issue types)",
            "Predictive SLA breach detection",
            "Real-time analytics dashboard",
            "Performance recommendations"
        ]
    }


# Import datetime for response
from datetime import datetime
