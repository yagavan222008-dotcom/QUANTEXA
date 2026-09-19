from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class RobustnessRequest(BaseModel):
    symbol: str = Field(
        min_length=1,
        max_length=20,
    )

    strategy: str = Field(
        min_length=1,
        max_length=50,
    )

    parameter_grid: dict[str, list[Any]]

    transaction_costs: list[float] = Field(
        default_factory=lambda: [0.0]
    )

    slippages: list[float] = Field(
        default_factory=lambda: [0.0]
    )

    initial_capital: float = Field(
        default=100000.0,
        gt=0,
    )


class RobustnessExperiment(BaseModel):
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


class ReturnStatistics(BaseModel):
    minimum: float
    maximum: float
    mean: float
    median: float
    standard_deviation: float


class SensitivityStatistics(BaseModel):
    experiment_count: int
    mean_return: float
    median_return: float
    minimum_return: float
    maximum_return: float


class RobustnessResponse(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float

    experiment_count: int

    parameter_grid: dict[str, list[Any]]

    transaction_costs: list[float]

    slippages: list[float]

    return_statistics: ReturnStatistics

    best_by_return: RobustnessExperiment | None

    worst_by_return: RobustnessExperiment | None

    best_by_sharpe: RobustnessExperiment | None

    lowest_drawdown: RobustnessExperiment | None

    cost_sensitivity: dict[
        str,
        SensitivityStatistics,
    ]

    slippage_sensitivity: dict[
        str,
        SensitivityStatistics,
    ]

    parameter_sensitivity: dict[
        str,
        dict[str, SensitivityStatistics],
    ]

    results: list[RobustnessExperiment]