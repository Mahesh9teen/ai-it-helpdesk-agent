"""Error handling middleware with AI-powered diagnostics."""

from __future__ import annotations

import logging
import traceback as tb_module
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.error_ai_service import get_error_analyzer

logger = logging.getLogger(__name__)


class AIErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware that catches errors and uses AI for automatic diagnosis and fixing."""

    async def dispatch(self, request: Request, call_next: Any) -> JSONResponse:
        """Intercept requests and handle errors with AI analysis."""
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as exc:
            # Extract error information
            error_type = type(exc).__name__
            error_message = str(exc)
            error_traceback = tb_module.format_exc()
            
            # Build context
            context = {
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "error_type": error_type,
                "timestamp": request.headers.get("date", "unknown"),
            }
            
            # Add client info
            try:
                context["client"] = f"{request.client.host}:{request.client.port}" if request.client else "unknown"
            except Exception:
                context["client"] = "unknown"
            
            # Use AI to analyze the error
            analyzer = await get_error_analyzer()
            analysis = await analyzer.analyze_error(
                error_type=error_type,
                error_message=error_message,
                error_context=context,
                traceback=error_traceback
            )
            
            # Log the analysis
            logger.error(
                f"Error analyzed: {error_type} - {analysis['diagnosis']} "
                f"(Severity: {analysis['severity']}, Recovery: {analysis['recovery_status']})"
            )
            
            # Attempt auto-fix if available
            auto_fix_result = None
            if analysis.get("auto_fix_action"):
                auto_fix_result = await analyzer.execute_auto_fix(
                    error_type=error_type,
                    auto_fix_action=analysis["auto_fix_action"],
                    context=context
                )
                
                logger.info(
                    f"Auto-fix attempt: {analysis['auto_fix_action']} - "
                    f"Success: {auto_fix_result.get('success', False)}"
                )
                
                # If auto-fix successful, retry the request
                if auto_fix_result.get("success"):
                    try:
                        response = await call_next(request)
                        logger.info(f"Request succeeded after auto-fix: {request.url.path}")
                        return response
                    except Exception as retry_exc:
                        logger.error(f"Retry after auto-fix failed: {retry_exc}")
            
            # Return error response with AI diagnosis
            return JSONResponse(
                status_code=500,
                content={
                    "error": error_message,
                    "error_type": error_type,
                    "ai_diagnosis": {
                        "diagnosis": analysis["diagnosis"],
                        "severity": analysis["severity"],
                        "root_cause": analysis["root_cause"],
                        "suggested_fixes": analysis["suggested_fixes"][:3],  # Limit to 3
                    },
                    "auto_fix": {
                        "attempted": analysis.get("auto_fix_action") is not None,
                        "action": analysis.get("auto_fix_action"),
                        "result": auto_fix_result,
                    },
                    "recovery_status": analysis["recovery_status"],
                }
            )
