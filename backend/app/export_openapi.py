"""Export the FastAPI OpenAPI schema to a YAML file."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI


def export_openapi_schema(app: FastAPI, output_path: str | Path = Path("docs") / "openapi.yaml") -> Path:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    schema: dict[str, Any] = app.openapi()
    path.write_text(yaml.safe_dump(schema, sort_keys=False), encoding="utf-8")
    return path


def main() -> int:
    from app.main import app

    export_openapi_schema(app)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
