from __future__ import annotations

import numpy as np
import pandas as pd

from app.engines.indicators.returns import calculate_daily_returns
from app.engines.indicators.volatility import (
    calculate_historical_volatility,
)


REGIME_BULL = "bull"
REGIME_BEAR = "bear"
REGIME_HIGH_VOLATILITY = "high_volatility"
REGIME_LOW_VOLATILITY = "low_volatility"


def detect_market_regimes(
    prices: pd.Series,
    return_window: int = 20,
    volatility_window: int = 20,
) -> pd.Series:
    """
    Detect market regimes using rolling returns
    and rolling historical volatility.

    Regime classification:

        Bull
            Positive rolling return and
            volatility not classified as high.

        Bear
            Negative rolling return and
            volatility not classified as high.

        High Volatility
            Volatility above its rolling median.

        Low Volatility
            Volatility at or below its rolling median.

    Parameters
    ----------
    prices:
        Price series indexed by timestamp.

    return_window:
        Number of periods used to calculate rolling return.

    volatility_window:
        Number of periods used to calculate rolling volatility.

    Returns
    -------
    pd.Series
        Regime label for each timestamp.
    """

    if return_window <= 0:
        raise ValueError(
            "return_window must be greater than 0"
        )

    if volatility_window <= 0:
        raise ValueError(
            "volatility_window must be greater than 0"
        )

    if prices.empty:
        return pd.Series(
            index=prices.index,
            dtype="object",
        )

    if (prices <= 0).any():
        raise ValueError(
            "prices must contain only positive values"
        )

    rolling_returns = (
        calculate_daily_returns(prices)
        .rolling(
            window=return_window,
            min_periods=return_window,
        )
        .sum()
    )

    rolling_volatility = (
        calculate_historical_volatility(
            prices,
            window=volatility_window,
        )
    )

    volatility_threshold = (
        rolling_volatility
        .rolling(
            window=volatility_window,
            min_periods=volatility_window,
        )
        .median()
    )

    regimes = pd.Series(
        index=prices.index,
        dtype="object",
    )

    valid_data = (
        rolling_returns.notna()
        & rolling_volatility.notna()
        & volatility_threshold.notna()
    )

    high_volatility = (
        rolling_volatility
        > volatility_threshold
    )

    regimes.loc[
        valid_data
        & high_volatility
    ] = REGIME_HIGH_VOLATILITY

    regimes.loc[
        valid_data
        & ~high_volatility
        & (rolling_returns >= 0)
    ] = REGIME_BULL

    regimes.loc[
        valid_data
        & ~high_volatility
        & (rolling_returns < 0)
    ] = REGIME_BEAR

    return regimes