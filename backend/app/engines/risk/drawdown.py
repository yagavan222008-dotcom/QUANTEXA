import pandas as pd


def calculate_drawdown(prices: pd.Series) -> pd.Series:
    """
    Calculate drawdown from a price or portfolio-value series.

    Drawdown =
        Current Value / Previous Peak - 1
    """

    if prices.empty:
        return pd.Series(index=prices.index, dtype="float64")

    running_peak = prices.cummax()

    return (prices / running_peak) - 1


def calculate_maximum_drawdown(prices: pd.Series) -> float:
    """
    Calculate the maximum drawdown.

    Returns the most negative drawdown experienced
    during the period.
    """

    if prices.empty:
        return float("nan")

    drawdown = calculate_drawdown(prices)

    return float(drawdown.min())