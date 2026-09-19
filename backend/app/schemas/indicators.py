from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class IndicatorParameters(BaseModel):
    sma_fast: int
    sma_slow: int
    ema_fast: int
    ema_slow: int
    rolling_window: int
    volatility_window: int


class IndicatorLatest(BaseModel):
    timestamp: datetime
    price: float | None
    sma_fast: float | None
    sma_slow: float | None
    ema_fast: float | None
    ema_slow: float | None
    daily_return: float | None
    cumulative_return: float | None
    rolling_return: float | None
    historical_volatility: float | None
    annualized_volatility: float | None
    rolling_annualized_volatility: float | None


class IndicatorPoint(BaseModel):
    timestamp: datetime
    price: float | None
    sma_fast: float | None
    sma_slow: float | None
    ema_fast: float | None
    ema_slow: float | None
    daily_return: float | None
    cumulative_return: float | None
    rolling_return: float | None
    historical_volatility: float | None
    annualized_volatility: float | None


class IndicatorResponse(BaseModel):
    symbol: str
    observations: int
    parameters: IndicatorParameters
    latest: IndicatorLatest
    series: list[IndicatorPoint]