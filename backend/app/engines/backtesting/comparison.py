from __future__ import annotations

from dataclasses import dataclass

from app.engines.backtesting.benchmark import BenchmarkResult
from app.engines.backtesting.metrics import calculate_backtest_metrics
from app.engines.backtesting.models import BacktestResult


@dataclass
class ComparisonResult:
    """
    Comparison between a trading strategy and
    a Buy-and-Hold benchmark.
    """

    strategy_metrics: dict
    benchmark_metrics: dict

    return_difference: float
    final_capital_difference: float

    strategy_outperformed: bool


def compare_strategy_with_benchmark(
    strategy_result: BacktestResult,
    benchmark_result: BenchmarkResult,
) -> ComparisonResult:
    """
    Compare a strategy backtest against Buy-and-Hold.

    The comparison includes:

        - total return
        - final capital
        - volatility
        - Sharpe ratio
        - maximum drawdown
        - trade statistics
    """

    # =========================================================
    # STRATEGY METRICS
    # =========================================================

    strategy_metrics = calculate_backtest_metrics(
        strategy_result
    )

    # =========================================================
    # BENCHMARK METRICS
    # =========================================================

    benchmark_equity = benchmark_result.equity_curve

    # Create a temporary BacktestResult so that the
    # same metrics engine can be reused.
    benchmark_backtest = BacktestResult(
        initial_capital=benchmark_result.initial_capital,
        final_capital=benchmark_result.final_capital,
        total_return=benchmark_result.total_return,
        trades=[],
        equity_curve=benchmark_equity,
    )

    benchmark_metrics = calculate_backtest_metrics(
        benchmark_backtest
    )

    # =========================================================
    # RETURN DIFFERENCE
    # =========================================================

    return_difference = (
        strategy_metrics["total_return"]
        - benchmark_metrics["total_return"]
    )

    # =========================================================
    # FINAL CAPITAL DIFFERENCE
    # =========================================================

    final_capital_difference = (
        strategy_result.final_capital
        - benchmark_result.final_capital
    )

    # =========================================================
    # OUTPERFORMANCE
    # =========================================================

    strategy_outperformed = (
        strategy_metrics["total_return"]
        > benchmark_metrics["total_return"]
    )

    return ComparisonResult(
        strategy_metrics=strategy_metrics,
        benchmark_metrics=benchmark_metrics,
        return_difference=return_difference,
        final_capital_difference=final_capital_difference,
        strategy_outperformed=strategy_outperformed,
    )