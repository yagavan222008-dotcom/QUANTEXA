import pandas as pd

from app.engines.indicators.moving_averages import (
    calculate_sma,
)
from app.engines.strategies.base import BaseStrategy


class MeanReversionStrategy(BaseStrategy):
    """
    Mean Reversion Strategy.

    Long signal:
        Price is below its moving average.

    Exit signal:
        Price is at or above its moving average.

    Signal convention:
        1  -> Long
        0  -> No position
    """

    name = "mean_reversion"

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
        Generate mean-reversion signals.

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

        moving_average = calculate_sma(
            close,
            self.lookback_period,
        )

        signals = pd.Series(
            0,
            index=data.index,
            dtype="int64",
            name="signal",
        )

        signals[close < moving_average] = 1

        return signals