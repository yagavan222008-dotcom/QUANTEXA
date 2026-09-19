from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.data.normalizer import normalize_market_data
from app.engines.data.validator import validate_market_data
from app.engines.data.providers.yahoo_finance import YahooFinanceProvider
from app.engines.data.repositories.market_data_repository import (
    MarketDataRepository,
)


class MarketDataIngestionService:

    def __init__(self):
        self.provider = YahooFinanceProvider()
        self.repository = MarketDataRepository()

    def ingest_asset(
        self,
        db: Session,
        symbol: str,
        name: str,
        asset_type: str,
        currency: str = "USD",
        period: str = "1y",
    ) -> dict:

        dataframe = self.provider.get_daily_data(
            symbol=symbol,
            period=period,
        )

        dataframe = normalize_market_data(dataframe)

        validate_market_data(dataframe)

        if dataframe.empty:
            raise ValueError(
                f"No valid market data available for {symbol}"
            )

        asset = self.repository.get_or_create_asset(
            db=db,
            symbol=symbol,
            name=name,
            asset_type=asset_type,
            currency=currency,
        )

        dataset = self.repository.create_dataset(
            db=db,
            asset_id=asset.id,
            source="yahoo_finance",
            timeframe="1d",
            start_date=dataframe.index.min().to_pydatetime(),
            end_date=dataframe.index.max().to_pydatetime(),
            version="yfinance-1.7.0",
        )

        row_count = self.repository.insert_market_data(
            db=db,
            dataset_id=dataset.id,
            dataframe=dataframe,
        )

        db.commit()

        return {
            "asset_id": asset.id,
            "dataset_id": dataset.id,
            "symbol": asset.symbol,
            "name": asset.name,
            "asset_type": asset.asset_type,
            "rows_inserted": row_count,
            "start_date": dataframe.index.min(),
            "end_date": dataframe.index.max(),
            "source": "yahoo_finance",
        }

    def ingest_equity(
        self,
        db: Session,
        symbol: str,
        name: str,
        period: str = "1y",
    ) -> dict:

        return self.ingest_asset(
            db=db,
            symbol=symbol,
            name=name,
            asset_type="equity",
            currency="USD",
            period=period,
        )