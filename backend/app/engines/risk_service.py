from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.indicators.returns import calculate_daily_returns
from app.engines.indicators.volatility import calculate_annualized_volatility
from app.engines.risk.metrics import calculate_sharpe_ratio
from app.engines.risk.drawdown import calculate_drawdown


class RiskAnalysisService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def analyze(
        self,
        db: Session,
        symbol: str,
        risk_free_rate: float = 0.0,
    ) -> dict:

        prices = self.data_service.get_close_prices(
            db=db,
            symbol=symbol,
        )

        daily_returns = calculate_daily_returns(prices)

        annualized_volatility = calculate_annualized_volatility(
            prices
        )

        sharpe_ratio = calculate_sharpe_ratio(
            returns=daily_returns,
            risk_free_rate=risk_free_rate,
        )

        drawdown_series = calculate_drawdown(prices)
        maximum_drawdown = float(drawdown_series.min())

        return {
            "symbol": symbol.upper(),
            "observations": len(prices),
            "latest_price": float(prices.iloc[-1]),
            "annualized_volatility": float(
                annualized_volatility
            ),
            "sharpe_ratio": float(sharpe_ratio),
            "maximum_drawdown": float(
                maximum_drawdown
            ),
        }
