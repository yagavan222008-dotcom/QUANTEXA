from __future__ import annotations

from datetime import datetime

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.dataset import Dataset
from app.models.market_data import MarketData


class MarketDataRepository:

    # ============================================================
    # WRITE OPERATIONS
    # ============================================================

    def get_or_create_asset(
        self,
        db: Session,
        symbol: str,
        name: str,
        asset_type: str = "equity",
        currency: str = "USD",
    ) -> Asset:

        symbol = symbol.upper()

        asset = db.scalar(
            select(Asset).where(
                Asset.symbol == symbol
            )
        )

        if asset is not None:
            return asset

        asset = Asset(
            symbol=symbol,
            name=name,
            asset_type=asset_type,
            currency=currency,
            is_active=True,
        )

        db.add(asset)
        db.flush()

        return asset

    def create_dataset(
        self,
        db: Session,
        asset_id: int,
        source: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime,
        version: str,
    ) -> Dataset:

        dataset = Dataset(
            asset_id=asset_id,
            source=source,
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date,
            version=version,
        )

        db.add(dataset)
        db.flush()

        return dataset

    def insert_market_data(
        self,
        db: Session,
        dataset_id: int,
        dataframe: pd.DataFrame,
    ) -> int:

        if dataframe.empty:
            return 0

        records = []

        for timestamp, row in dataframe.iterrows():

            volume = row["volume"]

            if pd.isna(volume):
                volume = None
            else:
                volume = float(volume)

            records.append(
                MarketData(
                    dataset_id=dataset_id,
                    timestamp=timestamp.to_pydatetime(),
                    open=float(row["open"]),
                    high=float(row["high"]),
                    low=float(row["low"]),
                    close=float(row["close"]),
                    volume=volume,
                )
            )

        db.add_all(records)
        db.flush()

        return len(records)

    # ============================================================
    # READ OPERATIONS
    # ============================================================

    def list_assets(
        self,
        db: Session,
    ) -> list[Asset]:

        statement = (
            select(Asset)
            .where(
                Asset.is_active.is_(True)
            )
            .order_by(
                Asset.symbol.asc()
            )
        )

        return list(
            db.scalars(statement).all()
        )

    def get_asset(
        self,
        db: Session,
        symbol: str,
    ) -> Asset | None:

        symbol = symbol.upper()

        return db.scalar(
            select(Asset).where(
                Asset.symbol == symbol
            )
        )

    def get_latest_dataset(
        self,
        db: Session,
        asset_id: int,
    ) -> Dataset | None:

        statement = (
            select(Dataset)
            .where(
                Dataset.asset_id == asset_id
            )
            .order_by(
                Dataset.created_at.desc()
            )
        )

        return db.scalar(statement)

    def get_market_data(
        self,
        db: Session,
        dataset_id: int,
    ) -> pd.DataFrame:

        statement = (
            select(MarketData)
            .where(
                MarketData.dataset_id == dataset_id
            )
            .order_by(
                MarketData.timestamp.asc()
            )
        )

        rows = db.scalars(statement).all()

        if not rows:
            return pd.DataFrame(
                columns=[
                    "open",
                    "high",
                    "low",
                    "close",
                    "volume",
                ]
            )

        records = []

        for row in rows:

            records.append(
                {
                    "timestamp": row.timestamp,
                    "open": float(row.open),
                    "high": float(row.high),
                    "low": float(row.low),
                    "close": float(row.close),
                    "volume": (
                        float(row.volume)
                        if row.volume is not None
                        else None
                    ),
                }
            )

        dataframe = pd.DataFrame(records)

        dataframe["timestamp"] = pd.to_datetime(
            dataframe["timestamp"]
        )

        dataframe = dataframe.set_index(
            "timestamp"
        )

        return dataframe

    def get_market_data_range(
        self,
        db: Session,
        dataset_id: int,
        start_date: datetime,
        end_date: datetime,
    ) -> pd.DataFrame:

        statement = (
            select(MarketData)
            .where(
                MarketData.dataset_id == dataset_id,
                MarketData.timestamp >= start_date,
                MarketData.timestamp <= end_date,
            )
            .order_by(
                MarketData.timestamp.asc()
            )
        )

        rows = db.scalars(statement).all()

        if not rows:
            return pd.DataFrame(
                columns=[
                    "open",
                    "high",
                    "low",
                    "close",
                    "volume",
                ]
            )

        records = []

        for row in rows:

            records.append(
                {
                    "timestamp": row.timestamp,
                    "open": float(row.open),
                    "high": float(row.high),
                    "low": float(row.low),
                    "close": float(row.close),
                    "volume": (
                        float(row.volume)
                        if row.volume is not None
                        else None
                    ),
                }
            )

        dataframe = pd.DataFrame(records)

        dataframe["timestamp"] = pd.to_datetime(
            dataframe["timestamp"]
        )

        dataframe = dataframe.set_index(
            "timestamp"
        )

        return dataframe