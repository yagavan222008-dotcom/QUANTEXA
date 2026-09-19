from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssetOverview(BaseModel):
    symbol: str
    name: str
    asset_type: str
    currency: str
    latest_price: float
    previous_price: float | None
    change_percent: float | None
    data_start: datetime
    data_end: datetime


class AssetOverviewResponse(BaseModel):
    assets: list[AssetOverview]


class MarketDataPoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float | None


class MarketDataResponse(BaseModel):
    symbol: str
    timeframe: str
    start_date: datetime
    end_date: datetime
    data: list[MarketDataPoint]
