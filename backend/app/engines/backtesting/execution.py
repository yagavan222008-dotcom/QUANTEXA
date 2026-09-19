from datetime import datetime

from app.engines.backtesting.models import Position, Trade


class ExecutionEngine:
    """
    Handles trade execution for the backtesting engine.

    Responsibilities:
    - Entry execution
    - Exit execution
    - Transaction costs
    - Slippage
    - Trade creation
    """

    def __init__(
        self,
        transaction_cost: float = 0.0,
        slippage: float = 0.0,
    ):
        if transaction_cost < 0:
            raise ValueError(
                "transaction_cost cannot be negative"
            )

        if slippage < 0:
            raise ValueError(
                "slippage cannot be negative"
            )

        self.transaction_cost = transaction_cost
        self.slippage = slippage

    def execute_entry(
        self,
        position: Position,
        price: float,
        quantity: float,
        timestamp: datetime,
    ) -> Trade:
        """
        Execute a long entry.

        Slippage increases the effective purchase price.
        """

        if price <= 0:
            raise ValueError("price must be greater than 0")

        if quantity <= 0:
            raise ValueError("quantity must be greater than 0")

        execution_price = price * (1 + self.slippage)

        trade_value = execution_price * quantity

        fees = trade_value * self.transaction_cost

        position.quantity = quantity
        position.entry_price = execution_price
        position.entry_time = timestamp

        return Trade(
            side="buy",
            quantity=quantity,
            entry_price=execution_price,
            entry_time=timestamp,
            fees=fees,
        )

    def execute_exit(
        self,
        position: Position,
        price: float,
        timestamp: datetime,
    ) -> Trade:
        """
        Execute a long exit.

        Slippage decreases the effective selling price.
        """

        if position.quantity <= 0:
            raise ValueError("No open position to exit")

        if price <= 0:
            raise ValueError("price must be greater than 0")

        execution_price = price * (1 - self.slippage)

        trade_value = execution_price * position.quantity

        fees = trade_value * self.transaction_cost

        pnl = (
            execution_price - position.entry_price
        ) * position.quantity

        pnl -= fees

        trade = Trade(
            side="sell",
            quantity=position.quantity,
            entry_price=position.entry_price,
            entry_time=position.entry_time,
            exit_price=execution_price,
            exit_time=timestamp,
            fees=fees,
            pnl=pnl,
        )

        position.quantity = 0.0
        position.entry_price = 0.0
        position.entry_time = None

        return trade