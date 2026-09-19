from datetime import datetime

import pandas as pd

from app.engines.backtesting.execution import ExecutionEngine
from app.engines.backtesting.models import BacktestResult, Trade
from app.engines.backtesting.portfolio import Portfolio
from app.engines.strategies.base import BaseStrategy


class BacktestEngine:
    """
    Main quantitative backtesting engine.

    Pipeline:

        Market Data
            ↓
        Strategy Signals
            ↓
        Execution
            ↓
        Portfolio
            ↓
        Trades + Equity Curve
            ↓
        Backtest Result + Research Metadata
    """

    def __init__(
        self,
        initial_capital: float = 100000.0,
        transaction_cost: float = 0.0,
        slippage: float = 0.0,
    ):
        """
        Initialize the backtesting engine.

        Parameters
        ----------
        initial_capital:
            Starting portfolio capital.

        transaction_cost:
            Transaction cost as a decimal.

            Example:
                0.001 = 0.1%

        slippage:
            Slippage as a decimal.

            Example:
                0.001 = 0.1%
        """

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

        self.initial_capital = float(
            initial_capital
        )

        self.execution_engine = ExecutionEngine(
            transaction_cost=transaction_cost,
            slippage=slippage,
        )

    # =============================================================
    # MAIN BACKTEST METHOD
    # =============================================================

    def run(
        self,
        data: pd.DataFrame,
        strategy: BaseStrategy,
    ) -> BacktestResult:
        """
        Run a complete quantitative backtest.

        Expected input:

            DataFrame containing:
                - close
                - datetime-like index

        Signal convention:

            1 -> Long / Buy
            0 -> No Position

        Returns
        -------
        BacktestResult
            Complete backtest result including:

                - initial capital
                - final capital
                - total return
                - trades
                - equity curve
                - strategy name
                - strategy parameters
                - transaction cost
                - slippage
                - start date
                - end date
        """

        # =========================================================
        # 1. VALIDATE INPUT
        # =========================================================

        if data.empty:
            raise ValueError(
                "Cannot run backtest on empty data"
            )

        if "close" not in data.columns:
            raise ValueError(
                "Input data must contain a 'close' column"
            )

        data = data.copy()

        # =========================================================
        # 2. ENSURE CHRONOLOGICAL ORDER
        # =========================================================

        if not data.index.is_monotonic_increasing:
            data = data.sort_index()

        # =========================================================
        # 3. VALIDATE CLOSE PRICES
        # =========================================================

        if data["close"].isna().any():
            raise ValueError(
                "Market data contains missing close prices"
            )

        if (data["close"] <= 0).any():
            raise ValueError(
                "Market data contains invalid close prices"
            )

        # =========================================================
        # 4. GENERATE STRATEGY SIGNALS
        # =========================================================

        signals = strategy.generate_signals(
            data
        )

        if not signals.index.equals(
            data.index
        ):
            raise ValueError(
                "Strategy signals must have the same "
                "index as market data"
            )

        # =========================================================
        # 5. INITIALIZE PORTFOLIO
        # =========================================================

        portfolio = Portfolio(
            initial_capital=self.initial_capital
        )

        trades: list[Trade] = []

        equity_curve: list[float] = []

        # =========================================================
        # 6. MAIN BACKTESTING LOOP
        # =========================================================

        for timestamp, row in data.iterrows():

            price = float(
                row["close"]
            )

            signal = int(
                signals.loc[timestamp]
            )

            current_time = self._to_datetime(
                timestamp
            )

            # -----------------------------------------------------
            # Validate current price
            # -----------------------------------------------------

            if price <= 0:
                raise ValueError(
                    f"Invalid price at "
                    f"{timestamp}: {price}"
                )

            # =====================================================
            # ENTER LONG POSITION
            # =====================================================

            if (
                signal == 1
                and portfolio.position.quantity == 0
            ):

                # -------------------------------------------------
                # Apply slippage
                # -------------------------------------------------

                execution_price = price * (
                    1
                    + self.execution_engine.slippage
                )

                # -------------------------------------------------
                # Include transaction cost
                # -------------------------------------------------

                total_cost_per_unit = (
                    execution_price
                    * (
                        1
                        + self.execution_engine.transaction_cost
                    )
                )

                if total_cost_per_unit <= 0:
                    raise ValueError(
                        "Invalid total cost per unit"
                    )

                # -------------------------------------------------
                # Calculate affordable quantity
                # -------------------------------------------------

                max_affordable_quantity = (
                    portfolio.cash
                    / total_cost_per_unit
                )

                # -------------------------------------------------
                # Floating-point safety margin
                # -------------------------------------------------

                quantity = (
                    max_affordable_quantity
                    * (1 - 1e-12)
                )

                if quantity > 0:

                    # ---------------------------------------------
                    # Execute entry
                    # ---------------------------------------------

                    trade = (
                        self.execution_engine.execute_entry(
                            position=portfolio.position,
                            price=price,
                            quantity=quantity,
                            timestamp=current_time,
                        )
                    )

                    # ---------------------------------------------
                    # Update portfolio
                    # ---------------------------------------------

                    portfolio.buy(
                        execution_price=trade.entry_price,
                        quantity=trade.quantity,
                        fees=trade.fees,
                    )

                    trades.append(
                        trade
                    )

            # =====================================================
            # EXIT LONG POSITION
            # =====================================================

            elif (
                signal == 0
                and portfolio.position.quantity > 0
            ):

                # -------------------------------------------------
                # Execute exit
                # -------------------------------------------------

                trade = (
                    self.execution_engine.execute_exit(
                        position=portfolio.position,
                        price=price,
                        timestamp=current_time,
                    )
                )

                # -------------------------------------------------
                # Update portfolio
                # -------------------------------------------------

                portfolio.sell(
                    execution_price=trade.exit_price,
                    quantity=trade.quantity,
                    fees=trade.fees,
                )

                trades.append(
                    trade
                )

            # =====================================================
            # RECORD PORTFOLIO VALUE
            # =====================================================

            portfolio_value = (
                portfolio.portfolio_value(
                    current_price=price
                )
            )

            equity_curve.append(
                portfolio_value
            )

        # =========================================================
        # 7. FORCE-CLOSE REMAINING POSITION
        # =========================================================

        if portfolio.position.quantity > 0:

            final_timestamp = data.index[-1]

            final_price = float(
                data["close"].iloc[-1]
            )

            final_time = self._to_datetime(
                final_timestamp
            )

            trade = (
                self.execution_engine.execute_exit(
                    position=portfolio.position,
                    price=final_price,
                    timestamp=final_time,
                )
            )

            portfolio.sell(
                execution_price=trade.exit_price,
                quantity=trade.quantity,
                fees=trade.fees,
            )

            trades.append(
                trade
            )

            # The final equity value should represent
            # the fully closed portfolio.

            equity_curve[-1] = (
                portfolio.cash
            )

        # =========================================================
        # 8. CALCULATE FINAL CAPITAL
        # =========================================================

        final_capital = (
            portfolio.cash
        )

        # =========================================================
        # 9. CALCULATE TOTAL RETURN
        # =========================================================

        total_return = (
            final_capital
            / self.initial_capital
        ) - 1

        # =========================================================
        # 10. EXTRACT STRATEGY PARAMETERS
        # =========================================================

        strategy_parameters = (
            self._extract_strategy_parameters(
                strategy
            )
        )

        # =========================================================
        # 11. CREATE BACKTEST RESULT
        # =========================================================

        return BacktestResult(
            initial_capital=self.initial_capital,

            final_capital=final_capital,

            total_return=total_return,

            trades=trades,

            equity_curve=equity_curve,

            # -----------------------------------------------------
            # Research metadata
            # -----------------------------------------------------

            strategy_name=getattr(
                strategy,
                "name",
                strategy.__class__.__name__,
            ),

            strategy_parameters=(
                strategy_parameters
            ),

            transaction_cost=(
                self.execution_engine.transaction_cost
            ),

            slippage=(
                self.execution_engine.slippage
            ),

            start_date=self._to_datetime(
                data.index[0]
            ),

            end_date=self._to_datetime(
                data.index[-1]
            ),
        )

    # =============================================================
    # STRATEGY PARAMETER EXTRACTION
    # =============================================================

    @staticmethod
    def _extract_strategy_parameters(
        strategy: BaseStrategy,
    ) -> dict:
        """
        Extract public configuration parameters
        from a strategy instance.

        Private attributes beginning with "_"
        are ignored.

        Only simple serializable values are stored.
        """

        parameters = {}

        for key, value in vars(
            strategy
        ).items():

            # Ignore private/internal attributes
            if key.startswith("_"):
                continue

            # Keep simple serializable values
            if isinstance(
                value,
                (
                    str,
                    int,
                    float,
                    bool,
                ),
            ):
                parameters[key] = value

        return parameters

    # =============================================================
    # DATETIME CONVERSION
    # =============================================================

    @staticmethod
    def _to_datetime(
        timestamp,
    ) -> datetime:
        """
        Convert pandas timestamps or datetime-like
        values into Python datetime objects.

        Also supports integer-like indexes for
        basic testing.
        """

        if isinstance(
            timestamp,
            pd.Timestamp,
        ):
            return timestamp.to_pydatetime()

        if isinstance(
            timestamp,
            datetime,
        ):
            return timestamp

        return (
            pd.Timestamp(
                timestamp
            ).to_pydatetime()
        )