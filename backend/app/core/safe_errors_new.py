from __future__ import annotations

import re
import logging
from typing import Any
from fastapi.responses import JSONResponse
from fastapi import status

logger = logging.getLogger("quantext.safe_errors")

# Sensitive key patterns to redact
SENSITIVE_PATTERNS = [
    re.compile(r"(?i)(password|passwd|secret|api_key|token|authorization|bearer|jwt)[\"':\s=]+([^\s,&\"]+)")
]

INTERNAL_PATH_PATTERN = re.compile(r"[A-Za-z]:\\[^:\n\r\t]+")
SQL_PATTERN = re.compile(r"(?i)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TABLE|WHERE)\s+")

def sanitize_sensitive_data(data: Any) -> Any:
    """
    Recursively redact sensitive credentials (passwords, tokens, API keys)
    and scrub internal file paths or raw SQL strings.
    """
    if isinstance(data, dict):
        sanitized = {}
        for key, value in data.items():
            key_lower = str(key).lower()
            if any(k in key_lower for k in ("password", "secret", "token", "api_key", "key", "authorization")):
                sanitized[key] = "[REDACTED]"
            else:
                sanitized[key] = sanitize_sensitive_data(value)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_sensitive_data(item) for item in data]
    elif isinstance(data, str):
        cleaned = data
        for pattern in SENSITIVE_PATTERNS:
            cleaned = pattern.sub(r"\1=[REDACTED]", cleaned)
        cleaned = INTERNAL_PATH_PATTERN.sub("[REDACTED_PATH]", cleaned)
        return cleaned
    return data

def build_safe_error_response(
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail: str | None = None,
) -> JSONResponse:
    """
    Build a standardized, safe JSON error response that never leaks internal details,
    stack traces, credentials, or filesystem paths.
    """
    if status_code >= 500 or detail is None:
        safe_detail = "An internal server error occurred."
    else:
        # Sanitize user-facing details to ensure no sensitive text is accidentally leaked
        safe_detail = str(sanitize_sensitive_data(detail))

    return JSONResponse(
        status_code=status_code,
        content={"detail": safe_detail},
    )

def handle_exception_safely(exc: Exception) -> JSONResponse:
    """
    Log full exception internally for debugging while returning a sanitized response.
    """
    logger.exception("Internal error captured safely: %s", exc)
    return build_safe_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An internal server error occurred.",
    )
