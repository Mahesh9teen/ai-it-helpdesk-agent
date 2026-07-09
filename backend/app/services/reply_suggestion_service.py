"""AI-powered agent reply suggestion service."""

from __future__ import annotations

import json
from typing import Optional

import ollama
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.services.similar_tickets_service import find_similar_tickets


async def generate_reply_suggestion(
    ticket_id: str,
    ticket_title: str,
    ticket_description: str,
    agent_partial_reply: Optional[str] = None,
    conversation_history: Optional[list[dict]] = None,
    session: AsyncSession = None,
) -> dict:
    """
    Generate AI suggestion for IT agent's reply to a ticket.
    
    Args:
        ticket_id: Jira ticket ID
        ticket_title: Ticket title
        ticket_description: Ticket description
        agent_partial_reply: What the agent has typed so far (optional)
        conversation_history: Previous messages in ticket
        session: DB session
    
    Returns:
        {
            "suggestion": "we have identified the issue...",
            "full_reply": "Thank you for reporting this...we have identified...",
            "confidence": 0.92,
            "sources": ["similar_ticket_123", "KB_article_456"]
        }
    """
    settings = get_settings()
    
    # Get similar tickets for context
    similar_tickets = await find_similar_tickets(
        query=f"{ticket_title} {ticket_description}",
        ticket_id=ticket_id,
        limit=3,
    )
    
    # Build context
    context_lines = []
    
    if similar_tickets:
        context_lines.append("Similar previously-solved tickets:")
        for ticket in similar_tickets[:2]:
            context_lines.append(
                f"  - {ticket['ticket_id']}: {ticket['title']} "
                f"(Resolution: {ticket['resolution'][:100]}...)"
            )
    
    context_str = "\n".join(context_lines) if context_lines else ""
    
    # Build prompt
    prompt = f"""You are an expert IT helpdesk agent. Generate a helpful, professional response to this support ticket.

TICKET INFORMATION:
Title: {ticket_title}
Description: {ticket_description}

CONTEXT:
{context_str}

CONVERSATION:
{json.dumps(conversation_history or [], indent=2)}

Agent has started typing: "{agent_partial_reply or ''}"

Generate the next sentence/paragraph the agent should type. Be:
1. Technical but clear
2. Specific (include commands if relevant)
3. Solution-oriented
4. Professional

Return JSON:
{{
    "suggestion": "the next sentence or paragraph to type",
    "confidence": 0.92,
    "explanation": "why this suggestion was made"
}}"""

    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        result_text = response.get("message", {}).get("content", "{}")
        result = json.loads(result_text)
        
        # Build full reply if agent started typing
        full_reply = agent_partial_reply or "Thank you for reporting this issue. "
        if agent_partial_reply:
            full_reply = agent_partial_reply + " " + result.get("suggestion", "")
        else:
            full_reply = result.get("suggestion", "")
        
        sources = [ticket["ticket_id"] for ticket in similar_tickets[:2]]
        
        return {
            "suggestion": result.get("suggestion", ""),
            "full_reply": full_reply.strip(),
            "confidence": result.get("confidence", 0.85),
            "explanation": result.get("explanation", ""),
            "sources": sources,
        }
    
    except Exception as e:
        print(f"Error generating reply suggestion: {e}")
        return {
            "suggestion": "",
            "full_reply": agent_partial_reply or "",
            "confidence": 0.0,
            "explanation": f"Error: {str(e)}",
            "sources": [],
        }


async def get_multiple_suggestions(
    ticket_id: str,
    ticket_title: str,
    ticket_description: str,
    session: AsyncSession = None,
    count: int = 3,
) -> list[dict]:
    """
    Generate multiple alternative suggestions for agent to choose from.
    
    Returns:
        [
            {"suggestion": "option 1", "tone": "formal", "confidence": 0.92},
            {"suggestion": "option 2", "tone": "friendly", "confidence": 0.88},
            {"suggestion": "option 3", "tone": "technical", "confidence": 0.85},
        ]
    """
    settings = get_settings()
    
    tones = ["formal and professional", "friendly and approachable", "technical and detailed"]
    suggestions = []
    
    for tone in tones[:count]:
        prompt = f"""Generate an IT helpdesk response in a {tone} tone.

Ticket: {ticket_title}
Issue: {ticket_description}

Respond with JSON: {{"suggestion": "response text", "confidence": 0.9}}"""

        try:
            response = ollama.chat(
                model=settings.ollama_model_name,
                messages=[{"role": "user", "content": prompt}],
                format="json",
            )
            result = json.loads(response.get("message", {}).get("content", "{}"))
            result["tone"] = tone
            suggestions.append(result)
        except Exception:
            continue
    
    return suggestions
