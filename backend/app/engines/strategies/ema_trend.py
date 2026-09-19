import pandas as pd

from app.engines.indicators.moving_averages import (
    calculate_ema,
)
from app.engines.strategies.base import BaseStrategy


class EMATrendStrategy(BaseStrategy):
    """
    EMA Trend Strategy.

    Long signal:
        Fast EMA is above Slow EMA.

    Exit signal:
        Fast EMA is below Slow EMA.

    Signal convention:
        1  -> Long
        0  -> No position
    """

    name = "ema_trend"

    def __init__(
        self,
        fast_period: int = 20,
        slow_period: int = 50,
    ):
        if fast_period <= 0:
            raise ValueError("fast_period must be greater than 0")

        if slow_period <= 0:
            raise ValueError("slow_period must be greater than 0")

        if fast_period >= slow_period:
            raise ValueError(
                "fast_period must be smaller than slow_period"
            )

        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signals(
        self,
        data: pd.DataFrame,
    ) -> pd.Series:
        """
        Generate EMA trend signals.

        Expected input:
            DataFrame containing a 'close' column.
        """

        if data.empty:
            return pd.Series(
                index=data.index,
                dtype="int64",
                name="signal",
            )

        if "close" not in data.columns:
            raise ValueError(
                "Input data must contain a 'close' column"
            )

        close = data["close"]

        fast_ema = calculate_ema(
            close,
            self.fast_period,
        )

        slow_ema = calculate_ema(
            close,
            self.slow_period,
        )

        signals = pd.Series(
            0,
            index=data.index,
            dtype="int64",
            name="signal",
        )

        signals[fast_ema > slow_ema] = 1

        return signals