from __future__ import annotations

import pandas as pd
from sqlalchemy.orm import Session

from app.engines.data.repositories.market_data_repository import (
    MarketDataRepository,
)


class QuantDataService:

    def __init__(self) -> None:
        self.repository = MarketDataRepository()

    def get_asset_prices(
        self,
        db: Session,
        symbol: str,
    ) -> pd.DataFrame:

        asset = self.repository.get_asset(
            db=db,
            symbol=symbol,
        )

        if asset is None:
            raise ValueError(
                f"Asset '{symbol}' not found"
            )

        dataset = self.repository.get_latest_dataset(
            db=db,
            asset_id=asset.id,
        )

        if dataset is None:
            raise ValueError(
                f"No dataset found for '{symbol}'"
            )

        dataframe = self.repository.get_market_data(
            db=db,
            dataset_id=dataset.id,
        )

        if dataframe.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        return dataframe

    def get_close_prices(
        self,
        db: Session,
        symbol: str,
    ) -> pd.Series:

        dataframe = self.get_asset_prices(
            db=db,
            symbol=symbol,
        )

        return dataframe["close"].copy()

    def get_ohlcv(
        self,
        db: Session,
        symbol: str,
    ) -> pd.DataFrame:

        return self.get_asset_prices(
            db=db,
            symbol=symbol,
        ).copy()
