from __future__ import annotations

from datetime import date

import pandas as pd
import requests

from app.core.config import settings


class AlphaVantageProvider:
    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self) -> None:
        if not settings.ALPHA_VANTAGE_API_KEY:
            raise ValueError("ALPHA_VANTAGE_API_KEY is not configured")

        self.api_key = settings.ALPHA_VANTAGE_API_KEY

    def get_daily_equity_data(
        self,
        symbol: str,
        outputsize: str = "compact",
    ) -> pd.DataFrame:

        if not symbol:
            raise ValueError("symbol cannot be empty")

        if outputsize not in {"compact", "full"}:
            raise ValueError("outputsize must be 'compact' or 'full'")

        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol.upper(),
            "outputsize": outputsize,
            "apikey": self.api_key,
        }

        response = requests.get(
            self.BASE_URL,
            params=params,
            timeout=30,
        )

        response.raise_for_status()

        payload = response.json()

        self._check_api_errors(payload)

        time_series = payload.get("Time Series (Daily)")

        if not time_series:
            raise ValueError(
                "Alpha Vantage returned no daily time-series data"
            )

        rows = []

        for timestamp, values in time_series.items():
            rows.append(
                {
                    "timestamp": pd.to_datetime(timestamp),
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": float(values["5. volume"]),
                }
            )

        dataframe = pd.DataFrame(rows)

        if dataframe.empty:
            raise ValueError("No market data was returned")

        dataframe = dataframe.set_index("timestamp")
        dataframe = dataframe.sort_index()

        return dataframe

    @staticmethod
    def filter_date_range(
        data: pd.DataFrame,
        start_date: date | str,
        end_date: date | str,
    ) -> pd.DataFrame:

        start = pd.Timestamp(start_date)
        end = pd.Timestamp(end_date)

        if start > end:
            raise ValueError("start_date cannot be after end_date")

        if data.empty:
            return data.copy()

        return data.loc[
            (data.index >= start)
            & (data.index <= end)
        ].copy()

    @staticmethod
    def _check_api_errors(payload: dict) -> None:

        if "Error Message" in payload:
            raise ValueError(
                f"Alpha Vantage error: {payload['Error Message']}"
            )

        if "Note" in payload:
            raise RuntimeError(
                f"Alpha Vantage API notice: {payload['Note']}"
            )

        if "Information" in payload:
            raise RuntimeError(
                f"Alpha Vantage information: {payload['Information']}"
            )
