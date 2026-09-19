import pandas as pd


def calculate_sma(
    prices: pd.Series,
    period: int,
) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA).

    Parameters
    ----------
    prices : pd.Series
        Historical price series.
    period : int
        Number of periods used for the moving average.

    Returns
    -------
    pd.Series
        SMA values.
    """

    if period <= 0:
        raise ValueError("period must be greater than 0")

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    return prices.rolling(
        window=period,
        min_periods=period,
    ).mean()


def calculate_ema(
    prices: pd.Series,
    period: int,
) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA).

    Parameters
    ----------
    prices : pd.Series
        Historical price series.
    period : int
        Number of periods used for the moving average.

    Returns
    -------
    pd.Series
        EMA values.
    """

    if period <= 0:
        raise ValueError("period must be greater than 0")

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    return prices.ewm(
        span=period,
        adjust=False,
        min_periods=period,
    ).mean()