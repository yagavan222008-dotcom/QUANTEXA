from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.backtesting.engine import BacktestEngine
from app.engines.backtesting.benchmark import BuyAndHoldBenchmark
from app.engines.backtesting.comparison import (
    compare_strategy_with_benchmark,
)
from app.engines.backtesting.metrics import (
    calculate_backtest_metrics,
)
from app.engines.data.quant_data import QuantDataService
from app.engines.data.repositories.market_data_repository import (
    MarketDataRepository,
)
from app.engines.experiment_service import ExperimentService
from app.engines.strategies.registry import get_strategy


class BacktestService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()
        self.experiment_service = ExperimentService()
        self.market_data_repository = MarketDataRepository()

    def run_backtest(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        strategy_parameters: dict | None = None,
        initial_capital: float = 100000.0,
        transaction_cost: float = 0.001,
        slippage: float = 0.001,
        risk_free_rate: float = 0.0,
    ) -> dict:

        symbol = symbol.upper()
        strategy_name = strategy_name.lower().strip()

        # =========================================================
        # 1. LOAD MARKET DATA
        # =========================================================

        data = self.data_service.get_ohlcv(
            db=db,
            symbol=symbol,
        )

        if data.empty:
            raise ValueError(
                f"No market data found for '{symbol}'"
            )

        # =========================================================
        # 2. FIND ASSET AND DATASET
        # =========================================================

        asset = self.market_data_repository.get_asset(
            db=db,
            symbol=symbol,
        )

        if asset is None:
            raise ValueError(
                f"Asset not found for '{symbol}'"
            )

        dataset = self.market_data_repository.get_latest_dataset(
            db=db,
            asset_id=asset.id,
        )

        if dataset is None:
            raise ValueError(
                f"No dataset found for '{symbol}'"
            )

        # =========================================================
        # 3. CREATE STRATEGY
        # =========================================================

        strategy = get_strategy(
            strategy_name=strategy_name,
            parameters=strategy_parameters,
        )

        # =========================================================
        # 4. RUN STRATEGY BACKTEST
        # =========================================================

        backtest_engine = BacktestEngine(
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
        )

        result = backtest_engine.run(
            data=data,
            strategy=strategy,
        )

        # =========================================================
        # 5. CALCULATE STRATEGY METRICS
        # =========================================================

        strategy_metrics = calculate_backtest_metrics(
            result=result,
            risk_free_rate=risk_free_rate,
        )

        # =========================================================
        # 6. RUN BUY-AND-HOLD BENCHMARK
        # =========================================================

        benchmark_engine = BuyAndHoldBenchmark(
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
        )

        benchmark_result = benchmark_engine.run(
            data=data,
        )

        # =========================================================
        # 7. COMPARE STRATEGY VS BENCHMARK
        # =========================================================

        comparison = compare_strategy_with_benchmark(
            strategy_result=result,
            benchmark_result=benchmark_result,
        )

        # =========================================================
        # 8. CREATE EXPERIMENT REGISTRY RECORD
        # =========================================================

        experiment = self.experiment_service.create_experiment(
            db=db,
            name=f"{symbol} {strategy_name} Backtest",
            dataset_id=dataset.id,
            strategy_version_id=None,
            description=(
                f"Backtest experiment for {symbol} "
                f"using the {strategy_name} strategy."
            ),
            parameters={
                "strategy_name": strategy_name,
                "strategy_parameters": strategy_parameters or {},
                "initial_capital": initial_capital,
                "risk_free_rate": risk_free_rate,
            },
            start_date=result.start_date,
            end_date=result.end_date,
            transaction_cost=transaction_cost,
            slippage=slippage,
            execution_model="close",
            code_version="0.1.0",
            status="completed",
        )

        # =========================================================
        # 9. SERIALIZE TRADES
        # =========================================================

        trades = []

        for trade in result.trades:
            trades.append(
                {
                    "side": trade.side,
                    "quantity": float(trade.quantity),
                    "entry_price": float(trade.entry_price),
                    "entry_time": trade.entry_time,
                    "exit_price": (
                        float(trade.exit_price)
                        if trade.exit_price is not None
                        else None
                    ),
                    "exit_time": trade.exit_time,
                    "fees": float(trade.fees),
                    "pnl": (
                        float(trade.pnl)
                        if trade.pnl is not None
                        else None
                    ),
                }
            )

        # =========================================================
        # 10. SERIALIZE EQUITY CURVES
        # =========================================================

        equity_curve = [
            float(value)
            for value in result.equity_curve
        ]

        benchmark_equity_curve = [
            float(value)
            for value in benchmark_result.equity_curve
        ]

        # =========================================================
        # 11. FINAL RESPONSE
        # =========================================================

        return {
            "experiment_id": experiment.id,

            "symbol": symbol,

            "strategy": {
                "name": result.strategy_name,
                "parameters": result.strategy_parameters,
            },

            "backtest": {
                "initial_capital": float(
                    result.initial_capital
                ),
                "final_capital": float(
                    result.final_capital
                ),
                "total_return": float(
                    result.total_return
                ),
                "transaction_cost": float(
                    result.transaction_cost
                ),
                "slippage": float(
                    result.slippage
                ),
                "start_date": result.start_date,
                "end_date": result.end_date,
            },

            "metrics": strategy_metrics,

            "trades": trades,

            "equity_curve": equity_curve,

            "benchmark": {
                "name": benchmark_engine.name,
                "initial_capital": float(
                    benchmark_result.initial_capital
                ),
                "final_capital": float(
                    benchmark_result.final_capital
                ),
                "total_return": float(
                    benchmark_result.total_return
                ),
                "equity_curve": benchmark_equity_curve,
            },

            "comparison": {
                "strategy_metrics": (
                    comparison.strategy_metrics
                ),
                "benchmark_metrics": (
                    comparison.benchmark_metrics
                ),
                "return_difference": float(
                    comparison.return_difference
                ),
                "final_capital_difference": float(
                    comparison.final_capital_difference
                ),
                "strategy_outperformed": (
                    comparison.strategy_outperformed
                ),
            },
        }