from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field

class AIResearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=2000,
        description="User quantitative research question or copilot instruction"
    )
    symbol: str | None = Field(
        default=None,
        description="Optional target asset symbol e.g., NVDA, BTC-USD, GC=F"
    )
    strategy: str | None = Field(
        default=None,
        description="Optional strategy name e.g., sma_crossover, ema_trend, momentum, mean_reversion"
    )
    parameters: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional strategy or analytical parameters"
    )

class AIToolExecutionResult(BaseModel):
    tool_name: str
    status: str
    input_params: dict[str, Any]
    output_data: dict[str, Any] | None = None
    error_message: str | None = None

class AIResearchResponse(BaseModel):
    query: str
    intent: str
    tools_called: list[str]
    tool_results: list[AIToolExecutionResult]
    numerical_results: dict[str, Any]
    explanation: str
    calculated_results: list[str] = Field(default_factory=list)
    historical_observations: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    interpretation: str = ""
    disclaimer: str = "Historical performance does not guarantee future results."
