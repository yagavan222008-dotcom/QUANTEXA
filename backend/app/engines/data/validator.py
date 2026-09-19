from __future__ import annotations

import pandas as pd


REQUIRED_COLUMNS = [
    "open",
    "high",
    "low",
    "close",
]


def validate_market_data(
    data: pd.DataFrame,
) -> None:
    """
    Validate normalized OHLCV market data.
    """

    if data.empty:
        raise ValueError(
            "Market data cannot be empty"
        )

    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: "
            f"{missing_columns}"
        )

    if not data.index.is_monotonic_increasing:
        raise ValueError(
            "Market data index must be sorted "
            "in ascending order"
        )

    if data.index.has_duplicates:
        raise ValueError(
            "Market data contains duplicate timestamps"
        )

    for column in REQUIRED_COLUMNS:

        if data[column].isna().any():
            raise ValueError(
                f"Column '{column}' contains "
                f"missing values"
            )

        if not pd.api.types.is_numeric_dtype(
            data[column]
        ):
            raise ValueError(
                f"Column '{column}' must be numeric"
            )

    if (data["open"] <= 0).any():
        raise ValueError(
            "Open prices must be greater than zero"
        )

    if (data["high"] <= 0).any():
        raise ValueError(
            "High prices must be greater than zero"
        )

    if (data["low"] <= 0).any():
        raise ValueError(
            "Low prices must be greater than zero"
        )

    if (data["close"] <= 0).any():
        raise ValueError(
            "Close prices must be greater than zero"
        )

    if (
        data["high"] < data["low"]
    ).any():
        raise ValueError(
            "High price cannot be lower than "
            "low price"
        )

    if (
        data["high"] < data["open"]
    ).any():
        raise ValueError(
            "High price cannot be lower than "
            "open price"
        )

    if (
        data["high"] < data["close"]
    ).any():
        raise ValueError(
            "High price cannot be lower than "
            "close price"
        )

    if (
        data["low"] > data["open"]
    ).any():
        raise ValueError(
            "Low price cannot be higher than "
            "open price"
        )

    if (
        data["low"] > data["close"]
    ).any():
        raise ValueError(
            "Low price cannot be higher than "
            "close price"
        )