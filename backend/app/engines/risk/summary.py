import pandas as pd

from app.engines.indicators.volatility import (
    calculate_annualized_volatility,
)
from app.engines.indicators.returns import (
    calculate_daily_returns,
)
from app.engines.risk.metrics import (
    calculate_sharpe_ratio,
)
from app.engines.risk.drawdown import (
    calculate_maximum_drawdown,
)


def calculate_risk_summary(
    prices: pd.Series,
    risk_free_rate: float = 0.0,
) -> dict:
    """
    Calculate the core risk metrics for a price series.

    Returns
    -------
    dict
        A standardized risk summary.
    """

    if prices.empty:
        return {
            "sharpe_ratio": None,
            "annualized_volatility": None,
            "maximum_drawdown": None,
        }

    daily_returns = calculate_daily_returns(prices)

    sharpe_ratio = calculate_sharpe_ratio(
        daily_returns,
        risk_free_rate=risk_free_rate,
    )

    annualized_volatility = calculate_annualized_volatility(
        prices,
    )

    maximum_drawdown = calculate_maximum_drawdown(
        prices,
    )

    return {
        "sharpe_ratio": sharpe_ratio,
        "annualized_volatility": annualized_volatility,
        "maximum_drawdown": maximum_drawdown,
    }