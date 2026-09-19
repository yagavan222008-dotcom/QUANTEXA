from __future__ import annotations

import logging
from typing import Any
from sqlalchemy.orm import Session

from app.schemas.validation_new import validate_asset_symbol, validate_financial_parameters
from app.engines.data.quant_data import QuantDataService
from app.engines.indicator_service import IndicatorService
from app.engines.risk_service import RiskAnalysisService
from app.engines.correlation_service import CorrelationService
from app.engines.backtest_service import BacktestService
from app.engines.robustness_service import RobustnessService
from app.engines.regime_service import RegimeService
from app.engines.experiment_service import ExperimentService
from app.engines.integrity_service import IntegrityService

logger = logging.getLogger("quantext.ai.tools")

class QuantCopilotTools:
    """
    Controlled quantitative tool registry for Quant Copilot.
    Wraps existing backend engines and services directly. DOES NOT duplicate calculations.
    """
    def __init__(self) -> None:
        self.data_service = QuantDataService()
        self.indicator_service = IndicatorService()
        self.risk_service = RiskAnalysisService()
        self.correlation_service = CorrelationService()
        self.backtest_service = BacktestService()
        self.robustness_service = RobustnessService()
        self.regime_service = RegimeService()
        self.experiment_service = ExperimentService()
        self.integrity_service = IntegrityService()

    def get_asset_data(
        self,
        db: Session,
        symbol: str,
        timeframe: str = "1d",
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        data = self.data_service.get_market_data(
            db=db,
            symbol=symbol,
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date,
        )
        return {"symbol": symbol, "timeframe": timeframe, "records": len(data), "data": data[:100]}

    def calculate_returns(self, db: Session, symbol: str) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        analysis = self.indicator_service.analyze(db=db, symbol=symbol)
        latest = analysis.get("latest", {})
        return {
            "symbol": symbol,
            "daily_return": latest.get("daily_return"),
            "cumulative_return": latest.get("cumulative_return"),
            "rolling_return": latest.get("rolling_return"),
        }

    def calculate_volatility(self, db: Session, symbol: str) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        risk = self.risk_service.analyze(db=db, symbol=symbol)
        return {
            "symbol": symbol,
            "annualized_volatility": risk.get("annualized_volatility"),
            "historical_volatility": risk.get("historical_volatility"),
        }

    def calculate_sharpe(self, db: Session, symbol: str) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        risk = self.risk_service.analyze(db=db, symbol=symbol)
        return {
            "symbol": symbol,
            "sharpe_ratio": risk.get("sharpe_ratio"),
            "annualized_return": risk.get("annualized_return"),
            "annualized_volatility": risk.get("annualized_volatility"),
        }

    def calculate_drawdown(self, db: Session, symbol: str) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        risk = self.risk_service.analyze(db=db, symbol=symbol)
        return {
            "symbol": symbol,
            "maximum_drawdown": risk.get("maximum_drawdown"),
            "peak_price": risk.get("peak_price"),
            "trough_price": risk.get("trough_price"),
        }

    def calculate_correlation(
        self,
        db: Session,
        symbols: list[str],
        method: str = "pearson",
    ) -> dict[str, Any]:
        validated_symbols = [validate_asset_symbol(s) for s in symbols if s.strip()]
        return self.correlation_service.analyze_matrix(
            db=db,
            symbols=validated_symbols,
            method=method,
        )

    def calculate_rolling_correlation(
        self,
        db: Session,
        asset_a: str,
        asset_b: str,
        window: int = 30,
    ) -> dict[str, Any]:
        a = validate_asset_symbol(asset_a)
        b = validate_asset_symbol(asset_b)
        return self.correlation_service.analyze_rolling(
            db=db,
            asset_a=a,
            asset_b=b,
            window=window,
        )

    def calculate_indicators(
        self,
        db: Session,
        symbol: str,
        sma_fast: int = 20,
        sma_slow: int = 50,
        ema_fast: int = 20,
        ema_slow: int = 50,
        rolling_window: int = 20,
        volatility_window: int = 20,
    ) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        return self.indicator_service.analyze(
            db=db,
            symbol=symbol,
            sma_fast=sma_fast,
            sma_slow=sma_slow,
            ema_fast=ema_fast,
            ema_slow=ema_slow,
            rolling_window=rolling_window,
            volatility_window=volatility_window,
        )

    def run_backtest(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        strategy_parameters: dict[str, Any] | None = None,
        initial_capital: float = 100000.0,
        transaction_cost: float = 0.001,
        slippage: float = 0.001,
        risk_free_rate: float = 0.0,
    ) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        validate_financial_parameters(
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
            risk_free_rate=risk_free_rate,
        )
        return self.backtest_service.run_backtest(
            db=db,
            symbol=symbol,
            strategy_name=strategy_name,
            strategy_parameters=strategy_parameters or {},
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
            risk_free_rate=risk_free_rate,
        )

    def compare_benchmark(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        strategy_parameters: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        bt_res = self.run_backtest(
            db=db,
            symbol=symbol,
            strategy_name=strategy_name,
            strategy_parameters=strategy_parameters,
        )
        return {
            "symbol": symbol,
            "strategy": bt_res.get("strategy"),
            "metrics": bt_res.get("metrics"),
            "benchmark": bt_res.get("benchmark"),
            "comparison": bt_res.get("comparison"),
        }

    def run_robustness_test(
        self,
        db: Session,
        symbol: str,
        strategy_name: str,
        parameter_grid: dict[str, list[Any]],
        transaction_costs: list[float] | None = None,
        slippages: list[float] | None = None,
        initial_capital: float = 100000.0,
    ) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        return self.robustness_service.run_robustness_test(
            db=db,
            symbol=symbol,
            strategy_name=strategy_name,
            parameter_grid=parameter_grid,
            transaction_costs=transaction_costs or [0.001],
            slippages=slippages or [0.001],
            initial_capital=initial_capital,
        )

    def analyze_market_regime(
        self,
        db: Session,
        symbol: str,
        return_window: int = 20,
        volatility_window: int = 20,
    ) -> dict[str, Any]:
        symbol = validate_asset_symbol(symbol)
        return self.regime_service.analyze(
            db=db,
            symbol=symbol,
            return_window=return_window,
            volatility_window=volatility_window,
        )

    def get_experiment(self, db: Session, experiment_id: int) -> dict[str, Any]:
        if experiment_id <= 0:
            raise ValueError("experiment_id must be > 0.")
        exp = self.experiment_service.get_experiment(db=db, experiment_id=experiment_id)
        if not exp:
            raise ValueError(f"Experiment with ID {experiment_id} not found.")
        return {
            "id": exp.id,
            "name": exp.name,
            "dataset_id": exp.dataset_id,
            "status": exp.status,
            "parameters": exp.parameters,
        }

    def check_backtest_integrity(self, db: Session, dataset_id: int) -> dict[str, Any]:
        if dataset_id <= 0:
            raise ValueError("dataset_id must be > 0.")
        return self.integrity_service.check_integrity(db=db, dataset_id=dataset_id)
