from __future__ import annotations

import pandas as pd

from app.engines.data.validator import (
    validate_market_data,
)


def normalize_market_data(
    data: pd.DataFrame,
) -> pd.DataFrame:
    """
    Normalize raw market data into QuantExa's
    standard OHLCV format.
    """

    if data.empty:
        raise ValueError(
            "Cannot normalize empty market data"
        )

    normalized = data.copy()

    # ---------------------------------------------------------
    # Normalize column names
    # ---------------------------------------------------------

    normalized.columns = [
        str(column).strip().lower()
        for column in normalized.columns
    ]

    # ---------------------------------------------------------
    # Handle common adjusted/close naming
    # ---------------------------------------------------------

    if (
        "adj close" in normalized.columns
        and "close" not in normalized.columns
    ):
        normalized = normalized.rename(
            columns={
                "adj close": "close"
            }
        )

    # ---------------------------------------------------------
    # Required columns
    # ---------------------------------------------------------

    required_columns = [
        "open",
        "high",
        "low",
        "close",
    ]

    missing = [
        column
        for column in required_columns
        if column not in normalized.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    # ---------------------------------------------------------
    # Optional volume
    # ---------------------------------------------------------

    if "volume" not in normalized.columns:
        normalized["volume"] = 0.0

    # ---------------------------------------------------------
    # Keep only standard columns
    # ---------------------------------------------------------

    normalized = normalized[
        [
            "open",
            "high",
            "low",
            "close",
            "volume",
        ]
    ]

    # ---------------------------------------------------------
    # Convert values to numeric
    # ---------------------------------------------------------

    for column in normalized.columns:

        normalized[column] = pd.to_numeric(
            normalized[column],
            errors="coerce",
        )

    # ---------------------------------------------------------
    # Remove rows with invalid numerical values
    # ---------------------------------------------------------

    normalized = normalized.dropna(
        subset=[
            "open",
            "high",
            "low",
            "close",
        ]
    )

    # ---------------------------------------------------------
    # Sort chronologically
    # ---------------------------------------------------------

    normalized = normalized.sort_index()

    # ---------------------------------------------------------
    # Remove duplicate timestamps
    # ---------------------------------------------------------

    normalized = normalized[
        ~normalized.index.duplicated(
            keep="last"
        )
    ]

    # ---------------------------------------------------------
    # Validate final dataset
    # ---------------------------------------------------------

    validate_market_data(
        normalized
    )

    return normalized