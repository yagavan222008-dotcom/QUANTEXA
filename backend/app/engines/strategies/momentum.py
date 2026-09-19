import pandas as pd

from app.engines.strategies.base import BaseStrategy


class MomentumStrategy(BaseStrategy):
    """
    Price Momentum Strategy.

    Long signal:
        Current close is greater than the close
        N periods ago.

    Exit signal:
        Current close is less than or equal to
        the close N periods ago.

    Signal convention:
        1  -> Long
        0  -> No position
    """

    name = "momentum"

    def __init__(
        self,
        lookback_period: int = 20,
    ):
        if lookback_period <= 0:
            raise ValueError(
                "lookback_period must be greater than 0"
            )

        self.lookback_period = lookback_period

    def generate_signals(
        self,
        data: pd.DataFrame,
    ) -> pd.Series:
        """
        Generate momentum signals.

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

        previous_close = close.shift(
            self.lookback_period
        )

        signals = pd.Series(
            0,
            index=data.index,
            dtype="int64",
            name="signal",
        )

        signals[close > previous_close] = 1

        return signals