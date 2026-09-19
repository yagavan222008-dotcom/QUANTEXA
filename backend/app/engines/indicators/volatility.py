import pandas as pd
import numpy as np


TRADING_DAYS_PER_YEAR = 252


def calculate_historical_volatility(
    prices: pd.Series,
    window: int | None = None,
) -> pd.Series | float:
    """
    Calculate historical volatility from logarithmic returns.

    Parameters
    ----------
    prices : pd.Series
        Historical price series.
    window : int | None
        Rolling window size. If None, calculate volatility
        over the entire available return series.

    Returns
    -------
    pd.Series | float
        Historical volatility.
    """

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    if window is not None and window <= 0:
        raise ValueError("window must be greater than 0")

    log_returns = np.log(prices / prices.shift(1))

    if window is None:
        return float(log_returns.std())

    return log_returns.rolling(
        window=window,
        min_periods=window,
    ).std()


def calculate_annualized_volatility(
    prices: pd.Series,
    window: int | None = None,
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
) -> pd.Series | float:
    """
    Calculate annualized historical volatility.

    Annualized volatility:
        Daily volatility × sqrt(252)

    Parameters
    ----------
    prices : pd.Series
        Historical price series.
    window : int | None
        Rolling volatility window.
    periods_per_year : int
        Number of trading periods per year.

    Returns
    -------
    pd.Series | float
        Annualized volatility.
    """

    if periods_per_year <= 0:
        raise ValueError("periods_per_year must be greater than 0")

    volatility = calculate_historical_volatility(
        prices,
        window=window,
    )

    return volatility * np.sqrt(periods_per_year)