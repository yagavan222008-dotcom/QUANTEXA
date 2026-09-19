import pandas as pd


def calculate_rolling_correlation(
    returns: pd.DataFrame,
    asset_a: str,
    asset_b: str,
    window: int,
) -> pd.Series:
    """
    Calculate rolling Pearson correlation between two assets.

    Parameters
    ----------
    returns : pd.DataFrame
        DataFrame containing asset return series.
    asset_a : str
        First asset column.
    asset_b : str
        Second asset column.
    window : int
        Number of observations in the rolling window.

    Returns
    -------
    pd.Series
        Rolling correlation between the two assets.
    """

    if window <= 0:
        raise ValueError("window must be greater than 0")

    if asset_a not in returns.columns:
        raise ValueError(f"Asset '{asset_a}' not found in returns")

    if asset_b not in returns.columns:
        raise ValueError(f"Asset '{asset_b}' not found in returns")

    if returns.empty:
        return pd.Series(index=returns.index, dtype="float64")

    return (
        returns[asset_a]
        .rolling(window=window, min_periods=window)
        .corr(returns[asset_b])
    )