import pandas as pd


def calculate_daily_returns(prices: pd.Series) -> pd.Series:
    """
    Calculate daily percentage returns.

    Formula:
        Return_t = (Price_t / Price_{t-1}) - 1
    """

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    return prices.pct_change()


def calculate_cumulative_returns(prices: pd.Series) -> pd.Series:
    """
    Calculate cumulative returns from a price series.

    Formula:
        Cumulative Return = (1 + r1)(1 + r2)...(1 + rn) - 1
    """

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    daily_returns = calculate_daily_returns(prices)

    return (1 + daily_returns).cumprod() - 1


def calculate_rolling_returns(
    prices: pd.Series,
    window: int,
) -> pd.Series:
    """
    Calculate rolling percentage returns over a specified window.
    """

    if window <= 0:
        raise ValueError("window must be greater than 0")

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    return prices.pct_change(periods=window)