from __future__ import annotations

import re
import logging
from typing import Any

logger = logging.getLogger("quantext.ai.safety")

# Specific, conservative malicious injection patterns.
# Designed NOT to trigger on legitimate finance queries containing words like "system", "instructions", "ignore" in context.
EXPLICIT_INJECTION_PATTERNS = [
    re.compile(r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+instructions\s+and\s+(print|output|display|show|reveal)"),
    re.compile(r"(?i)(reveal|show|print|output|display|dump)\s+(the\s+)?(system\s+prompt|api_key|secret_key|environment\s+variables|env\s+file|\.env)"),
    re.compile(r"(?i)system\s+override\s*:\s*you\s+are\s+now"),
    re.compile(r"(?i)jailbreak\s+mode"),
    re.compile(r"(?i)<script[\s>]"),
    re.compile(r"(?i)SELECT\s+.*\s+FROM\s+information_schema"),
]

SECRET_REDACTION_PATTERNS = [
    re.compile(r"(?i)(FEATHERLESS_API_KEY|ALPHA_VANTAGE_API_KEY|SECRET_KEY|DATABASE_URL)[\s=:\"]+([^\s,&\"]+)"),
    re.compile(r"sk-[a-zA-Z0-9_-]{16,}"),
    re.compile(r"eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}"),  # JWT
]

def check_prompt_injection(query: str) -> tuple[bool, str | None]:
    """
    Conservative prompt injection check for the AI pipeline.
    Returns (is_injection, reason).
    Allows legitimate financial queries containing terms like 'system', 'instructions', 'ignore'.
    """
    if not query or not isinstance(query, str):
        return False, None

    for pattern in EXPLICIT_INJECTION_PATTERNS:
        if pattern.search(query):
            logger.warning("Prompt injection attempt detected: %s", query[:100])
            return True, "Potential prompt injection or safety rule violation detected."

    return False, None

def redact_ai_output(output: str) -> str:
    """
    Ensure AI explanation text never exposes system secrets or internal paths.
    """
    if not isinstance(output, str):
        return output

    cleaned = output
    for pattern in SECRET_REDACTION_PATTERNS:
        def _repl(m: re.Match) -> str:
            if m.lastindex and m.lastindex >= 1:
                prefix = m.group(1)
                return f"{prefix}=[REDACTED]"
            return "[REDACTED]"
        cleaned = pattern.sub(_repl, cleaned)

    return cleaned

def sanitize_tool_output(data: Any) -> Any:
    """
    Ensure tool outputs sent to LLM are clean JSON-serializable dictionaries without secrets.
    """
    if isinstance(data, dict):
        return {k: sanitize_tool_output(v) for k, v in data.items() if not k.lower().endswith("key") and not k.lower().endswith("secret")}
    elif isinstance(data, list):
        return [sanitize_tool_output(item) for item in data]
    return data
