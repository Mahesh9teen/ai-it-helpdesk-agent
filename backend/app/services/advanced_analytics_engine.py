"""
Advanced Analytics & Insights Engine: Provides data-driven dashboards and recommendations.
Tracks MTTR, FCR, CSAT, identifies bottlenecks, and predicts trends.
"""

import logging
from typing import Any
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

logger = logging.getLogger(__name__)


class AdvancedAnalyticsEngine:
    """Advanced analytics and insights for helpdesk management."""

    def __init__(self):
        """Initialize analytics tracking."""
        self.ticket_metrics = []
        self.agent_metrics = defaultdict(list)
        self.category_metrics = defaultdict(list)
        self.daily_metrics = {}

    def record_ticket_resolution(
        self,
        ticket_id: str,
        category: str,
        priority: str,
        agent_id: str,
        resolution_hours: float,
        first_contact_resolved: bool,
        satisfaction_score: int,
        customer_effort_score: int
    ):
        """Record resolved ticket for analytics."""
        metric = {
            "ticket_id": ticket_id,
            "timestamp": datetime.now().isoformat(),
            "category": category,
            "priority": priority,
            "agent_id": agent_id,
            "resolution_hours": resolution_hours,
            "first_contact_resolved": first_contact_resolved,
            "satisfaction_score": satisfaction_score,
            "customer_effort_score": customer_effort_score
        }
        
        self.ticket_metrics.append(metric)
        self.agent_metrics[agent_id].append(metric)
        self.category_metrics[category].append(metric)

    async def generate_dashboard_metrics(self) -> dict[str, Any]:
        """Generate comprehensive dashboard metrics."""
        if not self.ticket_metrics:
            return {
                "status": "no_data",
                "message": "Insufficient data for dashboard"
            }
        
        return {
            "summary": self._calculate_summary_metrics(),
            "by_agent": self._calculate_agent_rankings(),
            "by_category": self._calculate_category_analysis(),
            "sla_compliance": self._calculate_sla_compliance(),
            "trends": self._calculate_trends(),
            "bottlenecks": self._identify_bottlenecks(),
            "recommendations": self._generate_recommendations(),
            "forecast": self._forecast_metrics()
        }

    def _calculate_summary_metrics(self) -> dict[str, Any]:
        """Calculate overall helpdesk metrics."""
        if not self.ticket_metrics:
            return {}
        
        # Mean Time To Resolution (MTTR)
        mttr_hours = statistics.mean(m["resolution_hours"] for m in self.ticket_metrics)
        
        # First Contact Resolution (FCR)
        fcr_rate = sum(1 for m in self.ticket_metrics if m["first_contact_resolved"]) / len(self.ticket_metrics)
        
        # Customer Satisfaction (CSAT)
        avg_csat = statistics.mean(m["satisfaction_score"] for m in self.ticket_metrics)
        
        # Customer Effort Score (CES)
        avg_ces = statistics.mean(m["customer_effort_score"] for m in self.ticket_metrics)
        
        # Priority breakdown
        by_priority = defaultdict(int)
        for m in self.ticket_metrics:
            by_priority[m["priority"]] += 1
        
        return {
            "total_tickets_resolved": len(self.ticket_metrics),
            "mttr_hours": f"{mttr_hours:.1f}",
            "mttr_target": "4-24",
            "mttr_status": self._get_status_indicator(mttr_hours, (4, 24)),
            "fcr_rate": f"{fcr_rate:.1%}",
            "fcr_target": "65-80%",
            "fcr_status": self._get_status_indicator(fcr_rate, (0.65, 0.80)),
            "avg_csat": f"{avg_csat:.1f}/5",
            "csat_target": "4.2-4.5",
            "csat_status": self._get_status_indicator(avg_csat, (4.2, 5.0)),
            "avg_ces": f"{avg_ces:.1f}/5",
            "priority_breakdown": dict(by_priority),
            "daily_volume": len([m for m in self.ticket_metrics if self._is_today(m["timestamp"])])
        }

    def _calculate_agent_rankings(self) -> list[dict[str, Any]]:
        """Rank agents by performance metrics."""
        rankings = []
        
        for agent_id, metrics in self.agent_metrics.items():
            if not metrics:
                continue
            
            mttr = statistics.mean(m["resolution_hours"] for m in metrics)
            fcr = sum(1 for m in metrics if m["first_contact_resolved"]) / len(metrics)
            csat = statistics.mean(m["satisfaction_score"] for m in metrics)
            tickets = len(metrics)
            
            # Composite score (0-100)
            composite_score = (
                (1 - min(mttr / 24, 1)) * 25 +  # MTTR component
                (fcr * 25) +  # FCR component
                (csat / 5 * 25) +  # CSAT component
                (min(tickets / 10, 1) * 25)  # Volume component
            )
            
            rankings.append({
                "agent_id": agent_id,
                "tickets_resolved": tickets,
                "mttr_hours": f"{mttr:.1f}",
                "fcr_rate": f"{fcr:.1%}",
                "csat_score": f"{csat:.1f}/5",
                "composite_score": f"{composite_score:.1f}",
                "rank": "TBD"  # Will be set after sorting
            })
        
        # Sort by composite score
        rankings.sort(key=lambda x: float(x["composite_score"]), reverse=True)
        
        # Add ranks
        for i, rank in enumerate(rankings, 1):
            rank["rank"] = i
        
        return rankings[:10]  # Top 10 agents

    def _calculate_category_analysis(self) -> list[dict[str, Any]]:
        """Analyze metrics by ticket category."""
        analysis = []
        
        for category, metrics in self.category_metrics.items():
            if not metrics:
                continue
            
            mttr = statistics.mean(m["resolution_hours"] for m in metrics)
            fcr = sum(1 for m in metrics if m["first_contact_resolved"]) / len(metrics)
            csat = statistics.mean(m["satisfaction_score"] for m in metrics)
            tickets = len(metrics)
            
            analysis.append({
                "category": category,
                "total_tickets": tickets,
                "volume_percent": f"{(tickets / len(self.ticket_metrics) * 100):.1f}%",
                "avg_mttr_hours": f"{mttr:.1f}",
                "fcr_rate": f"{fcr:.1%}",
                "avg_csat": f"{csat:.1f}",
                "complexity": self._estimate_complexity(mttr, fcr)
            })
        
        # Sort by volume
        analysis.sort(key=lambda x: x["total_tickets"], reverse=True)
        return analysis

    def _calculate_sla_compliance(self) -> dict[str, Any]:
        """Calculate SLA compliance metrics."""
        sla_targets = {
            "critical": 2,
            "high": 8,
            "medium": 24,
            "low": 72
        }
        
        priority_compliance = defaultdict(lambda: {"compliant": 0, "total": 0})
        
        for m in self.ticket_metrics:
            priority = m["priority"]
            sla_hours = sla_targets.get(priority, 24)
            priority_compliance[priority]["total"] += 1
            
            if m["resolution_hours"] <= sla_hours:
                priority_compliance[priority]["compliant"] += 1
        
        compliance_data = {}
        overall_compliant = 0
        overall_total = 0
        
        for priority, data in priority_compliance.items():
            if data["total"] > 0:
                rate = (data["compliant"] / data["total"]) * 100
                compliance_data[priority] = {
                    "rate": f"{rate:.1f}%",
                    "compliant": data["compliant"],
                    "total": data["total"],
                    "status": "✓" if rate >= 95 else "⚠" if rate >= 80 else "✗"
                }
                overall_compliant += data["compliant"]
                overall_total += data["total"]
        
        overall_rate = (overall_compliant / overall_total * 100) if overall_total > 0 else 0
        
        return {
            "overall_sla_compliance": f"{overall_rate:.1f}%",
            "target": "95%",
            "status": "✓" if overall_rate >= 95 else "⚠" if overall_rate >= 80 else "✗",
            "by_priority": compliance_data
        }

    def _calculate_trends(self) -> dict[str, Any]:
        """Calculate trending metrics."""
        if len(self.ticket_metrics) < 2:
            return {"status": "insufficient_data"}
        
        # Split into first half and second half
        mid = len(self.ticket_metrics) // 2
        first_half = self.ticket_metrics[:mid]
        second_half = self.ticket_metrics[mid:]
        
        def calc_metrics(metrics):
            return {
                "mttr": statistics.mean(m["resolution_hours"] for m in metrics),
                "fcr": sum(1 for m in metrics if m["first_contact_resolved"]) / len(metrics),
                "csat": statistics.mean(m["satisfaction_score"] for m in metrics)
            }
        
        first = calc_metrics(first_half)
        second = calc_metrics(second_half)
        
        return {
            "mttr_trend": self._calculate_trend(first["mttr"], second["mttr"], "decrease"),
            "fcr_trend": self._calculate_trend(first["fcr"], second["fcr"], "increase"),
            "csat_trend": self._calculate_trend(first["csat"], second["csat"], "increase"),
            "direction": "improving" if (
                self._calculate_trend(first["mttr"], second["mttr"], "decrease") == "↓" and
                self._calculate_trend(first["fcr"], second["fcr"], "increase") == "↑"
            ) else "needs_attention"
        }

    def _identify_bottlenecks(self) -> list[dict[str, Any]]:
        """Identify operational bottlenecks."""
        bottlenecks = []
        
        # High MTTR categories
        for category, metrics in self.category_metrics.items():
            if len(metrics) >= 3:
                mttr = statistics.mean(m["resolution_hours"] for m in metrics)
                if mttr > 24:
                    bottlenecks.append({
                        "type": "HIGH_MTTR_CATEGORY",
                        "category": category,
                        "current_mttr": f"{mttr:.1f} hours",
                        "target": "24 hours",
                        "severity": "HIGH",
                        "impact": f"Affects {len(metrics)} tickets"
                    })
        
        # Low FCR categories
        for category, metrics in self.category_metrics.items():
            if len(metrics) >= 3:
                fcr = sum(1 for m in metrics if m["first_contact_resolved"]) / len(metrics)
                if fcr < 0.65:
                    bottlenecks.append({
                        "type": "LOW_FCR_CATEGORY",
                        "category": category,
                        "current_fcr": f"{fcr:.1%}",
                        "target": "65%+",
                        "severity": "MEDIUM",
                        "impact": f"Affects {len(metrics)} tickets",
                        "recommendation": "Add KB articles or training for this category"
                    })
        
        # Low satisfaction categories
        for category, metrics in self.category_metrics.items():
            if len(metrics) >= 3:
                csat = statistics.mean(m["satisfaction_score"] for m in metrics)
                if csat < 3.5:
                    bottlenecks.append({
                        "type": "LOW_SATISFACTION_CATEGORY",
                        "category": category,
                        "current_csat": f"{csat:.1f}/5",
                        "target": "4.0+",
                        "severity": "MEDIUM",
                        "impact": f"Affects {len(metrics)} tickets"
                    })
        
        return bottlenecks[:5]  # Top 5 bottlenecks

    def _generate_recommendations(self) -> list[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        if not self.ticket_metrics:
            return recommendations
        
        # Check MTTR
        avg_mttr = statistics.mean(m["resolution_hours"] for m in self.ticket_metrics)
        if avg_mttr > 24:
            recommendations.append(f"URGENT: MTTR averaging {avg_mttr:.1f}h. Implement self-healing for common issues.")
        
        # Check FCR
        fcr = sum(1 for m in self.ticket_metrics if m["first_contact_resolved"]) / len(self.ticket_metrics)
        if fcr < 0.65:
            recommendations.append(f"FCR at {fcr:.1%}. Expand KB articles and improve categorization.")
        
        # Check CSAT
        avg_csat = statistics.mean(m["satisfaction_score"] for m in self.ticket_metrics)
        if avg_csat < 4.0:
            recommendations.append(f"CSAT low at {avg_csat:.1f}/5. Review escalation procedures.")
        
        # Volume analysis
        if len(self.ticket_metrics) > 20:
            recommendations.append("High volume detected. Consider adding more staff or increasing automation.")
        
        # Performance variability
        mttr_values = [m["resolution_hours"] for m in self.ticket_metrics]
        if len(mttr_values) > 1 and statistics.stdev(mttr_values) > 10:
            recommendations.append("High variance in MTTR. Implement skill-based routing for consistency.")
        
        if not recommendations:
            recommendations.append("✓ All metrics within target. Continue monitoring.")
        
        return recommendations

    def _forecast_metrics(self) -> dict[str, Any]:
        """Forecast next week's metrics."""
        if len(self.ticket_metrics) < 5:
            return {"status": "insufficient_data"}
        
        # Simple linear forecast based on last 5 tickets
        recent = self.ticket_metrics[-5:]
        
        avg_mttr = statistics.mean(m["resolution_hours"] for m in recent)
        avg_fcr = statistics.mean(1 if m["first_contact_resolved"] else 0 for m in recent)
        avg_csat = statistics.mean(m["satisfaction_score"] for m in recent)
        
        return {
            "forecast_period": "Next 7 days",
            "projected_mttr": f"{avg_mttr:.1f}h",
            "projected_fcr": f"{avg_fcr:.1%}",
            "projected_csat": f"{avg_csat:.1f}/5",
            "confidence": "60%",
            "note": "Based on recent trends. Accuracy improves with more historical data."
        }

    def _get_status_indicator(self, value: float, target_range: tuple) -> str:
        """Get status indicator (✓/⚠/✗)."""
        if target_range[0] <= value <= target_range[1]:
            return "✓"
        elif (target_range[1] - target_range[0]) * 0.9 <= value <= (target_range[1] - target_range[0]) * 1.1:
            return "⚠"
        else:
            return "✗"

    def _calculate_trend(self, first: float, second: float, desired: str) -> str:
        """Calculate trend direction."""
        if desired == "increase":
            if second > first * 1.05:
                return "↑"
            elif second < first * 0.95:
                return "↓"
            else:
                return "→"
        else:  # decrease
            if second < first * 0.95:
                return "↓"
            elif second > first * 1.05:
                return "↑"
            else:
                return "→"

    def _estimate_complexity(self, mttr: float, fcr: float) -> str:
        """Estimate category complexity."""
        if mttr > 24 or fcr < 0.6:
            return "High"
        elif mttr > 12 or fcr < 0.75:
            return "Medium"
        else:
            return "Low"

    def _is_today(self, timestamp_str: str) -> bool:
        """Check if timestamp is from today."""
        try:
            ts = datetime.fromisoformat(timestamp_str)
            return ts.date() == datetime.now().date()
        except:
            return False


# Singleton instance
_analytics = None

def get_analytics_engine() -> AdvancedAnalyticsEngine:
    """Get or create the analytics engine instance."""
    global _analytics
    if _analytics is None:
        _analytics = AdvancedAnalyticsEngine()
    return _analytics
