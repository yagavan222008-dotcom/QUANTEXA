from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.engines.backtesting.robustness import (
    RobustnessEngine,
)
from app.engines.data.quant_data import QuantDataService
from app.engines.strategies.registry import get_strategy


class RobustnessService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def run_robustness(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        parameter_grid: dict[str, list[Any]],
        transaction_costs: list[float] | None = None,
        slippages: list[float] | None = None,
        initial_capital: float = 100000.0,
    ) -> dict:

        symbol = symbol.upper()
        strategy_name = strategy_name.lower().strip()

        # =========================================================
        # 1. LOAD MARKET DATA
        # =========================================================

        data = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if data.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        # =========================================================
        # 2. VALIDATE STRATEGY
        # =========================================================

        # This also ensures the requested strategy exists.
        get_strategy(
            strategy_name=strategy_name,
            parameters={},
        )

        # =========================================================
        # 3. CREATE STRATEGY FACTORY
        # =========================================================

        def strategy_factory(
            parameters: dict[str, Any],
        ):
            return get_strategy(
                strategy_name=strategy_name,
                parameters=parameters,
            )

        # =========================================================
        # 4. RUN ROBUSTNESS ENGINE
        # =========================================================

        engine = RobustnessEngine(
            initial_capital=initial_capital,
        )

        report = engine.run(
            data=data,
            strategy_factory=strategy_factory,
            parameter_grid=parameter_grid,
            transaction_costs=transaction_costs,
            slippages=slippages,
        )

        # =========================================================
        # 5. SERIALIZE EXPERIMENT RESULTS
        # =========================================================

        results = []

        for result in report.results:

            results.append(
                {
                    "parameters": result.parameters,
                    "transaction_cost": float(
                        result.transaction_cost
                    ),
                    "slippage": float(
                        result.slippage
                    ),
                    "final_capital": float(
                        result.final_capital
                    ),
                    "total_return": float(
                        result.total_return
                    ),
                    "annualized_return": float(
                        result.annualized_return
                    ),
                    "annualized_volatility": float(
                        result.annualized_volatility
                    ),
                    "sharpe_ratio": float(
                        result.sharpe_ratio
                    ),
                    "maximum_drawdown": float(
                        result.maximum_drawdown
                    ),
                    "trade_count": int(
                        result.trade_count
                    ),
                }
            )

        # =========================================================
        # 6. RETURN STATISTICS
        # =========================================================

        return_statistics = (
            report.return_statistics()
        )

        # =========================================================
        # 7. BEST / WORST RESULTS
        # =========================================================

        best_return = report.best_by_return()
        worst_return = report.worst_by_return()
        best_sharpe = report.best_by_sharpe()
        lowest_drawdown = report.lowest_drawdown()

        # =========================================================
        # 8. SERIALIZE SUMMARY RESULT
        # =========================================================

        def serialize_summary(result):
            if result is None:
                return None

            return {
                "parameters": result.parameters,
                "transaction_cost": float(
                    result.transaction_cost
                ),
                "slippage": float(
                    result.slippage
                ),
                "final_capital": float(
                    result.final_capital
                ),
                "total_return": float(
                    result.total_return
                ),
                "annualized_return": float(
                    result.annualized_return
                ),
                "annualized_volatility": float(
                    result.annualized_volatility
                ),
                "sharpe_ratio": float(
                    result.sharpe_ratio
                ),
                "maximum_drawdown": float(
                    result.maximum_drawdown
                ),
                "trade_count": int(
                    result.trade_count
                ),
            }

        # =========================================================
        # 9. SENSITIVITY ANALYSIS
        # =========================================================

        cost_sensitivity = {
            str(k): v
            for k, v in report.cost_sensitivity().items()
        }

        slippage_sensitivity = {
            str(k): v
            for k, v in report.slippage_sensitivity().items()
        }

        parameter_sensitivity = {}

        for parameter_name in parameter_grid:

            parameter_sensitivity[
                parameter_name
            ] = {
                str(k): v
                for k, v in report.parameter_sensitivity(
                    parameter_name
                ).items()
            }

        # =========================================================
        # 10. FINAL RESPONSE
        # =========================================================

        return {
            "symbol": symbol,
            "strategy": strategy_name,
            "initial_capital": float(
                initial_capital
            ),

            "experiment_count": (
                report.experiment_count
            ),

            "parameter_grid": parameter_grid,

            "transaction_costs": (
                transaction_costs
                if transaction_costs is not None
                else [0.0]
            ),

            "slippages": (
                slippages
                if slippages is not None
                else [0.0]
            ),

            "return_statistics": (
                return_statistics
            ),

            "best_by_return": (
                serialize_summary(best_return)
            ),

            "worst_by_return": (
                serialize_summary(worst_return)
            ),

            "best_by_sharpe": (
                serialize_summary(best_sharpe)
            ),

            "lowest_drawdown": (
                serialize_summary(lowest_drawdown)
            ),

            "cost_sensitivity": (
                cost_sensitivity
            ),

            "slippage_sensitivity": (
                slippage_sensitivity
            ),

            "parameter_sensitivity": (
                parameter_sensitivity
            ),

            "results": results,
        }