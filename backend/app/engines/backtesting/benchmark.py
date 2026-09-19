from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


@dataclass
class BenchmarkResult:
    """
    Result of a Buy-and-Hold benchmark.
    """

    initial_capital: float
    final_capital: float
    total_return: float
    equity_curve: list[float]


class BuyAndHoldBenchmark:
    """
    Buy-and-Hold benchmark.

    The benchmark buys the asset at the beginning of the
    backtest and holds it until the end.

    Transaction costs and slippage are included so that
    the benchmark can be compared fairly against a strategy.
    """

    name = "buy_and_hold"

    def __init__(
        self,
        initial_capital: float = 100000.0,
        transaction_cost: float = 0.0,
        slippage: float = 0.0,
    ):
        if initial_capital <= 0:
            raise ValueError(
                "initial_capital must be greater than 0"
            )

        if transaction_cost < 0:
            raise ValueError(
                "transaction_cost cannot be negative"
            )

        if slippage < 0:
            raise ValueError(
                "slippage cannot be negative"
            )

        self.initial_capital = float(initial_capital)
        self.transaction_cost = float(transaction_cost)
        self.slippage = float(slippage)

    def run(
        self,
        data: pd.DataFrame,
    ) -> BenchmarkResult:
        """
        Run Buy-and-Hold benchmark.

        Expected input:
            DataFrame containing:
                - close
                - chronological index
        """

        # =========================================================
        # 1. VALIDATE INPUT
        # =========================================================

        if data.empty:
            raise ValueError(
                "Cannot run benchmark on empty data"
            )

        if "close" not in data.columns:
            raise ValueError(
                "Input data must contain a 'close' column"
            )

        data = data.copy()

        if not data.index.is_monotonic_increasing:
            data = data.sort_index()

        if data["close"].isna().any():
            raise ValueError(
                "Market data contains missing close prices"
            )

        prices = data["close"].astype(float)

        if (prices <= 0).any():
            raise ValueError(
                "Close prices must be greater than 0"
            )

        # =========================================================
        # 2. BUY AT BEGINNING
        # =========================================================

        first_price = float(prices.iloc[0])

        # Slippage makes the benchmark entry more expensive.
        entry_price = first_price * (
            1 + self.slippage
        )

        # Include transaction cost.
        total_entry_cost_per_unit = (
            entry_price
            * (1 + self.transaction_cost)
        )

        quantity = (
            self.initial_capital
            / total_entry_cost_per_unit
        )

        # Small safety margin against floating-point errors.
        quantity *= (1 - 1e-12)

        entry_value = entry_price * quantity

        entry_fee = (
            entry_value
            * self.transaction_cost
        )

        cash_remaining = (
            self.initial_capital
            - entry_value
            - entry_fee
        )

        # =========================================================
        # 3. CREATE EQUITY CURVE
        # =========================================================

        equity_curve: list[float] = []

        for price in prices:

            current_price = float(price)

            position_value = (
                quantity * current_price
            )

            portfolio_value = (
                cash_remaining
                + position_value
            )

            equity_curve.append(
                portfolio_value
            )

        # =========================================================
        # 4. SELL AT END
        # =========================================================

        final_price = float(prices.iloc[-1])

        exit_price = final_price * (
            1 - self.slippage
        )

        exit_value = (
            quantity * exit_price
        )

        exit_fee = (
            exit_value
            * self.transaction_cost
        )

        final_capital = (
            cash_remaining
            + exit_value
            - exit_fee
        )

        # =========================================================
        # 5. TOTAL RETURN
        # =========================================================

        total_return = (
            final_capital
            / self.initial_capital
        ) - 1

        return BenchmarkResult(
            initial_capital=self.initial_capital,
            final_capital=final_capital,
            total_return=total_return,
            equity_curve=equity_curve,
        )