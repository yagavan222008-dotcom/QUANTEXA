from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.data.repositories.market_data_repository import (
    MarketDataRepository,
)


class MarketDataService:

    def __init__(self) -> None:
        self.repository = MarketDataRepository()
        self.data_service = QuantDataService()

    def get_asset_overview(
        self,
        db: Session,
        symbol: str,
    ) -> dict:

        asset = self.repository.get_asset(
            db=db,
            symbol=symbol,
        )

        if asset is None:
            raise ValueError(
                f"Asset '{symbol}' not found"
            )

        dataframe = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if dataframe.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        latest_price = float(dataframe["close"].iloc[-1])

        previous_price = None

        if len(dataframe) >= 2:
            previous_price = float(
                dataframe["close"].iloc[-2]
            )

        change_percent = None

        if (
            previous_price is not None
            and previous_price != 0
        ):
            change_percent = (
                (latest_price - previous_price)
                / previous_price
            ) * 100

        return {
            "symbol": asset.symbol,
            "name": asset.name,
            "asset_type": asset.asset_type,
            "currency": asset.currency,
            "latest_price": latest_price,
            "previous_price": previous_price,
            "change_percent": change_percent,
            "data_start": dataframe.index.min().to_pydatetime(),
            "data_end": dataframe.index.max().to_pydatetime(),
        }

    def get_market_history(
        self,
        db: Session,
        symbol: str,
    ) -> dict:

        asset = self.repository.get_asset(
            db=db,
            symbol=symbol,
        )

        if asset is None:
            raise ValueError(
                f"Asset '{symbol}' not found"
            )

        dataframe = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if dataframe.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        data = []

        for timestamp, row in dataframe.iterrows():
            data.append(
                {
                    "timestamp": timestamp.to_pydatetime(),
                    "open": float(row["open"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "close": float(row["close"]),
                    "volume": (
                        float(row["volume"])
                        if row["volume"] is not None
                        else None
                    ),
                }
            )

        return {
            "symbol": asset.symbol,
            "timeframe": "1d",
            "start_date": dataframe.index.min().to_pydatetime(),
            "end_date": dataframe.index.max().to_pydatetime(),
            "data": data,
        }
