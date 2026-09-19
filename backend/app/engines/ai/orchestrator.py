from __future__ import annotations

import logging
from typing import Any
from sqlalchemy.orm import Session

from app.engines.ai.schemas import (
    AIResearchRequest,
    AIResearchResponse,
    AIToolExecutionResult,
)
from app.engines.ai.safety import check_prompt_injection, sanitize_tool_output
from app.engines.ai.tools import QuantCopilotTools
from app.engines.ai.client import FeatherlessAIClient
from app.engines.ai.prompts import MANDATORY_DISCLAIMER

logger = logging.getLogger("quantext.ai.orchestrator")

class AIQuantOrchestrator:
    """
    AI Quant Copilot Orchestrator.
    Pipeline: User Query -> Safety Check -> Intent/Tool Selection -> Execution on Backend Engines -> Verified Numerical Data -> Featherless LLM Explanation -> Structured Response.
    """
    def __init__(self) -> None:
        self.tools = QuantCopilotTools()
        self.ai_client = FeatherlessAIClient()

    def process_research_request(
        self,
        db: Session,
        request: AIResearchRequest,
        mock_mode: bool = False,
    ) -> AIResearchResponse:
        query = request.query.strip()

        # 1. Conservative safety & prompt injection check
        is_injection, reason = check_prompt_injection(query)
        if is_injection:
            return AIResearchResponse(
                query=query,
                intent="rejected_safety",
                tools_called=[],
                tool_results=[],
                numerical_results={},
                explanation="Request could not be processed due to safety policy guidelines.",
                warnings=[reason or "Safety rule restriction."],
                interpretation="System rejected input due to suspected prompt override.",
                disclaimer=MANDATORY_DISCLAIMER,
            )

        # 2. Intent and Tool Selection
        intent, selected_tools = self._select_intent_and_tools(request)

        # 3. Tool Execution on Backend Engines
        executed_tool_results: list[AIToolExecutionResult] = []
        numerical_results: dict[str, Any] = {}
        tool_names_called: list[str] = []

        for tool_name, kwargs in selected_tools:
            tool_names_called.append(tool_name)
            try:
                tool_func = getattr(self.tools, tool_name, None)
                if not tool_func:
                    raise ValueError(f"Unknown tool: {tool_name}")

                res_data = tool_func(db=db, **kwargs)
                cleaned_data = sanitize_tool_output(res_data)
                numerical_results[tool_name] = cleaned_data
                executed_tool_results.append(
                    AIToolExecutionResult(
                        tool_name=tool_name,
                        status="success",
                        input_params=kwargs,
                        output_data=cleaned_data,
                    )
                )
            except Exception as exc:
                logger.warning("Tool execution error [%s]: %s", tool_name, exc)
                numerical_results[tool_name] = {"error": str(exc)}
                executed_tool_results.append(
                    AIToolExecutionResult(
                        tool_name=tool_name,
                        status="error",
                        input_params=kwargs,
                        error_message=str(exc),
                    )
                )

        # 4. Generate LLM Explanation grounded strictly in numerical results
        explanation = self.ai_client.generate_explanation(
            query=query,
            tool_results=numerical_results,
            mock_mode=mock_mode,
        )

        # 5. Build structured response fields
        calculated_results_summary = self._extract_calculated_summary(numerical_results)
        historical_obs = [f"Analyzed query '{query}' against Quantexa backend market data and quantitative models."]
        assumptions = ["Execution model assumes zero default slippage unless specified.", "Risk-free rate assumed as configured."]
        warnings = []
        if any(r.status == "error" for r in executed_tool_results):
            warnings.append("One or more quantitative engine tool calls encountered errors during execution.")

        return AIResearchResponse(
            query=query,
            intent=intent,
            tools_called=tool_names_called,
            tool_results=executed_tool_results,
            numerical_results=numerical_results,
            explanation=explanation,
            calculated_results=calculated_results_summary,
            historical_observations=historical_obs,
            assumptions=assumptions,
            warnings=warnings,
            interpretation="Quantitative metrics computed by backend engines and summarized by Quant Copilot.",
            disclaimer=MANDATORY_DISCLAIMER,
        )

    def _select_intent_and_tools(self, request: AIResearchRequest) -> tuple[str, list[tuple[str, dict[str, Any]]]]:
        query_lower = request.query.lower()
        symbol = request.symbol or "NVDA"
        strategy = request.strategy or "sma_crossover"
        params = request.parameters or {}

        tools_to_run: list[tuple[str, dict[str, Any]]] = []
        intent = "general_research"

        if "volatility" in query_lower:
            intent = "volatility_analysis"
            tools_to_run.append(("calculate_volatility", {"symbol": symbol}))
        elif "sharpe" in query_lower:
            intent = "sharpe_analysis"
            tools_to_run.append(("calculate_sharpe", {"symbol": symbol}))
        elif "drawdown" in query_lower:
            intent = "drawdown_analysis"
            tools_to_run.append(("calculate_drawdown", {"symbol": symbol}))
        elif "correlation" in query_lower:
            intent = "correlation_analysis"
            if "rolling" in query_lower:
                tools_to_run.append(("calculate_rolling_correlation", {"asset_a": symbol, "asset_b": params.get("asset_b", "BTC-USD")}))
            else:
                symbols_list = params.get("symbols", [symbol, "BTC-USD", "GC=F"])
                tools_to_run.append(("calculate_correlation", {"symbols": symbols_list}))
        elif "backtest" in query_lower or "sma" in query_lower or "ema" in query_lower or "momentum" in query_lower or "strategy" in query_lower:
            intent = "strategy_backtest"
            tools_to_run.append(("run_backtest", {"symbol": symbol, "strategy_name": strategy, "strategy_parameters": params}))
            tools_to_run.append(("compare_benchmark", {"symbol": symbol, "strategy_name": strategy, "strategy_parameters": params}))
        elif "regime" in query_lower:
            intent = "market_regime"
            tools_to_run.append(("analyze_market_regime", {"symbol": symbol}))
        elif "robustness" in query_lower:
            intent = "robustness_test"
            grid = params.get("parameter_grid", {"fast_period": [10, 20], "slow_period": [30, 50]})
            tools_to_run.append(("run_robustness_test", {"symbol": symbol, "strategy_name": strategy, "parameter_grid": grid}))
        elif "integrity" in query_lower:
            intent = "integrity_check"
            tools_to_run.append(("check_backtest_integrity", {"dataset_id": params.get("dataset_id", 1)}))
        else:
            # Default fallback analysis
            intent = "multi_factor_analysis"
            tools_to_run.append(("calculate_sharpe", {"symbol": symbol}))
            tools_to_run.append(("calculate_volatility", {"symbol": symbol}))

        return intent, tools_to_run

    def _extract_calculated_summary(self, numerical_results: dict[str, Any]) -> list[str]:
        summary = []
        for tool_name, data in numerical_results.items():
            if isinstance(data, dict):
                for k, v in data.items():
                    if isinstance(v, (int, float)) and not isinstance(v, bool):
                        summary.append(f"{tool_name}.{k}: {v:.4f}")
        return summary
