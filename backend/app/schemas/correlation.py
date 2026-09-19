from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class CorrelationResponse(BaseModel):
    method: str
    assets: list[str]
    observations: int
    matrix: dict[str, dict[str, float | None]]


class RollingCorrelationPoint(BaseModel):
    timestamp: datetime
    correlation: float


class RollingCorrelationResponse(BaseModel):
    asset_a: str
    asset_b: str
    window: int
    observations: int
    data: list[RollingCorrelationPoint]
