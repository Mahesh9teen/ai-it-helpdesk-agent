"""Structured logging configuration for the backend service."""

from __future__ import annotations

import logging


def configure_logging(level: int | str = logging.INFO) -> None:
    """Configure application logging with a stable production-friendly format."""

    logging.basicConfig(level=level, format="%(asctime)s %(levelname)s %(name)s %(message)s")
