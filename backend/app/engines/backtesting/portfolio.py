from app.engines.backtesting.models import Position


class Portfolio:
    """
    Manages cash, positions, and portfolio value during a backtest.
    """

    def __init__(self, initial_capital: float):
        if initial_capital <= 0:
            raise ValueError(
                "initial_capital must be greater than 0"
            )

        self.initial_capital = float(initial_capital)
        self.cash = float(initial_capital)
        self.position = Position()

    @property
    def invested_value(self) -> float:
        """
        Current value of the open position using entry price.
        """

        if self.position.quantity <= 0:
            return 0.0

        return (
            self.position.quantity
            * self.position.entry_price
        )

    def portfolio_value(
        self,
        current_price: float,
    ) -> float:
        """
        Calculate total portfolio value.

        Portfolio Value =
            Cash + Current Market Value of Position
        """

        if current_price <= 0:
            raise ValueError(
                "current_price must be greater than 0"
            )

        position_value = (
            self.position.quantity * current_price
        )

        return self.cash + position_value

    def buy(
        self,
        execution_price: float,
        quantity: float,
        fees: float = 0.0,
    ) -> None:
        """
        Deduct the cost of a purchase from cash.
        """

        if execution_price <= 0:
            raise ValueError(
                "execution_price must be greater than 0"
            )

        if quantity <= 0:
            raise ValueError(
                "quantity must be greater than 0"
            )

        if fees < 0:
            raise ValueError(
                "fees cannot be negative"
            )

        total_cost = (
            execution_price * quantity
        ) + fees

        # Small tolerance prevents floating-point
        # precision errors at the exact cash boundary.
        tolerance = 1e-8

        if total_cost > self.cash + tolerance:
            raise ValueError(
                "Insufficient cash for purchase"
            )

        self.cash -= total_cost

        # Prevent tiny negative floating-point balances.
        if abs(self.cash) < tolerance:
            self.cash = 0.0

    def sell(
        self,
        execution_price: float,
        quantity: float,
        fees: float = 0.0,
    ) -> None:
        """
        Add sale proceeds to cash.
        """

        if execution_price <= 0:
            raise ValueError(
                "execution_price must be greater than 0"
            )

        if quantity <= 0:
            raise ValueError(
                "quantity must be greater than 0"
            )

        if fees < 0:
            raise ValueError(
                "fees cannot be negative"
            )

        proceeds = (
            execution_price * quantity
        ) - fees

        self.cash += proceeds