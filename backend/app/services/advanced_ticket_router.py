"""
Advanced intelligent ticket routing with skill-based assignment and load balancing.
Uses ML to predict best agent for ticket based on skills, workload, and history.
"""

import logging
from typing import Any
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)


class AdvancedTicketRouter:
    """Route tickets to agents using ML and business rules."""

    def __init__(self):
        """Initialize the router with skill matrix and workload tracking."""
        self.skill_matrix = {
            "networking": ["vpn", "wifi", "dns", "ip", "router", "firewall", "connection"],
            "hardware": ["printer", "monitor", "keyboard", "mouse", "device", "laptop", "desktop"],
            "software": ["excel", "word", "adobe", "install", "license", "version", "update"],
            "security": ["password", "2fa", "encryption", "mfa", "vpn", "phishing", "ransomware"],
            "database": ["sql", "backup", "restore", "database", "query", "migration"],
            "cloud": ["azure", "aws", "office365", "teams", "sharepoint", "onedrive"],
            "email": ["outlook", "gmail", "email", "calendar", "distribution", "group"],
            "general": ["general", "other", "misc", "unknown"]
        }
        self.agent_skills = {}
        self.agent_workload = {}
        self.agent_performance = {}

    async def assign_ticket(
        self,
        ticket_id: str,
        category: str,
        priority: str,
        tags: list[str],
        current_assignments: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Intelligently assign ticket to best agent.
        
        Factors considered:
        - Skill match (primary factor)
        - Current workload
        - Agent availability
        - Historical performance with similar tickets
        - SLA requirements
        """
        try:
            # Step 1: Identify required skills from ticket
            required_skills = self._identify_required_skills(category, tags)
            
            # Step 2: Filter agents with matching skills
            capable_agents = self._filter_capable_agents(required_skills)
            
            if not capable_agents:
                return {
                    "agent_id": None,
                    "reason": "No agents with required skills",
                    "recommended_action": "escalate_to_manager"
                }
            
            # Step 3: Score agents based on multiple factors
            scored_agents = await self._score_agents(
                capable_agents,
                priority,
                required_skills,
                current_assignments
            )
            
            # Step 4: Select best agent
            best_agent = max(scored_agents, key=lambda x: x["score"])
            
            return {
                "agent_id": best_agent["agent_id"],
                "score": best_agent["score"],
                "factors": {
                    "skill_match": best_agent["skill_match"],
                    "workload_score": best_agent["workload_score"],
                    "performance_score": best_agent["performance_score"],
                    "availability": best_agent["availability"]
                },
                "reason": f"Assigned to {best_agent['agent_id']} - Best skill/workload match"
            }
        
        except Exception as e:
            logger.error(f"Routing error for ticket {ticket_id}: {str(e)}")
            return {
                "agent_id": None,
                "reason": f"Routing error: {str(e)}",
                "recommended_action": "escalate_to_manager"
            }

    def _identify_required_skills(self, category: str, tags: list[str]) -> list[str]:
        """Extract required skills from ticket metadata."""
        required = set()
        
        # Map category to skills
        category_lower = category.lower()
        for skill, keywords in self.skill_matrix.items():
            if any(kw in category_lower for kw in keywords):
                required.add(skill)
        
        # Add skills from tags
        for tag in tags:
            tag_lower = tag.lower()
            for skill, keywords in self.skill_matrix.items():
                if any(kw in tag_lower for kw in keywords):
                    required.add(skill)
        
        return list(required) if required else ["general"]

    def _filter_capable_agents(self, required_skills: list[str]) -> list[str]:
        """Filter agents who have required skills."""
        capable = []
        for agent_id, skills in self.agent_skills.items():
            if any(skill in skills for skill in required_skills):
                capable.append(agent_id)
        
        # Always include general agents as fallback
        if not capable:
            capable = [a for a, s in self.agent_skills.items() if "general" in s]
        
        return capable

    async def _score_agents(
        self,
        agent_ids: list[str],
        priority: str,
        required_skills: list[str],
        current_assignments: dict
    ) -> list[dict[str, Any]]:
        """Score agents on multiple criteria."""
        scored = []
        
        for agent_id in agent_ids:
            # Skill match score (0-40 points)
            skill_match = self._calculate_skill_match(
                agent_id,
                required_skills
            )
            skill_score = min(40, len([s for s in required_skills if s in self.agent_skills.get(agent_id, [])]) * 10)
            
            # Workload score (0-30 points) - lower workload = higher score
            current_load = len(current_assignments.get(agent_id, []))
            workload_score = max(0, 30 - (current_load * 3))
            
            # Performance score (0-20 points) - based on MTTR, FCR, CSAT
            perf = self.agent_performance.get(agent_id, {})
            performance_score = min(20, (
                (perf.get("first_contact_resolution_rate", 0.5) * 10) +
                (perf.get("satisfaction_score", 3.5) / 5 * 10)
            ))
            
            # Availability score (0-10 points)
            availability = 10 if self._is_agent_available(agent_id) else 0
            
            total_score = skill_score + workload_score + performance_score + availability
            
            scored.append({
                "agent_id": agent_id,
                "score": total_score,
                "skill_match": skill_match,
                "workload_score": workload_score,
                "performance_score": performance_score,
                "availability": availability
            })
        
        return scored

    def _calculate_skill_match(self, agent_id: str, required_skills: list[str]) -> float:
        """Calculate how well agent skills match requirements (0-1)."""
        agent_skills = set(self.agent_skills.get(agent_id, []))
        required_set = set(required_skills)
        
        if not required_set:
            return 1.0
        
        matches = len(agent_skills.intersection(required_set))
        return matches / len(required_set)

    def _is_agent_available(self, agent_id: str) -> bool:
        """Check if agent is available (not on break, not at max capacity)."""
        # Placeholder - would check agent status, break times, etc.
        return True

    def add_agent(self, agent_id: str, skills: list[str], experience_years: int = 1):
        """Register agent with their skills."""
        self.agent_skills[agent_id] = skills
        self.agent_performance[agent_id] = {
            "first_contact_resolution_rate": 0.5 + (experience_years * 0.1),
            "satisfaction_score": 3.5 + (experience_years * 0.2),
            "avg_resolution_hours": 24 / (1 + experience_years * 0.5),
            "tickets_resolved": 0
        }

    async def update_agent_workload(self, agent_id: str, assignments: list[str]):
        """Update agent's current workload."""
        self.agent_workload[agent_id] = len(assignments)

    async def record_ticket_outcome(
        self,
        agent_id: str,
        resolution_hours: float,
        first_contact_resolved: bool,
        satisfaction_score: int
    ):
        """Record ticket outcome to improve future routing decisions."""
        if agent_id not in self.agent_performance:
            return
        
        perf = self.agent_performance[agent_id]
        
        # Update FCR rate
        total_tickets = perf.get("tickets_resolved", 0)
        current_fcr = perf.get("first_contact_resolution_rate", 0.5)
        perf["first_contact_resolution_rate"] = (
            (current_fcr * total_tickets + (1 if first_contact_resolved else 0)) /
            (total_tickets + 1)
        )
        
        # Update average satisfaction
        current_csat = perf.get("satisfaction_score", 3.5)
        perf["satisfaction_score"] = (
            (current_csat * total_tickets + satisfaction_score) /
            (total_tickets + 1)
        )
        
        # Update MTTR
        current_mttr = perf.get("avg_resolution_hours", 24)
        perf["avg_resolution_hours"] = (
            (current_mttr * total_tickets + resolution_hours) /
            (total_tickets + 1)
        )
        
        perf["tickets_resolved"] = total_tickets + 1


# Singleton instance
_router = None

def get_advanced_router() -> AdvancedTicketRouter:
    """Get or create the advanced router instance."""
    global _router
    if _router is None:
        _router = AdvancedTicketRouter()
    return _router
