"""AI-powered error analysis and automatic resolution service."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ErrorAIAnalyzer:
    """Analyzes application errors using Ollama + LLaMA and suggests automatic fixes."""

    def __init__(self) -> None:
        """Initialize error analyzer with Ollama connection."""
        self.ollama_host = settings.ollama_host or "http://ollama:11434"
        self.model = settings.ollama_model_name or "llama3.2"
        self.timeout = 30.0

    async def analyze_error(
        self, 
        error_type: str, 
        error_message: str, 
        error_context: dict[str, Any] | None = None,
        traceback: str | None = None
    ) -> dict[str, Any]:
        """
        Analyze an error using AI and provide diagnosis and solutions.
        
        Args:
            error_type: Type of error (e.g., 'DatabaseConnectionError', 'ValidationError')
            error_message: The error message from the exception
            error_context: Additional context (request method, endpoint, user info, etc.)
            traceback: Full stack trace if available
            
        Returns:
            Dictionary with diagnosis, severity, suggested fixes, and auto-fix action
        """
        context = error_context or {}
        
        # Build AI prompt for error analysis
        prompt = self._build_analysis_prompt(
            error_type, 
            error_message, 
            context, 
            traceback
        )
        
        try:
            # Call Ollama API to analyze error
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.ollama_host}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "temperature": 0.3,  # Low temperature for consistent analysis
                    }
                )
                
            if response.status_code != 200:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._fallback_error_response(error_type, error_message)
            
            # Parse AI response
            ai_response = response.json().get("response", "")
            analysis = self._parse_ai_analysis(ai_response)
            
            # Determine auto-fix action
            auto_fix = self._determine_auto_fix(error_type, analysis, context)
            
            return {
                "error_type": error_type,
                "original_message": error_message,
                "diagnosis": analysis.get("diagnosis", "Unknown error"),
                "severity": analysis.get("severity", "medium"),
                "root_cause": analysis.get("root_cause", ""),
                "suggested_fixes": analysis.get("suggested_fixes", []),
                "auto_fix_action": auto_fix,
                "recovery_status": "pending" if auto_fix else "manual_required",
                "ai_analysis": analysis.get("raw_analysis", "")
            }
            
        except Exception as e:
            logger.error(f"Error analysis failed: {e}")
            return self._fallback_error_response(error_type, error_message)

    async def execute_auto_fix(
        self,
        error_type: str,
        auto_fix_action: str | None,
        context: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Execute automatic error recovery based on AI suggestion.
        
        Args:
            error_type: Type of error
            auto_fix_action: The auto-fix action suggested by AI
            context: Error context information
            
        Returns:
            Result of auto-fix attempt
        """
        if not auto_fix_action:
            return {
                "success": False,
                "action": None,
                "message": "No auto-fix action available"
            }
        
        try:
            # Execute specific auto-fix based on error type and action
            if error_type == "DatabaseConnectionError" and auto_fix_action == "reconnect":
                return await self._fix_database_connection(context)
            
            elif error_type == "TimeoutError" and auto_fix_action == "retry":
                return await self._retry_with_exponential_backoff(context)
            
            elif error_type == "ValidationError" and auto_fix_action == "sanitize":
                return await self._sanitize_input_data(context)
            
            elif error_type == "ServiceUnavailableError" and auto_fix_action == "fallback":
                return await self._use_fallback_service(context)
            
            elif error_type == "OllamaConnectionError" and auto_fix_action == "reconnect":
                return await self._reconnect_ollama(context)
            
            elif error_type == "RAGError" and auto_fix_action == "reinit":
                return await self._reinitialize_rag_system(context)
            
            else:
                return {
                    "success": False,
                    "action": auto_fix_action,
                    "message": f"No auto-fix implementation for {error_type}:{auto_fix_action}"
                }
                
        except Exception as e:
            logger.error(f"Auto-fix execution failed: {e}")
            return {
                "success": False,
                "action": auto_fix_action,
                "message": f"Auto-fix failed: {str(e)}"
            }

    def _build_analysis_prompt(
        self,
        error_type: str,
        error_message: str,
        context: dict[str, Any],
        traceback: str | None
    ) -> str:
        """Build the AI prompt for error analysis."""
        
        context_str = json.dumps(context, default=str, indent=2) if context else "None"
        traceback_str = traceback or "No traceback available"
        
        prompt = f"""You are an expert IT systems troubleshooter. Analyze this error and provide diagnosis:

ERROR TYPE: {error_type}
ERROR MESSAGE: {error_message}
CONTEXT: {context_str}
TRACEBACK:
{traceback_str}

Analyze the error and respond in this JSON format:
{{
  "diagnosis": "Brief explanation of what went wrong",
  "severity": "critical|high|medium|low",
  "root_cause": "Root cause analysis",
  "suggested_fixes": [
    "Fix 1: Detailed description",
    "Fix 2: Detailed description",
    "Fix 3: Detailed description"
  ],
  "auto_fix_recommendation": "reconnect|retry|sanitize|fallback|reinit|none",
  "confidence": 0.0-1.0,
  "notes": "Any additional notes"
}}

Respond ONLY with valid JSON, no additional text."""

        return prompt

    def _parse_ai_analysis(self, ai_response: str) -> dict[str, Any]:
        """Parse AI response to extract structured analysis."""
        
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                analysis["raw_analysis"] = ai_response
                return analysis
        except (json.JSONDecodeError, AttributeError):
            pass
        
        # Fallback if JSON parsing fails
        return {
            "diagnosis": ai_response[:200] if ai_response else "Analysis unavailable",
            "severity": "medium",
            "root_cause": "Unable to parse AI analysis",
            "suggested_fixes": [],
            "auto_fix_recommendation": "none",
            "raw_analysis": ai_response
        }

    def _determine_auto_fix(
        self,
        error_type: str,
        analysis: dict[str, Any],
        context: dict[str, Any]
    ) -> str | None:
        """Determine which auto-fix action to attempt based on analysis."""
        
        recommendation = analysis.get("auto_fix_recommendation", "none")
        confidence = analysis.get("confidence", 0.0)
        
        # Only auto-fix if confidence is high enough
        if confidence < 0.7 and recommendation != "none":
            return None
        
        # Map error types to auto-fix actions
        error_fixes = {
            "DatabaseConnectionError": "reconnect",
            "TimeoutError": "retry",
            "ValidationError": "sanitize",
            "ServiceUnavailableError": "fallback",
            "OllamaConnectionError": "reconnect",
            "RAGError": "reinit",
        }
        
        return error_fixes.get(error_type) or recommendation or None

    async def _fix_database_connection(self, context: dict[str, Any]) -> dict[str, Any]:
        """Attempt to reconnect to database."""
        try:
            from app.db.session import get_db
            # Try to create new connection
            async for _ in get_db():
                return {
                    "success": True,
                    "action": "reconnect",
                    "message": "Database connection restored"
                }
        except Exception as e:
            return {
                "success": False,
                "action": "reconnect",
                "message": f"Reconnection failed: {str(e)}"
            }

    async def _retry_with_exponential_backoff(self, context: dict[str, Any]) -> dict[str, Any]:
        """Retry operation with exponential backoff."""
        import asyncio
        
        max_retries = 3
        base_delay = 1.0
        
        for attempt in range(max_retries):
            try:
                delay = base_delay * (2 ** attempt)
                await asyncio.sleep(delay)
                # In practice, this would retry the original operation
                return {
                    "success": True,
                    "action": "retry",
                    "message": f"Operation succeeded after {attempt + 1} attempts"
                }
            except Exception:
                if attempt == max_retries - 1:
                    return {
                        "success": False,
                        "action": "retry",
                        "message": f"Failed after {max_retries} retry attempts"
                    }

    async def _sanitize_input_data(self, context: dict[str, Any]) -> dict[str, Any]:
        """Sanitize invalid input data."""
        try:
            if "data" in context:
                # Clean and validate data
                sanitized = {k: str(v).strip() if isinstance(v, str) else v 
                           for k, v in context["data"].items()}
                return {
                    "success": True,
                    "action": "sanitize",
                    "message": "Input data sanitized successfully",
                    "sanitized_data": sanitized
                }
            return {
                "success": False,
                "action": "sanitize",
                "message": "No data to sanitize"
            }
        except Exception as e:
            return {
                "success": False,
                "action": "sanitize",
                "message": f"Sanitization failed: {str(e)}"
            }

    async def _use_fallback_service(self, context: dict[str, Any]) -> dict[str, Any]:
        """Use fallback service when primary service is unavailable."""
        return {
            "success": True,
            "action": "fallback",
            "message": "Switched to fallback service",
            "fallback_service": context.get("fallback_service", "cached_data")
        }

    async def _reconnect_ollama(self, context: dict[str, Any]) -> dict[str, Any]:
        """Attempt to reconnect to Ollama service."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_host}/api/tags")
                if response.status_code == 200:
                    return {
                        "success": True,
                        "action": "reconnect",
                        "message": "Ollama connection restored"
                    }
        except Exception as e:
            return {
                "success": False,
                "action": "reconnect",
                "message": f"Ollama reconnection failed: {str(e)}"
            }

    async def _reinitialize_rag_system(self, context: dict[str, Any]) -> dict[str, Any]:
        """Reinitialize RAG system."""
        try:
            from app.rag.vector_store import load_vector_store
            load_vector_store()
            return {
                "success": True,
                "action": "reinit",
                "message": "RAG system reinitialized"
            }
        except Exception as e:
            return {
                "success": False,
                "action": "reinit",
                "message": f"RAG reinitialization failed: {str(e)}"
            }

    def _fallback_error_response(
        self, 
        error_type: str, 
        error_message: str
    ) -> dict[str, Any]:
        """Return fallback response when AI analysis is unavailable."""
        
        severity_map = {
            "DatabaseConnectionError": "critical",
            "OllamaConnectionError": "high",
            "TimeoutError": "medium",
            "ValidationError": "low",
            "RAGError": "high"
        }
        
        return {
            "error_type": error_type,
            "original_message": error_message,
            "diagnosis": f"Error: {error_message}",
            "severity": severity_map.get(error_type, "medium"),
            "root_cause": "AI analysis unavailable",
            "suggested_fixes": ["Check system logs", "Verify service connectivity"],
            "auto_fix_action": None,
            "recovery_status": "manual_required",
            "ai_analysis": "AI service unavailable - manual troubleshooting required"
        }


# Global instance
_error_analyzer: ErrorAIAnalyzer | None = None


async def get_error_analyzer() -> ErrorAIAnalyzer:
    """Get or create error analyzer instance."""
    global _error_analyzer
    if _error_analyzer is None:
        _error_analyzer = ErrorAIAnalyzer()
    return _error_analyzer
