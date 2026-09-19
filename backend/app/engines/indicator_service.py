from __future__ import annotations

import pandas as pd
from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.indicators.moving_averages import (
    calculate_sma,
    calculate_ema,
)
from app.engines.indicators.returns import (
    calculate_daily_returns,
    calculate_cumulative_returns,
    calculate_rolling_returns,
)
from app.engines.indicators.volatility import (
    calculate_historical_volatility,
    calculate_annualized_volatility,
)


class IndicatorService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def analyze(
        self,
        db: Session,
        symbol: str,
        sma_fast: int = 20,
        sma_slow: int = 50,
        ema_fast: int = 20,
        ema_slow: int = 50,
        rolling_window: int = 20,
        volatility_window: int = 20,
    ) -> dict:

        symbol = symbol.upper()

        if sma_fast <= 0:
            raise ValueError("sma_fast must be greater than 0")

        if sma_slow <= 0:
            raise ValueError("sma_slow must be greater than 0")

        if ema_fast <= 0:
            raise ValueError("ema_fast must be greater than 0")

        if ema_slow <= 0:
            raise ValueError("ema_slow must be greater than 0")

        if rolling_window <= 0:
            raise ValueError(
                "rolling_window must be greater than 0"
            )

        if volatility_window <= 0:
            raise ValueError(
                "volatility_window must be greater than 0"
            )

        prices = self.data_service.get_close_prices(
            db=db,
            symbol=symbol,
        )

        if prices.empty:
            raise ValueError(
                f"No price data found for '{symbol}'"
            )

        sma_fast_series = calculate_sma(
            prices,
            sma_fast,
        )

        sma_slow_series = calculate_sma(
            prices,
            sma_slow,
        )

        ema_fast_series = calculate_ema(
            prices,
            ema_fast,
        )

        ema_slow_series = calculate_ema(
            prices,
            ema_slow,
        )

        daily_returns = calculate_daily_returns(
            prices
        )

        cumulative_returns = calculate_cumulative_returns(
            prices
        )

        rolling_returns = calculate_rolling_returns(
            prices,
            rolling_window,
        )

        historical_volatility = calculate_historical_volatility(
            prices
        )

        annualized_volatility = calculate_annualized_volatility(
            prices
        )

        rolling_annualized_volatility = (
            calculate_annualized_volatility(
                prices,
                window=volatility_window,
            )
        )

        latest_timestamp = prices.index[-1]

        def clean_float(value):
            if pd.isna(value):
                return None
            return float(value)

        series = []

        for timestamp in prices.index:

            series.append(
                {
                    "timestamp": timestamp.to_pydatetime(),
                    "price": clean_float(
                        prices.loc[timestamp]
                    ),
                    "sma_fast": clean_float(
                        sma_fast_series.loc[timestamp]
                    ),
                    "sma_slow": clean_float(
                        sma_slow_series.loc[timestamp]
                    ),
                    "ema_fast": clean_float(
                        ema_fast_series.loc[timestamp]
                    ),
                    "ema_slow": clean_float(
                        ema_slow_series.loc[timestamp]
                    ),
                    "daily_return": clean_float(
                        daily_returns.loc[timestamp]
                    ),
                    "cumulative_return": clean_float(
                        cumulative_returns.loc[timestamp]
                    ),
                    "rolling_return": clean_float(
                        rolling_returns.loc[timestamp]
                    ),
                    "historical_volatility": clean_float(
                        (
                            calculate_historical_volatility(
                                prices,
                                window=volatility_window,
                            ).loc[timestamp]
                        )
                    ),
                    "annualized_volatility": clean_float(
                        rolling_annualized_volatility.loc[
                            timestamp
                        ]
                    ),
                }
            )

        return {
            "symbol": symbol,
            "observations": len(prices),
            "parameters": {
                "sma_fast": sma_fast,
                "sma_slow": sma_slow,
                "ema_fast": ema_fast,
                "ema_slow": ema_slow,
                "rolling_window": rolling_window,
                "volatility_window": volatility_window,
            },
            "latest": {
                "timestamp": latest_timestamp.to_pydatetime(),
                "price": clean_float(
                    prices.iloc[-1]
                ),
                "sma_fast": clean_float(
                    sma_fast_series.iloc[-1]
                ),
                "sma_slow": clean_float(
                    sma_slow_series.iloc[-1]
                ),
                "ema_fast": clean_float(
                    ema_fast_series.iloc[-1]
                ),
                "ema_slow": clean_float(
                    ema_slow_series.iloc[-1]
                ),
                "daily_return": clean_float(
                    daily_returns.iloc[-1]
                ),
                "cumulative_return": clean_float(
                    cumulative_returns.iloc[-1]
                ),
                "rolling_return": clean_float(
                    rolling_returns.iloc[-1]
                ),
                "historical_volatility": clean_float(
                    historical_volatility
                ),
                "annualized_volatility": clean_float(
                    annualized_volatility
                ),
                "rolling_annualized_volatility": clean_float(
                    rolling_annualized_volatility.iloc[-1]
                ),
            },
            "series": series,
        }
