from __future__ import annotations

from datetime import date

import pandas as pd
import yfinance as yf


class YahooFinanceProvider:
    SOURCE_NAME = "yahoo_finance"

    def get_daily_data(
        self,
        symbol: str,
        period: str = "1y",
    ) -> pd.DataFrame:

        if not symbol:
            raise ValueError("symbol cannot be empty")

        data = yf.download(
            symbol.upper(),
            period=period,
            interval="1d",
            auto_adjust=False,
            progress=False,
        )

        if data.empty:
            raise ValueError(
                f"No market data returned for {symbol}"
            )

        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        data = data.rename(
            columns={
                "Open": "open",
                "High": "high",
                "Low": "low",
                "Close": "close",
                "Volume": "volume",
            }
        )

        required_columns = [
            "open",
            "high",
            "low",
            "close",
            "volume",
        ]

        missing = [
            column
            for column in required_columns
            if column not in data.columns
        ]

        if missing:
            raise ValueError(
                f"Missing required columns: {missing}"
            )

        data = data[required_columns].copy()

        data.index = pd.to_datetime(data.index)

        if data.index.tz is not None:
            data.index = data.index.tz_localize(None)

        data = data.sort_index()

        return data

    @staticmethod
    def filter_date_range(
        data: pd.DataFrame,
        start_date: date | str,
        end_date: date | str,
    ) -> pd.DataFrame:

        start = pd.Timestamp(start_date)
        end = pd.Timestamp(end_date)

        if start > end:
            raise ValueError(
                "start_date cannot be after end_date"
            )

        return data.loc[
            (data.index >= start)
            & (data.index <= end)
        ].copy()
