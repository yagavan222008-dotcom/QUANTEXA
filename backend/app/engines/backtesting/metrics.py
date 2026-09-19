from __future__ import annotations

import math

import numpy as np
import pandas as pd

from app.engines.backtesting.models import BacktestResult


TRADING_DAYS_PER_YEAR = 252


def calculate_total_return(
    initial_capital: float,
    final_capital: float,
) -> float:
    """
    Calculate total portfolio return.

    Example:
        10000 -> 11000 = 10%
    """

    if initial_capital <= 0:
        raise ValueError(
            "initial_capital must be greater than 0"
        )

    return (final_capital / initial_capital) - 1


def calculate_annualized_return(
    initial_capital: float,
    final_capital: float,
    periods: int,
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
) -> float:
    """
    Calculate annualized compound return.

    periods:
        Number of observations in the backtest.
    """

    if initial_capital <= 0:
        raise ValueError(
            "initial_capital must be greater than 0"
        )

    if final_capital <= 0:
        return float("nan")

    if periods <= 0:
        raise ValueError(
            "periods must be greater than 0"
        )

    if periods_per_year <= 0:
        raise ValueError(
            "periods_per_year must be greater than 0"
        )

    years = periods / periods_per_year

    if years <= 0:
        return float("nan")

    return float(
        (final_capital / initial_capital) ** (1 / years) - 1
    )


def calculate_returns_from_equity(
    equity_curve: list[float],
) -> pd.Series:
    """
    Convert an equity curve into periodic returns.
    """

    if not equity_curve:
        return pd.Series(dtype="float64")

    equity = pd.Series(
        equity_curve,
        dtype="float64",
    )

    if (equity <= 0).any():
        raise ValueError(
            "Equity curve must contain only positive values"
        )

    return equity.pct_change().dropna()


def calculate_annualized_volatility(
    equity_curve: list[float],
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
) -> float:
    """
    Calculate annualized portfolio volatility.
    """

    if periods_per_year <= 0:
        raise ValueError(
            "periods_per_year must be greater than 0"
        )

    returns = calculate_returns_from_equity(
        equity_curve
    )

    if len(returns) < 2:
        return float("nan")

    volatility = returns.std()

    if pd.isna(volatility):
        return float("nan")

    return float(
        volatility * math.sqrt(periods_per_year)
    )


def calculate_sharpe_ratio(
    equity_curve: list[float],
    risk_free_rate: float = 0.0,
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
) -> float:
    """
    Calculate annualized Sharpe ratio.

    Uses periodic portfolio returns and a periodic
    risk-free rate.
    """

    if periods_per_year <= 0:
        raise ValueError(
            "periods_per_year must be greater than 0"
        )

    returns = calculate_returns_from_equity(
        equity_curve
    )

    if returns.empty:
        return float("nan")

    periodic_risk_free_rate = (
        (1 + risk_free_rate)
        ** (1 / periods_per_year)
    ) - 1

    excess_returns = (
        returns - periodic_risk_free_rate
    )

    volatility = excess_returns.std()

    if volatility == 0 or pd.isna(volatility):
        return float("nan")

    return float(
        (excess_returns.mean() / volatility)
        * math.sqrt(periods_per_year)
    )


def calculate_drawdown_series(
    equity_curve: list[float],
) -> pd.Series:
    """
    Calculate drawdown at every point in the equity curve.
    """

    if not equity_curve:
        return pd.Series(dtype="float64")

    equity = pd.Series(
        equity_curve,
        dtype="float64",
    )

    running_peak = equity.cummax()

    return (equity / running_peak) - 1


def calculate_maximum_drawdown(
    equity_curve: list[float],
) -> float:
    """
    Calculate maximum portfolio drawdown.
    """

    drawdowns = calculate_drawdown_series(
        equity_curve
    )

    if drawdowns.empty:
        return float("nan")

    return float(drawdowns.min())


def calculate_trade_statistics(
    result: BacktestResult,
) -> dict:
    """
    Calculate trade-level statistics.
    """

    completed_trades = [
        trade
        for trade in result.trades
        if trade.pnl is not None
    ]

    if not completed_trades:
        return {
            "trade_count": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": float("nan"),
            "average_trade_pnl": float("nan"),
            "gross_profit": 0.0,
            "gross_loss": 0.0,
            "profit_factor": float("nan"),
        }

    pnls = [
        float(trade.pnl)
        for trade in completed_trades
    ]

    winning_trades = [
        pnl for pnl in pnls
        if pnl > 0
    ]

    losing_trades = [
        pnl for pnl in pnls
        if pnl < 0
    ]

    gross_profit = sum(winning_trades)

    gross_loss = abs(
        sum(losing_trades)
    )

    trade_count = len(pnls)

    win_rate = (
        len(winning_trades) / trade_count
    )

    average_trade_pnl = (
        sum(pnls) / trade_count
    )

    if gross_loss == 0:
        profit_factor = float("inf")

    else:
        profit_factor = (
            gross_profit / gross_loss
        )

    return {
        "trade_count": trade_count,
        "winning_trades": len(winning_trades),
        "losing_trades": len(losing_trades),
        "win_rate": float(win_rate),
        "average_trade_pnl": float(
            average_trade_pnl
        ),
        "gross_profit": float(
            gross_profit
        ),
        "gross_loss": float(
            gross_loss
        ),
        "profit_factor": float(
            profit_factor
        ),
    }


def calculate_backtest_metrics(
    result: BacktestResult,
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
    risk_free_rate: float = 0.0,
) -> dict:
    """
    Calculate complete quantitative performance metrics
    for a backtest result.
    """

    equity_curve = result.equity_curve

    total_return = calculate_total_return(
        initial_capital=result.initial_capital,
        final_capital=result.final_capital,
    )

    annualized_return = calculate_annualized_return(
        initial_capital=result.initial_capital,
        final_capital=result.final_capital,
        periods=len(equity_curve),
        periods_per_year=periods_per_year,
    )

    annualized_volatility = (
        calculate_annualized_volatility(
            equity_curve=equity_curve,
            periods_per_year=periods_per_year,
        )
    )

    sharpe_ratio = calculate_sharpe_ratio(
        equity_curve=equity_curve,
        risk_free_rate=risk_free_rate,
        periods_per_year=periods_per_year,
    )

    maximum_drawdown = calculate_maximum_drawdown(
        equity_curve
    )

    trade_statistics = calculate_trade_statistics(
        result
    )

    return {
        "initial_capital": float(
            result.initial_capital
        ),
        "final_capital": float(
            result.final_capital
        ),
        "total_return": float(
            total_return
        ),
        "annualized_return": float(
            annualized_return
        ),
        "annualized_volatility": float(
            annualized_volatility
        ),
        "sharpe_ratio": float(
            sharpe_ratio
        ),
        "maximum_drawdown": float(
            maximum_drawdown
        ),
        **trade_statistics,
    }