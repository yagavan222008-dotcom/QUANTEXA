from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class StrategyInfo(BaseModel):
    name: str


class StrategyListResponse(BaseModel):
    strategies: list[StrategyInfo]


class StrategySignalRequest(BaseModel):
    symbol: str = Field(
        min_length=1,
        max_length=20,
    )

    strategy: str = Field(
        min_length=1,
        max_length=50,
    )

    parameters: dict = Field(
        default_factory=dict
    )


class StrategySignalPoint(BaseModel):
    timestamp: datetime
    signal: int
    close: float


class SignalCounts(BaseModel):
    buy_or_long: int
    hold_or_no_position: int
    sell_or_short: int


class StrategySignalResponse(BaseModel):
    symbol: str
    strategy: str
    parameters: dict
    observations: int
    latest_signal: int
    signal_counts: SignalCounts
    signals: list[StrategySignalPoint]