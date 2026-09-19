from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class RegimeParameters(BaseModel):
    return_window: int
    volatility_window: int


class RegimeDistributionItem(BaseModel):
    periods: int
    percentage: float


class RegimePerformanceItem(BaseModel):
    periods: int
    total_return: float
    average_return: float
    volatility: float
    positive_periods: int
    negative_periods: int


class RegimePoint(BaseModel):
    timestamp: datetime
    regime: str
    price: float


class RegimeResponse(BaseModel):
    symbol: str
    observations: int
    parameters: RegimeParameters
    latest_regime: str | None
    distribution: dict[str, RegimeDistributionItem]
    performance: dict[str, RegimePerformanceItem]
    series: list[RegimePoint]