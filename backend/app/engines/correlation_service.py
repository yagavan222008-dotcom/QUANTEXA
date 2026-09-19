from __future__ import annotations

import pandas as pd
from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.indicators.returns import calculate_daily_returns
from app.engines.correlation.matrix import calculate_correlation_matrix
from app.engines.correlation.rolling import calculate_rolling_correlation


class CorrelationService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def _build_returns_dataframe(
        self,
        db: Session,
        symbols: list[str],
    ) -> pd.DataFrame:

        if len(symbols) < 2:
            raise ValueError(
                "At least two assets are required for correlation analysis"
            )

        returns = {}

        for symbol in symbols:
            symbol = symbol.upper()

            prices = self.data_service.get_close_prices(
                db=db,
                symbol=symbol,
            )

            if prices.empty:
                raise ValueError(
                    f"No price data found for '{symbol}'"
                )

            returns[symbol] = calculate_daily_returns(
                prices
            )

        dataframe = pd.DataFrame(returns)

        dataframe = dataframe.dropna(
            how="all"
        )

        return dataframe

    def analyze_matrix(
        self,
        db: Session,
        symbols: list[str],
        method: str = "pearson",
    ) -> dict:

        symbols = [
            symbol.strip().upper()
            for symbol in symbols
            if symbol.strip()
        ]

        returns = self._build_returns_dataframe(
            db=db,
            symbols=symbols,
        )

        correlation = calculate_correlation_matrix(
            returns=returns,
            method=method.lower(),
        )

        matrix = {}

        for row_symbol in correlation.index:
            matrix[row_symbol] = {}

            for column_symbol in correlation.columns:
                value = correlation.loc[
                    row_symbol,
                    column_symbol,
                ]

                matrix[row_symbol][column_symbol] = (
                    None
                    if pd.isna(value)
                    else float(value)
                )

        return {
            "method": method.lower(),
            "assets": symbols,
            "observations": len(returns),
            "matrix": matrix,
        }

    def analyze_rolling(
        self,
        db: Session,
        asset_a: str,
        asset_b: str,
        window: int = 30,
    ) -> dict:

        asset_a = asset_a.upper()
        asset_b = asset_b.upper()

        returns = self._build_returns_dataframe(
            db=db,
            symbols=[asset_a, asset_b],
        )

        rolling = calculate_rolling_correlation(
            returns=returns,
            asset_a=asset_a,
            asset_b=asset_b,
            window=window,
        )

        data = []

        for timestamp, value in rolling.items():

            if pd.isna(value):
                continue

            data.append(
                {
                    "timestamp": timestamp.to_pydatetime(),
                    "correlation": float(value),
                }
            )

        return {
            "asset_a": asset_a,
            "asset_b": asset_b,
            "window": window,
            "observations": len(data),
            "data": data,
        }
