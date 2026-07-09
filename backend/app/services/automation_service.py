"""
Automation Engine Service
=========================
Handles rule matching, execution, and orchestration for auto-assignment,
escalation, approval gates, and workflow automation.

Usage:
    from app.services.automation_service import AutomationService
    
    service = AutomationService(db_session)
    result = service.process_ticket(ticket)
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
import json
import logging

logger = logging.getLogger(__name__)


class AutomationRule:
    """Represents a single automation rule"""
    
    def __init__(
        self,
        rule_id: int,
        name: str,
        conditions: List[Dict],
        action: Dict,
        secondary_action: Optional[Dict] = None,
        enabled: bool = True,
    ):
        self.id = rule_id
        self.name = name
        self.conditions = conditions
        self.action = action
        self.secondary_action = secondary_action
        self.enabled = enabled
        self.match_count = 0
        
    def matches(self, ticket: Dict) -> tuple[bool, List[str]]:
        """
        Check if ticket matches all conditions.
        Returns: (matches: bool, reasons: List[str])
        """
        if not self.enabled:
            return False, ["Rule is disabled"]
        
        reasons = []
        for condition in self.conditions:
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            
            ticket_value = ticket.get(field)
            
            if operator == "equals":
                if str(ticket_value).lower() != str(value).lower():
                    return False, [f"{field} does not equal {value}"]
                reasons.append(f"{field} equals '{value}'")
                
            elif operator == "not_equals":
                if str(ticket_value).lower() == str(value).lower():
                    return False, [f"{field} equals {value} (expected not equal)"]
                reasons.append(f"{field} not equal to '{value}'")
                
            elif operator == "contains":
                if value.lower() not in str(ticket_value).lower():
                    return False, [f"{field} does not contain '{value}'"]
                reasons.append(f"{field} contains '{value}'")
                
            elif operator == "greater_than":
                try:
                    if float(ticket_value) <= float(value):
                        return False, [f"{field} not > {value}"]
                    reasons.append(f"{field} > {value}")
                except (ValueError, TypeError):
                    return False, [f"Cannot compare {field}"]
                    
            elif operator == "less_than":
                try:
                    if float(ticket_value) >= float(value):
                        return False, [f"{field} not < {value}"]
                    reasons.append(f"{field} < {value}")
                except (ValueError, TypeError):
                    return False, [f"Cannot compare {field}"]
        
        return True, reasons
    
    def execute(self, ticket: Dict) -> Dict[str, Any]:
        """Execute the rule's action on ticket"""
        result = {
            "rule_id": self.id,
            "rule_name": self.name,
            "ticket_id": ticket.get("id"),
            "action_type": self.action.get("type"),
            "action_value": self.action.get("value"),
            "status": "executed",
            "timestamp": datetime.now().isoformat(),
        }
        
        # Execute primary action
        action_type = self.action.get("type")
        action_value = self.action.get("value")
        
        if action_type == "assign_to":
            result["action_description"] = f"Assigned to {action_value}"
            result["assigned_agent"] = action_value
            
        elif action_type == "set_priority":
            result["action_description"] = f"Priority set to {action_value}"
            result["priority"] = action_value
            
        elif action_type == "add_label":
            result["action_description"] = f"Added label '{action_value}'"
            result["label"] = action_value
            
        elif action_type == "notify_manager":
            result["action_description"] = f"Manager notification queued"
            result["notification_type"] = "manager"
            
        elif action_type == "escalate":
            result["action_description"] = f"Escalated to {action_value}"
            result["escalated_to"] = action_value
        
        # Execute secondary action if present
        if self.secondary_action:
            sec_type = self.secondary_action.get("type")
            sec_value = self.secondary_action.get("value")
            result["secondary_action"] = f"{sec_type}: {sec_value}"
        
        self.match_count += 1
        logger.info(f"Rule {self.id} executed on ticket {ticket.get('id')}")
        
        return result


class AutomationService:
    """Main automation engine service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.rules: List[AutomationRule] = []
        self.load_rules()
    
    def load_rules(self) -> None:
        """Load all enabled automation rules from database"""
        # In production, load from DB: SELECT * FROM automation_rules WHERE enabled=true
        # For demo, load sample rules
        self.rules = [
            AutomationRule(
                rule_id=1,
                name="P1 Critical → On-call Lead",
                conditions=[{"field": "priority", "operator": "equals", "value": "critical"}],
                action={"type": "assign_to", "value": "on_call_lead"},
                secondary_action={"type": "notify_channel", "value": "#incidents"},
                enabled=True,
            ),
            AutomationRule(
                rule_id=2,
                name="Network Issues → Infrastructure Team",
                conditions=[{"field": "category", "operator": "equals", "value": "Network"}],
                action={"type": "assign_to", "value": "infrastructure_team"},
                enabled=True,
            ),
            AutomationRule(
                rule_id=3,
                name="Finance Software Requests → Alex",
                conditions=[
                    {"field": "department", "operator": "equals", "value": "Finance"},
                    {"field": "category", "operator": "equals", "value": "Software Request"},
                ],
                action={"type": "assign_to", "value": "alex_rodriguez"},
                enabled=True,
            ),
        ]
    
    def process_ticket(self, ticket: Dict) -> Dict[str, Any]:
        """
        Process a ticket through automation rules.
        Returns: automation result with matched rules and executed actions
        """
        result = {
            "ticket_id": ticket.get("id"),
            "processed_at": datetime.now().isoformat(),
            "rules_evaluated": len(self.rules),
            "matched_rules": [],
            "actions_executed": [],
            "status": "success",
        }
        
        # Enrich ticket with computed fields
        ticket = self._enrich_ticket(ticket)
        
        # Evaluate each rule
        for rule in self.rules:
            matches, reasons = rule.matches(ticket)
            
            if matches:
                logger.info(f"Rule {rule.id} '{rule.name}' matched for ticket {ticket.get('id')}")
                
                # Execute the rule
                execution_result = rule.execute(ticket)
                
                result["matched_rules"].append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "match_reasons": reasons,
                })
                
                result["actions_executed"].append(execution_result)
                
                # Stop at first match (can change to allow multiple matches)
                break
        
        if not result["matched_rules"]:
            result["status"] = "no_rules_matched"
            logger.info(f"No automation rules matched for ticket {ticket.get('id')}")
        
        return result
    
    def _enrich_ticket(self, ticket: Dict) -> Dict:
        """Add computed fields for rule matching"""
        enriched = ticket.copy()
        
        # Calculate age in hours
        if "created_at" in ticket:
            created = datetime.fromisoformat(ticket["created_at"].replace("Z", "+00:00"))
            enriched["age_hours"] = (datetime.now(created.tzinfo) - created).total_seconds() / 3600
        
        # Unassigned status
        if not ticket.get("assigned_to"):
            enriched["assignee"] = "unassigned"
        
        return enriched
    
    def check_sla_breach(self, ticket: Dict) -> Optional[Dict]:
        """Check if ticket has breached SLA"""
        priority = ticket.get("priority", "low")
        sla_hours = {"critical": 2, "high": 4, "medium": 8, "low": 24}.get(priority, 24)
        
        if "created_at" in ticket:
            created = datetime.fromisoformat(ticket["created_at"].replace("Z", "+00:00"))
            elapsed = (datetime.now(created.tzinfo) - created).total_seconds() / 3600
            
            if elapsed > sla_hours:
                return {
                    "breached": True,
                    "priority": priority,
                    "sla_hours": sla_hours,
                    "elapsed_hours": elapsed,
                    "overdue_by": elapsed - sla_hours,
                }
        
        return None
    
    def auto_escalate_breached(self, ticket: Dict) -> Optional[Dict]:
        """Auto-escalate if SLA breached"""
        breach = self.check_sla_breach(ticket)
        
        if breach and breach["breached"]:
            escalation = {
                "ticket_id": ticket.get("id"),
                "reason": f"SLA breach ({breach['overdue_by']:.1f}h overdue)",
                "escalated_to": "manager",
                "timestamp": datetime.now().isoformat(),
            }
            logger.warning(f"Auto-escalated ticket {ticket.get('id')}: {escalation['reason']}")
            return escalation
        
        return None
    
    def check_approval_required(self, ticket: Dict) -> bool:
        """Check if action requires manager approval"""
        high_risk_keywords = [
            "unlock account",
            "admin access",
            "external software",
            "delete data",
            "mass provision",
        ]
        
        content = str(ticket.get("description", "")).lower()
        return any(keyword in content for keyword in high_risk_keywords)
    
    def get_rule_stats(self, rule_id: int) -> Optional[Dict]:
        """Get statistics for a rule"""
        for rule in self.rules:
            if rule.id == rule_id:
                return {
                    "rule_id": rule.id,
                    "name": rule.name,
                    "enabled": rule.enabled,
                    "matches_total": rule.match_count,
                }
        return None
    
    def create_rule(self, rule_data: Dict) -> Dict:
        """Create a new automation rule"""
        rule = AutomationRule(
            rule_id=len(self.rules) + 1,
            name=rule_data.get("name"),
            conditions=rule_data.get("conditions", []),
            action=rule_data.get("action", {}),
            secondary_action=rule_data.get("secondary", None),
            enabled=rule_data.get("enabled", True),
        )
        self.rules.append(rule)
        logger.info(f"Created automation rule: {rule.name}")
        return {"id": rule.id, "name": rule.name, "enabled": rule.enabled}
    
    def update_rule(self, rule_id: int, updates: Dict) -> Optional[Dict]:
        """Update an existing automation rule"""
        for rule in self.rules:
            if rule.id == rule_id:
                if "enabled" in updates:
                    rule.enabled = updates["enabled"]
                if "name" in updates:
                    rule.name = updates["name"]
                if "conditions" in updates:
                    rule.conditions = updates["conditions"]
                if "action" in updates:
                    rule.action = updates["action"]
                logger.info(f"Updated automation rule {rule_id}")
                return {"id": rule.id, "name": rule.name, "enabled": rule.enabled}
        return None
    
    def delete_rule(self, rule_id: int) -> bool:
        """Delete an automation rule"""
        self.rules = [r for r in self.rules if r.id != rule_id]
        logger.info(f"Deleted automation rule {rule_id}")
        return True


# Example usage:
if __name__ == "__main__":
    # Mock DB session
    class MockDB:
        pass
    
    service = AutomationService(MockDB())
    
    # Test ticket
    test_ticket = {
        "id": "TKT-091",
        "title": "Laptop screen flickering",
        "description": "Screen flickers every 30 seconds after Windows update",
        "priority": "critical",
        "category": "Hardware",
        "department": "Engineering",
        "created_at": (datetime.now() - timedelta(hours=1)).isoformat() + "Z",
    }
    
    # Process through automation
    result = service.process_ticket(test_ticket)
    print("Automation result:")
    print(json.dumps(result, indent=2))
    
    # Check SLA
    sla_check = service.check_sla_breach(test_ticket)
    print("\nSLA check:")
    print(json.dumps(sla_check, indent=2))
    
    # Check approval required
    needs_approval = service.check_approval_required(test_ticket)
    print(f"\nApproval required: {needs_approval}")
