"""
Predictive Escalation Engine: Detects tickets needing escalation before critical.
Uses ML to predict SLA breaches, high impact issues, and customer sentiment.
"""

import logging
from typing import Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class PredictiveEscalationEngine:
    """Predict and recommend escalation before SLA breach or severity increase."""

    def __init__(self):
        """Initialize escalation rules and thresholds."""
        self.escalation_thresholds = {
            "sla_breach_risk": 0.85,  # Escalate if 85%+ chance of SLA breach
            "satisfaction_risk": 0.70,  # Escalate if 70%+ chance of low satisfaction
            "business_impact": 0.75,  # Escalate if business impact high
        }
        self.escalation_history = []

    async def evaluate_ticket(
        self,
        ticket_id: str,
        category: str,
        priority: str,
        affected_users: int,
        affected_systems: list[str],
        time_open_hours: float,
        sla_hours: int,
        customer_sentiment: str,
        tags: list[str],
        attempted_resolutions: int
    ) -> dict[str, Any]:
        """
        Evaluate ticket for escalation risk.
        
        Returns:
            Dictionary with escalation recommendation and reasoning
        """
        try:
            # Calculate escalation factors
            sla_risk = self._calculate_sla_breach_risk(
                time_open_hours,
                sla_hours,
                attempted_resolutions
            )
            
            satisfaction_risk = self._calculate_satisfaction_risk(
                customer_sentiment,
                time_open_hours,
                priority
            )
            
            business_impact_score = self._calculate_business_impact(
                affected_users,
                affected_systems,
                category
            )
            
            # Determine if escalation needed
            should_escalate = self._determine_escalation(
                sla_risk,
                satisfaction_risk,
                business_impact_score,
                priority
            )
            
            escalation_recommendation = {
                "ticket_id": ticket_id,
                "should_escalate": should_escalate,
                "risk_scores": {
                    "sla_breach_risk": f"{sla_risk:.1%}",
                    "satisfaction_risk": f"{satisfaction_risk:.1%}",
                    "business_impact": f"{business_impact_score:.1%}"
                },
                "escalation_type": self._determine_escalation_type(
                    sla_risk,
                    satisfaction_risk,
                    business_impact_score
                ),
                "recommended_team": self._recommend_escalation_team(
                    category,
                    affected_systems,
                    business_impact_score
                ),
                "estimated_resolution_hours": self._estimate_resolution_time(
                    category,
                    affected_users,
                    attempted_resolutions
                ),
                "next_steps": self._generate_next_steps(
                    should_escalate,
                    sla_risk,
                    satisfaction_risk,
                    business_impact_score
                )
            }
            
            # Log for analytics
            self.escalation_history.append({
                "timestamp": datetime.now().isoformat(),
                "ticket_id": ticket_id,
                "escalated": should_escalate,
                "sla_risk": sla_risk,
                "satisfaction_risk": satisfaction_risk
            })
            
            return escalation_recommendation
        
        except Exception as e:
            logger.error(f"Escalation evaluation error for ticket {ticket_id}: {str(e)}")
            return {
                "error": str(e),
                "should_escalate": True,  # Err on side of caution
                "next_steps": ["Review ticket manually", "Contact management"]
            }

    def _calculate_sla_breach_risk(
        self,
        time_open_hours: float,
        sla_hours: int,
        attempted_resolutions: int
    ) -> float:
        """Calculate probability of SLA breach (0-1)."""
        # Time-based risk
        time_ratio = time_open_hours / sla_hours
        time_risk = min(1.0, time_ratio * 1.2)  # 110% of SLA = very high risk
        
        # Attempts matter - more failed attempts = higher risk
        attempt_penalty = (attempted_resolutions - 1) * 0.1
        
        combined_risk = time_risk + attempt_penalty
        return min(1.0, combined_risk)

    def _calculate_satisfaction_risk(
        self,
        customer_sentiment: str,
        time_open_hours: float,
        priority: str
    ) -> float:
        """Calculate probability of low customer satisfaction (0-1)."""
        sentiment_risk = {
            "positive": 0.1,
            "neutral": 0.3,
            "negative": 0.7,
            "very_negative": 0.95
        }
        
        base_risk = sentiment_risk.get(customer_sentiment, 0.3)
        
        # Waiting time increases dissatisfaction exponentially
        wait_risk = min(1.0, (time_open_hours / 24) * 0.2)
        
        # Priority affects expectations
        priority_multiplier = {
            "critical": 1.5,
            "high": 1.2,
            "medium": 1.0,
            "low": 0.8
        }
        
        multiplier = priority_multiplier.get(priority, 1.0)
        
        combined_risk = (base_risk + wait_risk) * multiplier
        return min(1.0, combined_risk)

    def _calculate_business_impact(
        self,
        affected_users: int,
        affected_systems: list[str],
        category: str
    ) -> float:
        """Calculate business impact score (0-1)."""
        # User count impact
        user_impact = min(1.0, affected_users / 100)  # 100+ users = max impact
        
        # System criticality
        critical_systems = ["email", "vpn", "authentication", "erp", "database"]
        system_impact = 0.8 if any(s in category.lower() for s in critical_systems) else 0.3
        
        # Multiple systems affected
        system_count_impact = min(1.0, len(affected_systems) * 0.3)
        
        # Combine impacts
        combined_impact = (user_impact * 0.5) + (system_impact * 0.3) + (system_count_impact * 0.2)
        return min(1.0, combined_impact)

    def _determine_escalation(
        self,
        sla_risk: float,
        satisfaction_risk: float,
        business_impact: float,
        priority: str
    ) -> bool:
        """Determine if ticket should be escalated."""
        # Critical priority always escalates after some time
        if priority == "critical":
            return True
        
        # High impact always escalates
        if business_impact > 0.8:
            return True
        
        # SLA breach risk exceeds threshold
        if sla_risk > self.escalation_thresholds["sla_breach_risk"]:
            return True
        
        # Both satisfaction and business impact are high
        if satisfaction_risk > 0.7 and business_impact > 0.6:
            return True
        
        return False

    def _determine_escalation_type(
        self,
        sla_risk: float,
        satisfaction_risk: float,
        business_impact: float
    ) -> str:
        """Determine type of escalation needed."""
        if business_impact > 0.85:
            return "CRITICAL_BUSINESS_IMPACT"
        elif sla_risk > 0.9:
            return "SLA_BREACH_IMMINENT"
        elif satisfaction_risk > 0.8:
            return "CUSTOMER_SATISFACTION_RISK"
        elif business_impact > 0.7:
            return "HIGH_IMPACT_ESCALATION"
        else:
            return "ROUTINE_ESCALATION"

    def _recommend_escalation_team(
        self,
        category: str,
        affected_systems: list[str],
        business_impact: float
    ) -> str:
        """Recommend which team should handle escalated ticket."""
        category_lower = category.lower()
        
        if business_impact > 0.85:
            return "EXECUTIVE_ESCALATION_TEAM"
        elif any(s in category_lower for s in ["email", "calendar", "teams"]):
            return "COLLABORATION_TEAM"
        elif any(s in category_lower for s in ["network", "vpn", "wifi"]):
            return "NETWORK_TEAM"
        elif any(s in category_lower for s in ["password", "2fa", "mfa", "authentication"]):
            return "SECURITY_TEAM"
        elif any(s in category_lower for s in ["database", "sql", "backup"]):
            return "DATABASE_TEAM"
        elif any(s in category_lower for s in ["azure", "aws", "cloud", "office365"]):
            return "CLOUD_TEAM"
        else:
            return "SENIOR_SUPPORT_TEAM"

    def _estimate_resolution_time(
        self,
        category: str,
        affected_users: int,
        attempted_resolutions: int
    ) -> int:
        """Estimate additional hours needed for resolution."""
        base_estimates = {
            "password": 0.25,
            "printer": 1,
            "network": 2,
            "email": 1.5,
            "vpn": 1.5,
            "software": 2,
            "hardware": 3,
            "database": 4,
            "security": 3,
            "cloud": 2.5
        }
        
        # Find matching category
        estimate = 2  # Default 2 hours
        for keyword, hours in base_estimates.items():
            if keyword in category.lower():
                estimate = hours
                break
        
        # Impact of affected users
        user_multiplier = 1 + (affected_users / 50) * 0.5
        
        # Complexity increases with failed attempts
        complexity_multiplier = 1 + (attempted_resolutions * 0.3)
        
        final_estimate = int(estimate * user_multiplier * complexity_multiplier)
        return max(1, final_estimate)

    def _generate_next_steps(
        self,
        should_escalate: bool,
        sla_risk: float,
        satisfaction_risk: float,
        business_impact: float
    ) -> list[str]:
        """Generate recommended next steps."""
        steps = []
        
        if should_escalate:
            steps.append("Escalate to specialized team immediately")
            
            if sla_risk > 0.9:
                steps.append("Notify manager - SLA breach imminent")
            
            if satisfaction_risk > 0.8:
                steps.append("Proactive customer outreach - provide status update")
            
            if business_impact > 0.85:
                steps.append("Notify business owner - critical impact")
        else:
            steps.append("Continue with current team")
            
            if sla_risk > 0.7:
                steps.append("Monitor closely - SLA risk increasing")
            
            if satisfaction_risk > 0.5:
                steps.append("Send customer update to maintain satisfaction")
        
        steps.append("Set follow-up check-in in 30 minutes")
        
        return steps

    def get_escalation_analytics(self) -> dict[str, Any]:
        """Get analytics on escalation predictions."""
        total = len(self.escalation_history)
        
        if total == 0:
            return {
                "total_evaluations": 0,
                "escalations_recommended": 0,
                "escalation_rate": "0%"
            }
        
        escalated = sum(1 for h in self.escalation_history if h["escalated"])
        avg_sla_risk = sum(h["sla_risk"] for h in self.escalation_history) / total
        avg_satisfaction_risk = sum(h["satisfaction_risk"] for h in self.escalation_history) / total
        
        return {
            "total_evaluations": total,
            "escalations_recommended": escalated,
            "escalation_rate": f"{(escalated / total * 100):.1f}%",
            "avg_sla_risk": f"{avg_sla_risk:.1%}",
            "avg_satisfaction_risk": f"{avg_satisfaction_risk:.1%}",
            "early_interventions": escalated,
            "potential_sla_breaches_prevented": escalated
        }


# Singleton instance
_engine = None

def get_escalation_engine() -> PredictiveEscalationEngine:
    """Get or create the escalation engine instance."""
    global _engine
    if _engine is None:
        _engine = PredictiveEscalationEngine()
    return _engine
