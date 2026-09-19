from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.regimes.analysis import (
    analyze_regime_distribution,
    analyze_regime_performance,
)
from app.engines.regimes.detector import (
    detect_market_regimes,
)


class RegimeService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def analyze(
        self,
        db: Session,
        symbol: str,
        return_window: int = 20,
        volatility_window: int = 20,
    ) -> dict:

        symbol = symbol.upper()

        # =========================================================
        # 1. LOAD MARKET DATA
        # =========================================================

        data = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if data.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        prices = data["close"]

        # =========================================================
        # 2. DETECT REGIMES
        # =========================================================

        regimes = detect_market_regimes(
            prices=prices,
            return_window=return_window,
            volatility_window=volatility_window,
        )

        # =========================================================
        # 3. DISTRIBUTION
        # =========================================================

        distribution = analyze_regime_distribution(
            regimes
        )

        # =========================================================
        # 4. PERFORMANCE
        # =========================================================

        performance = analyze_regime_performance(
            prices=prices,
            regimes=regimes,
        )

        # =========================================================
        # 5. BUILD TIME SERIES
        # =========================================================

        regime_series = []

        for timestamp, regime in regimes.items():

            if regime is None:
                continue

            if not isinstance(regime, str):
                continue

            regime_series.append(
                {
                    "timestamp": timestamp.to_pydatetime(),
                    "regime": regime,
                    "price": float(
                        prices.loc[timestamp]
                    ),
                }
            )

        # =========================================================
        # 6. LATEST REGIME
        # =========================================================

        valid_regimes = regimes.dropna()

        latest_regime = None

        if not valid_regimes.empty:
            latest_regime = str(
                valid_regimes.iloc[-1]
            )

        # =========================================================
        # 7. RETURN RESULT
        # =========================================================

        return {
            "symbol": symbol,

            "observations": len(data),

            "parameters": {
                "return_window": return_window,
                "volatility_window": volatility_window,
            },

            "latest_regime": latest_regime,

            "distribution": distribution,

            "performance": performance,

            "series": regime_series,
        }