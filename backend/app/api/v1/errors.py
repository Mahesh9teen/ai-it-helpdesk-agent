"""Error analysis API endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body

from app.services.error_ai_service import get_error_analyzer

router = APIRouter(prefix="/errors", tags=["Error Analysis"])


@router.post("/analyze")
async def analyze_error(
    error_type: str = Body(...),
    error_message: str = Body(...),
    error_context: dict[str, Any] | None = Body(None),
    traceback: str | None = Body(None),
) -> dict[str, Any]:
    """
    Analyze an application error using AI.
    
    Args:
        error_type: Type of error (e.g., 'ValidationError', 'DatabaseConnectionError')
        error_message: The error message
        error_context: Additional context information
        traceback: Full stack trace if available
        
    Returns:
        AI diagnosis with suggested fixes and auto-fix recommendations
    """
    analyzer = await get_error_analyzer()
    
    analysis = await analyzer.analyze_error(
        error_type=error_type,
        error_message=error_message,
        error_context=error_context,
        traceback=traceback
    )
    
    return analysis


@router.post("/auto-fix")
async def execute_auto_fix(
    error_type: str = Body(...),
    auto_fix_action: str | None = Body(None),
    context: dict[str, Any] | None = Body(None),
) -> dict[str, Any]:
    """
    Execute automatic error recovery.
    
    Args:
        error_type: Type of error
        auto_fix_action: The auto-fix action to execute
        context: Error context information
        
    Returns:
        Result of auto-fix attempt
    """
    analyzer = await get_error_analyzer()
    
    result = await analyzer.execute_auto_fix(
        error_type=error_type,
        auto_fix_action=auto_fix_action,
        context=context or {}
    )
    
    return result
