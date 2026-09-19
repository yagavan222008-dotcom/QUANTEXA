from __future__ import annotations

import json
import logging
import urllib.request
import urllib.error
from typing import Any

from app.core.config import settings
from app.engines.ai.prompts import QUANT_COPILOT_SYSTEM_PROMPT, MANDATORY_DISCLAIMER
from app.engines.ai.safety import redact_ai_output

logger = logging.getLogger("quantext.ai.client")

class FeatherlessAIClient:
    """
    Featherless AI Client for Quant Copilot.
    Handles communication with Featherless API with key security, timeout handling, and test mocking.
    """
    def __init__(self, api_key: str | None = None) -> None:
        self._api_key = api_key or settings.FEATHERLESS_API_KEY
        self._base_url = "https://api.featherless.ai/v1/chat/completions"

    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def generate_explanation(
        self,
        query: str,
        tool_results: dict[str, Any],
        mock_mode: bool = False,
    ) -> str:
        """
        Generate AI explanation based on verified tool numerical results.
        If mock_mode is True or API key is not configured, provides a structured deterministic synthesis.
        """
        if mock_mode or not self.is_configured():
            logger.info("Using Featherless AI synthesis engine (mock/offline mode).")
            return self._generate_mock_explanation(query, tool_results)

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        prompt_payload = {
            "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
            "messages": [
                {"role": "system", "content": QUANT_COPILOT_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Query: {query}\n\nNumerical Data:\n{json.dumps(tool_results, indent=2, default=str)}"
                }
            ],
            "temperature": 0.2,
            "max_tokens": 1000,
        }

        try:
            req = urllib.request.Request(
                url=self._base_url,
                data=json.dumps(prompt_payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                body = response.read().decode("utf-8")
                res_json = json.loads(body)
                raw_text = res_json["choices"][0]["message"]["content"]
                return redact_ai_output(raw_text)

        except (urllib.error.URLError, urllib.error.HTTPError, KeyError, json.JSONDecodeError) as exc:
            logger.warning("Featherless API call failed or timed out: %s. Falling back to local quantitative synthesis.", exc)
            return self._generate_mock_explanation(query, tool_results)

    def _generate_mock_explanation(
        self,
        query: str,
        tool_results: dict[str, Any],
    ) -> str:
        """
        Deterministic quantitative explanation builder for test/offline environments.
        Guarantees zero hallucinated values and strict alignment with tool results.
        """
        summary_lines = []
        for tool_name, result in tool_results.items():
            if isinstance(result, dict) and "error" in result:
                summary_lines.append(f"- **{tool_name}**: Error encountered - {result['error']}")
            else:
                summary_lines.append(f"- **{tool_name}**: Successfully calculated verified metrics.")

        analysis = "\n".join(summary_lines) if summary_lines else "No specific tool calculations were executed."

        explanation = (
            f"### Quantitative Copilot Analysis\n\n"
            f"**Query**: {query}\n\n"
            f"**Verified Engine Results**:\n{analysis}\n\n"
            f"**Calculated Results & Metrics**:\n"
            f"```json\n{json.dumps(tool_results, indent=2, default=str)}\n```\n\n"
            f"**Historical Observations**:\n"
            f"Analysis based on ingested historical market pricing data from Quantexa engines.\n\n"
            f"**Interpretation**:\n"
            f"All metrics above were generated directly by Quantexa's backend quantitative engines.\n\n"
            f"_{MANDATORY_DISCLAIMER}_"
        )
        return redact_ai_output(explanation)
