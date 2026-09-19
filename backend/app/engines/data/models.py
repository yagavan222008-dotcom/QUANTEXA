from __future__ import annotations

from dataclasses import dataclass

from pandas import DataFrame


@dataclass
class MarketDataRequest:
    symbol: str
    start_date: str
    end_date: str
    interval: str = "1d"


@dataclass
class MarketDataResult:
    symbol: str
    interval: str
    dataframe: DataFrame
    source: str