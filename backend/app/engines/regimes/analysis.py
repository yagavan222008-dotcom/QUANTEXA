from __future__ import annotations

import pandas as pd

from app.engines.indicators.returns import (
    calculate_daily_returns,
)


def analyze_regime_distribution(
    regimes: pd.Series,
) -> dict[str, dict]:
    """
    Analyze how frequently each market regime occurs.
    """

    valid_regimes = regimes.dropna()

    if valid_regimes.empty:
        return {}

    counts = valid_regimes.value_counts()

    total = len(valid_regimes)

    result = {}

    for regime, count in counts.items():
        result[regime] = {
            "periods": int(count),
            "percentage": float(
                count / total
            ),
        }

    return result


def analyze_regime_performance(
    prices: pd.Series,
    regimes: pd.Series,
) -> dict[str, dict]:
    """
    Calculate return statistics for each
    detected market regime.
    """

    returns = calculate_daily_returns(
        prices
    )

    aligned = pd.DataFrame(
        {
            "return": returns,
            "regime": regimes,
        }
    ).dropna()

    if aligned.empty:
        return {}

    results = {}

    for regime, group in aligned.groupby(
        "regime"
    ):

        regime_returns = group["return"]

        cumulative_return = (
            (1 + regime_returns).prod()
            - 1
        )

        results[regime] = {
            "periods": int(
                len(regime_returns)
            ),
            "total_return": float(
                cumulative_return
            ),
            "average_return": float(
                regime_returns.mean()
            ),
            "volatility": float(
                regime_returns.std()
            ),
            "positive_periods": int(
                (regime_returns > 0).sum()
            ),
            "negative_periods": int(
                (regime_returns < 0).sum()
            ),
        }

    return results