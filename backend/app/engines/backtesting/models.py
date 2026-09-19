from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class Position:
    quantity: float = 0.0
    entry_price: float = 0.0
    entry_time: datetime | None = None


@dataclass
class Trade:
    side: str
    quantity: float
    entry_price: float
    entry_time: datetime

    exit_price: float | None = None
    exit_time: datetime | None = None

    fees: float = 0.0
    pnl: float | None = None


@dataclass
class BacktestResult:
    """
    Complete result produced by the backtesting engine.

    Metadata fields allow QuantExa to reproduce and compare
    different experiments and parameter configurations.
    """

    initial_capital: float
    final_capital: float
    total_return: float

    trades: list[Trade] = field(default_factory=list)
    equity_curve: list[float] = field(default_factory=list)

    # =========================================================
    # RESEARCH METADATA
    # =========================================================

    strategy_name: str | None = None
    strategy_parameters: dict[str, Any] = field(
        default_factory=dict
    )

    transaction_cost: float = 0.0
    slippage: float = 0.0

    start_date: datetime | None = None
    end_date: datetime | None = None

    benchmark_name: str | None = None