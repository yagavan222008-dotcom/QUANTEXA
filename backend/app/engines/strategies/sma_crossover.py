import pandas as pd

from app.engines.indicators.moving_averages import (
    calculate_sma,
)
from app.engines.strategies.base import BaseStrategy


class SMACrossoverStrategy(BaseStrategy):
    """
    Simple Moving Average Crossover Strategy.

    Long signal:
        Fast SMA crosses above Slow SMA.

    Exit signal:
        Fast SMA crosses below Slow SMA.

    Signal convention:
        1  -> Long
        0  -> No position
    """

    name = "sma_crossover"

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
        Generate SMA crossover signals.

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

        fast_sma = calculate_sma(
            close,
            self.fast_period,
        )

        slow_sma = calculate_sma(
            close,
            self.slow_period,
        )

        signals = pd.Series(
            0,
            index=data.index,
            dtype="int64",
            name="signal",
        )

        signals[fast_sma > slow_sma] = 1

        return signals