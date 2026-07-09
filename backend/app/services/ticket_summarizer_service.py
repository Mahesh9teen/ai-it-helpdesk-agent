"""AI-powered ticket comment summarization service."""

from __future__ import annotations

import json
from typing import Optional

import ollama
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings


async def summarize_ticket_comments(
    ticket_id: str,
    session: AsyncSession,
    comment_limit: int = 50,
) -> dict:
    """
    Summarize all comments in a ticket thread using AI.
    
    Args:
        ticket_id: The Jira ticket ID
        session: Database session
        comment_limit: Maximum number of comments to summarize
    
    Returns:
        {
            "summary": "concise ticket summary",
            "key_points": ["point 1", "point 2", ...],
            "resolution": "how issue was resolved",
            "confidence": 0.95
        }
    """
    settings = get_settings()
    
    # Fetch comments from DB (placeholder - adjust based on your model)
    # stmt = select(TicketComment).where(TicketComment.ticket_id == ticket_id).limit(comment_limit)
    # result = await session.execute(stmt)
    # comments = result.scalars().all()
    
    # TODO: Integrate with your Jira API or DB schema
    # For now, using demo data
    demo_comments = [
        {"author": "User", "text": "My laptop won't start after the Windows update"},
        {"author": "Agent", "text": "Have you tried a force restart? Hold power button for 10 seconds."},
        {"author": "User", "text": "Tried that, still getting boot loop error 0x80070490"},
        {"author": "Agent", "text": "That's a Windows update corruption error. Let me create a recovery USB"},
        {"author": "Agent", "text": "Recovery USB created. Please restart and boot from USB"},
        {"author": "User", "text": "It worked! Laptop is back to normal. Thanks!"},
    ]
    
    comments_text = "\n".join(
        f"{c['author']}: {c['text']}" for c in demo_comments
    )
    
    prompt = f"""Analyze this ticket conversation and provide:
1. A concise 1-2 sentence summary of the entire issue
2. Key technical points in a bullet list
3. How the issue was resolved
4. Your confidence (0-1) that this summary is accurate

Return as JSON:
{{
    "summary": "one or two sentence summary",
    "key_points": ["point1", "point2", "point3"],
    "resolution": "how it was resolved",
    "confidence": 0.95
}}

TICKET CONVERSATION:
{comments_text}"""

    try:
        response = ollama.chat(
            model=settings.ollama_model_name,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        result_text = response.get("message", {}).get("content", "{}")
        result = json.loads(result_text)
        
        # Validate response
        if all(k in result for k in ["summary", "key_points", "resolution", "confidence"]):
            return result
    except Exception as e:
        print(f"Error summarizing ticket {ticket_id}: {e}")
    
    # Fallback
    return {
        "summary": "Ticket issue analyzed",
        "key_points": ["Unable to generate key points"],
        "resolution": "Please check ticket manually",
        "confidence": 0.0,
    }
