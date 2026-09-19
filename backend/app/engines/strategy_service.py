from __future__ import annotations

import pandas as pd
from sqlalchemy.orm import Session

from app.engines.data.quant_data import QuantDataService
from app.engines.strategies.registry import (
    get_strategy,
    list_strategies,
)


class StrategyService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()

    def get_available_strategies(self) -> list[str]:
        return list_strategies()

    def generate_signals(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        parameters: dict | None = None,
    ) -> dict:

        symbol = symbol.upper()
        strategy_name = strategy_name.lower().strip()

        data = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if data.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        strategy = get_strategy(
            strategy_name=strategy_name,
            parameters=parameters,
        )

        signals = strategy.generate_signals(data)

        clean_signals = []

        for timestamp, signal in signals.items():
            clean_signals.append(
                {
                    "timestamp": timestamp.to_pydatetime(),
                    "signal": int(signal),
                    "close": float(
                        data.loc[timestamp, "close"]
                    ),
                }
            )

        signal_counts = {
            "buy_or_long": int(
                (signals == 1).sum()
            ),
            "hold_or_no_position": int(
                (signals == 0).sum()
            ),
            "sell_or_short": int(
                (signals == -1).sum()
            ),
        }

        return {
            "symbol": symbol,
            "strategy": strategy_name,
            "parameters": parameters or {},
            "observations": len(data),
            "latest_signal": int(
                signals.iloc[-1]
            ),
            "signal_counts": signal_counts,
            "signals": clean_signals,
        }
