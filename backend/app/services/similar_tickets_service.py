"""Similar ticket search using FAISS vector similarity."""

from __future__ import annotations

from typing import Optional
import json

import ollama
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.rag.vector_store import get_vector_store


async def find_similar_tickets(
    query: str,
    ticket_id: Optional[str] = None,
    limit: int = 5,
) -> list[dict]:
    """
    Find similar tickets using FAISS vector search.
    
    Args:
        query: Search query (natural language)
        ticket_id: Optional ticket ID to exclude from results
        limit: Number of results to return
    
    Returns:
        List of similar tickets with similarity scores and resolutions
        [
            {
                "ticket_id": "JIRA-123",
                "title": "VPN keeps disconnecting",
                "similarity_score": 0.95,
                "resolution": "Update VPN client to latest version",
                "resolved_by": "Agent Name",
                "resolved_at": "2024-01-15"
            },
            ...
        ]
    """
    settings = get_settings()
    
    try:
        vector_store = get_vector_store()
        if not vector_store:
            return []
        
        # Search in FAISS for similar documents
        # This searches your knowledge base - results will include relevant tickets
        results = vector_store.similarity_search(query, k=limit)
        
        # Format results
        similar_tickets = []
        for doc in results:
            # Parse metadata from document
            metadata = getattr(doc, 'metadata', {})
            
            # Skip if same ticket
            if metadata.get('ticket_id') == ticket_id:
                continue
            
            similar_tickets.append({
                "ticket_id": metadata.get('ticket_id', 'UNKNOWN'),
                "title": metadata.get('title', doc.page_content[:100]),
                "similarity_score": round(
                    1.0 - (getattr(doc, 'distance', 0) or 0), 2
                ),  # Convert distance to similarity
                "resolution": metadata.get('resolution', doc.page_content),
                "resolved_by": metadata.get('resolved_by', 'Unknown'),
                "resolved_at": metadata.get('resolved_at', 'Unknown'),
            })
        
        return similar_tickets[:limit]
    
    except Exception as e:
        print(f"Error searching for similar tickets: {e}")
        return []


async def get_similar_tickets_summary(
    ticket_id: str,
    ticket_title: str,
    ticket_description: str,
    session: AsyncSession,
) -> dict:
    """
    Get similar tickets with AI-generated insights.
    
    Returns:
        {
            "similar_tickets": [...],
            "recommendation": "Consider using solution from JIRA-123",
            "duplicate_likelihood": 0.87
        }
    """
    similar = await find_similar_tickets(
        query=f"{ticket_title} {ticket_description}",
        ticket_id=ticket_id,
        limit=3,
    )
    
    if not similar:
        return {
            "similar_tickets": [],
            "recommendation": "No similar tickets found",
            "duplicate_likelihood": 0.0,
        }
    
    # Use LLM to generate recommendation
    settings = get_settings()
    top_similar = similar[0] if similar else None
    
    if top_similar:
        prompt = f"""Based on this comparison, should we mark the new ticket as duplicate?

New Ticket: "{ticket_title}"
Description: {ticket_description[:200]}

Similar Ticket Found: "{top_similar['title']}"
Resolution: {top_similar['resolution']}
Similarity Score: {top_similar['similarity_score']}

Return JSON: {{"duplicate_likelihood": 0.87, "recommendation": "Consider marking as duplicate. Previous solution was..."}}
"""
        
        try:
            response = ollama.chat(
                model=settings.ollama_model_name,
                messages=[{"role": "user", "content": prompt}],
                format="json",
            )
            result = json.loads(response.get("message", {}).get("content", "{}"))
            return {
                "similar_tickets": similar,
                "recommendation": result.get("recommendation", ""),
                "duplicate_likelihood": result.get("duplicate_likelihood", 0.5),
            }
        except Exception:
            pass
    
    return {
        "similar_tickets": similar,
        "recommendation": f"Found {len(similar)} similar ticket(s)",
        "duplicate_likelihood": similar[0]["similarity_score"] if similar else 0.0,
    }
