from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class BacktestRequest(BaseModel):
    symbol: str = Field(
        min_length=1,
        max_length=20,
    )

    strategy: str = Field(
        min_length=1,
        max_length=50,
    )

    parameters: dict[str, Any] = Field(
        default_factory=dict
    )

    initial_capital: float = Field(
        default=100000.0,
        gt=0,
    )

    transaction_cost: float = Field(
        default=0.001,
        ge=0,
    )

    slippage: float = Field(
        default=0.001,
        ge=0,
    )

    risk_free_rate: float = Field(
        default=0.0,
        ge=0,
    )


class TradeResponse(BaseModel):
    side: str
    quantity: float
    entry_price: float
    entry_time: datetime
    exit_price: float | None
    exit_time: datetime | None
    fees: float
    pnl: float | None


class BacktestMetrics(BaseModel):
    initial_capital: float
    final_capital: float
    total_return: float
    annualized_return: float
    annualized_volatility: float
    sharpe_ratio: float
    maximum_drawdown: float

    trade_count: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    average_trade_pnl: float
    gross_profit: float
    gross_loss: float
    profit_factor: float


class BacktestConfig(BaseModel):
    initial_capital: float
    final_capital: float
    total_return: float
    transaction_cost: float
    slippage: float
    start_date: datetime
    end_date: datetime


class StrategyInfo(BaseModel):
    name: str
    parameters: dict[str, Any]


class BenchmarkResponse(BaseModel):
    name: str
    initial_capital: float
    final_capital: float
    total_return: float
    equity_curve: list[float]


class ComparisonResponse(BaseModel):
    strategy_metrics: dict[str, Any]
    benchmark_metrics: dict[str, Any]
    return_difference: float
    final_capital_difference: float
    strategy_outperformed: bool


class BacktestResponse(BaseModel):
    experiment_id: int

    symbol: str

    strategy: StrategyInfo

    backtest: BacktestConfig

    metrics: BacktestMetrics

    trades: list[TradeResponse]

    equity_curve: list[float]

    benchmark: BenchmarkResponse

    comparison: ComparisonResponse