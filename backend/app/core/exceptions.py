"""Application-specific exception types and handlers."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base exception for domain-level failures."""

    def __init__(self, message: str, *, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    """Return a standardized JSON error payload for domain failures."""

    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    """Normalize HTTP exceptions for the demo-ready API surface."""

    detail = exc.detail if isinstance(exc.detail, str) else "Unexpected error"
    return JSONResponse(status_code=exc.status_code, content={"error": detail})


def register_exception_handlers(app: FastAPI) -> None:
    """Attach reusable exception handlers to the FastAPI app."""

    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
