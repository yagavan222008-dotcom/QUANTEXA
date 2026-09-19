from abc import ABC, abstractmethod

import pandas as pd


class BaseStrategy(ABC):
    """
    Base interface for all Quantext trading strategies.

    Every strategy receives market data and returns
    standardized trading signals.
    """

    name: str = "base_strategy"

    @abstractmethod
    def generate_signals(
        self,
        data: pd.DataFrame,
    ) -> pd.Series:
        """
        Generate trading signals.

        Signal convention:
            1  -> Long / Buy
            0  -> Hold / No Position
           -1  -> Short / Sell
        """

        raise NotImplementedError