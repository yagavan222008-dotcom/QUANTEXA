from __future__ import annotations

from dataclasses import dataclass, field
from itertools import product
from typing import Any, Callable

import numpy as np
import pandas as pd

from app.engines.backtesting.engine import BacktestEngine
from app.engines.backtesting.models import BacktestResult
from app.engines.backtesting.metrics import calculate_backtest_metrics
from app.engines.strategies.base import BaseStrategy


@dataclass
class RobustnessResult:
    """
    Result of one robustness experiment.
    """

    parameters: dict[str, Any]

    transaction_cost: float
    slippage: float

    final_capital: float
    total_return: float

    annualized_return: float
    annualized_volatility: float
    sharpe_ratio: float
    maximum_drawdown: float

    trade_count: int

    backtest_result: BacktestResult


@dataclass
class RobustnessReport:
    """
    Complete robustness analysis report.
    """

    results: list[RobustnessResult] = field(
        default_factory=list
    )

    # =========================================================
    # BASIC INFORMATION
    # =========================================================

    @property
    def experiment_count(self) -> int:
        return len(self.results)

    # =========================================================
    # RETURN STATISTICS
    # =========================================================

    def return_statistics(self) -> dict[str, float]:
        """
        Calculate statistical distribution of experiment returns.
        """

        if not self.results:
            return {
                "minimum": float("nan"),
                "maximum": float("nan"),
                "mean": float("nan"),
                "median": float("nan"),
                "standard_deviation": float("nan"),
            }

        returns = np.array(
            [
                result.total_return
                for result in self.results
            ],
            dtype=float,
        )

        return {
            "minimum": float(np.min(returns)),
            "maximum": float(np.max(returns)),
            "mean": float(np.mean(returns)),
            "median": float(np.median(returns)),
            "standard_deviation": float(
                np.std(returns, ddof=1)
            )
            if len(returns) > 1
            else 0.0,
        }

    # =========================================================
    # BEST / WORST
    # =========================================================

    def best_by_return(
        self,
    ) -> RobustnessResult | None:
        """
        Return experiment with highest total return.
        """

        if not self.results:
            return None

        return max(
            self.results,
            key=lambda result: result.total_return,
        )

    def worst_by_return(
        self,
    ) -> RobustnessResult | None:
        """
        Return experiment with lowest total return.
        """

        if not self.results:
            return None

        return min(
            self.results,
            key=lambda result: result.total_return,
        )

    def best_by_sharpe(
        self,
    ) -> RobustnessResult | None:
        """
        Return experiment with highest Sharpe ratio.
        """

        valid_results = [
            result
            for result in self.results
            if not np.isnan(result.sharpe_ratio)
        ]

        if not valid_results:
            return None

        return max(
            valid_results,
            key=lambda result: result.sharpe_ratio,
        )

    def lowest_drawdown(
        self,
    ) -> RobustnessResult | None:
        """
        Return experiment with the smallest drawdown.

        Drawdowns are negative numbers, so the value
        closest to zero is considered the lowest drawdown.
        """

        valid_results = [
            result
            for result in self.results
            if not np.isnan(result.maximum_drawdown)
        ]

        if not valid_results:
            return None

        return max(
            valid_results,
            key=lambda result: result.maximum_drawdown,
        )

    # =========================================================
    # COST SENSITIVITY
    # =========================================================

    def cost_sensitivity(self) -> dict[float, dict]:
        """
        Calculate average performance for each
        transaction-cost assumption.
        """

        grouped: dict[float, list[RobustnessResult]] = {}

        for result in self.results:
            grouped.setdefault(
                result.transaction_cost,
                [],
            ).append(result)

        output = {}

        for cost, results in grouped.items():

            returns = [
                result.total_return
                for result in results
            ]

            output[cost] = {
                "experiment_count": len(results),
                "mean_return": float(
                    np.mean(returns)
                ),
                "median_return": float(
                    np.median(returns)
                ),
                "minimum_return": float(
                    np.min(returns)
                ),
                "maximum_return": float(
                    np.max(returns)
                ),
            }

        return output

    # =========================================================
    # SLIPPAGE SENSITIVITY
    # =========================================================

    def slippage_sensitivity(self) -> dict[float, dict]:
        """
        Calculate average performance for each
        slippage assumption.
        """

        grouped: dict[float, list[RobustnessResult]] = {}

        for result in self.results:
            grouped.setdefault(
                result.slippage,
                [],
            ).append(result)

        output = {}

        for slippage, results in grouped.items():

            returns = [
                result.total_return
                for result in results
            ]

            output[slippage] = {
                "experiment_count": len(results),
                "mean_return": float(
                    np.mean(returns)
                ),
                "median_return": float(
                    np.median(returns)
                ),
                "minimum_return": float(
                    np.min(returns)
                ),
                "maximum_return": float(
                    np.max(returns)
                ),
            }

        return output

    # =========================================================
    # PARAMETER SENSITIVITY
    # =========================================================

    def parameter_sensitivity(
        self,
        parameter_name: str,
    ) -> dict[Any, dict]:
        """
        Calculate performance statistics for each
        value of a strategy parameter.
        """

        grouped: dict[
            Any,
            list[RobustnessResult],
        ] = {}

        for result in self.results:

            if parameter_name not in result.parameters:
                continue

            value = result.parameters[
                parameter_name
            ]

            grouped.setdefault(
                value,
                [],
            ).append(result)

        output = {}

        for value, results in grouped.items():

            returns = [
                result.total_return
                for result in results
            ]

            output[value] = {
                "experiment_count": len(results),
                "mean_return": float(
                    np.mean(returns)
                ),
                "median_return": float(
                    np.median(returns)
                ),
                "minimum_return": float(
                    np.min(returns)
                ),
                "maximum_return": float(
                    np.max(returns)
                ),
            }

        return output


class RobustnessEngine:
    """
    QuantExa robustness testing engine.

    Tests strategy performance across:

        - strategy parameters
        - transaction costs
        - slippage

    Every configuration produces an independent
    BacktestResult.
    """

    def __init__(
        self,
        initial_capital: float = 100000.0,
    ):
        if initial_capital <= 0:
            raise ValueError(
                "initial_capital must be greater than 0"
            )

        self.initial_capital = float(
            initial_capital
        )

    # =========================================================
    # RUN ROBUSTNESS ANALYSIS
    # =========================================================

    def run(
        self,
        data: pd.DataFrame,
        strategy_factory: Callable[
            [dict[str, Any]],
            BaseStrategy,
        ],
        parameter_grid: dict[
            str,
            list[Any],
        ],
        transaction_costs: list[float] | None = None,
        slippages: list[float] | None = None,
    ) -> RobustnessReport:
        """
        Run all parameter/cost/slippage combinations.
        """

        # =====================================================
        # VALIDATE DATA
        # =====================================================

        if data.empty:
            raise ValueError(
                "Cannot run robustness analysis "
                "on empty data"
            )

        if "close" not in data.columns:
            raise ValueError(
                "Input data must contain a 'close' column"
            )

        # =====================================================
        # DEFAULT COST / SLIPPAGE
        # =====================================================

        if transaction_costs is None:
            transaction_costs = [0.0]

        if slippages is None:
            slippages = [0.0]

        self._validate_cost_grid(
            transaction_costs,
            "transaction_costs",
        )

        self._validate_cost_grid(
            slippages,
            "slippages",
        )

        # =====================================================
        # VALIDATE PARAMETER GRID
        # =====================================================

        if not parameter_grid:
            raise ValueError(
                "parameter_grid cannot be empty"
            )

        for parameter_name, values in (
            parameter_grid.items()
        ):

            if not values:
                raise ValueError(
                    f"Parameter '{parameter_name}' "
                    f"has no test values"
                )

        # =====================================================
        # GENERATE PARAMETER COMBINATIONS
        # =====================================================

        parameter_names = list(
            parameter_grid.keys()
        )

        parameter_values = [
            parameter_grid[name]
            for name in parameter_names
        ]

        parameter_combinations = product(
            *parameter_values
        )

        # =====================================================
        # RUN EXPERIMENTS
        # =====================================================

        results: list[RobustnessResult] = []

        for combination in parameter_combinations:

            parameters = dict(
                zip(
                    parameter_names,
                    combination,
                )
            )

            # -----------------------------------------------
            # Create strategy for this configuration
            # -----------------------------------------------

            strategy = strategy_factory(
                parameters
            )

            for transaction_cost in (
                transaction_costs
            ):

                for slippage in slippages:

                    # ---------------------------------------
                    # Create independent backtest engine
                    # ---------------------------------------

                    engine = BacktestEngine(
                        initial_capital=(
                            self.initial_capital
                        ),
                        transaction_cost=(
                            transaction_cost
                        ),
                        slippage=slippage,
                    )

                    # ---------------------------------------
                    # Run backtest
                    # ---------------------------------------

                    backtest_result = engine.run(
                        data=data,
                        strategy=strategy,
                    )

                    # ---------------------------------------
                    # Calculate complete metrics
                    # ---------------------------------------

                    metrics = (
                        calculate_backtest_metrics(
                            backtest_result
                        )
                    )

                    # ---------------------------------------
                    # Store robustness result
                    # ---------------------------------------

                    results.append(
                        RobustnessResult(
                            parameters=parameters.copy(),

                            transaction_cost=(
                                transaction_cost
                            ),

                            slippage=slippage,

                            final_capital=(
                                backtest_result.final_capital
                            ),

                            total_return=(
                                backtest_result.total_return
                            ),

                            annualized_return=(
                                metrics[
                                    "annualized_return"
                                ]
                            ),

                            annualized_volatility=(
                                metrics[
                                    "annualized_volatility"
                                ]
                            ),

                            sharpe_ratio=(
                                metrics[
                                    "sharpe_ratio"
                                ]
                            ),

                            maximum_drawdown=(
                                metrics[
                                    "maximum_drawdown"
                                ]
                            ),

                            trade_count=len(
                                backtest_result.trades
                            ),

                            backtest_result=(
                                backtest_result
                            ),
                        )
                    )

        return RobustnessReport(
            results=results
        )

    # =========================================================
    # VALIDATION
    # =========================================================

    @staticmethod
    def _validate_cost_grid(
        values: list[float],
        name: str,
    ) -> None:
        """
        Validate transaction cost or slippage values.
        """

        for value in values:

            if value < 0:
                raise ValueError(
                    f"{name} cannot contain "
                    f"negative values"
                )