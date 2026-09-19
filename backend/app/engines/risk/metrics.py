import pandas as pd
import numpy as np


TRADING_DAYS_PER_YEAR = 252


def calculate_sharpe_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.0,
    periods_per_year: int = TRADING_DAYS_PER_YEAR,
) -> float:
    """
    Calculate the annualized Sharpe ratio.

    Sharpe Ratio =
        Annualized Excess Return / Annualized Volatility

    Parameters
    ----------
    returns : pd.Series
        Periodic returns.
    risk_free_rate : float
        Annual risk-free rate expressed as a decimal.
        Example: 0.05 = 5%.
    periods_per_year : int
        Number of return periods in one year.

    Returns
    -------
    float
        Annualized Sharpe ratio.
    """

    if periods_per_year <= 0:
        raise ValueError("periods_per_year must be greater than 0")

    clean_returns = returns.dropna()

    if clean_returns.empty:
        return float("nan")

    periodic_risk_free_rate = (
        (1 + risk_free_rate) ** (1 / periods_per_year)
    ) - 1

    excess_returns = clean_returns - periodic_risk_free_rate

    volatility = excess_returns.std()

    if volatility == 0 or np.isnan(volatility):
        return float("nan")

    return float(
        (excess_returns.mean() / volatility)
        * np.sqrt(periods_per_year)
    )