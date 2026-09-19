from __future__ import annotations

from sqlalchemy.orm import Session

from app.engines.backtesting.integrity import (
    BacktestIntegrityEngine,
)
from app.engines.data.quant_data import QuantDataService


class IntegrityService:

    def __init__(self) -> None:
        self.data_service = QuantDataService()
        self.integrity_engine = BacktestIntegrityEngine()

    def validate_backtest(
        self,
        db: Session,
        symbol: str,
        initial_capital: float = 100000.0,
        transaction_cost: float = 0.001,
        slippage: float = 0.001,
        strategy_parameters: dict | None = None,
    ) -> dict:

        symbol = symbol.upper()

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
        # 2. RUN INTEGRITY ENGINE
        # =========================================================

        report = self.integrity_engine.validate(
            data=data,
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
            strategy_parameters=strategy_parameters,
        )

        # =========================================================
        # 3. SERIALIZE CHECKS
        # =========================================================

        checks = []

        for check in report.checks:
            checks.append(
                {
                    "name": check.name,
                    "passed": check.passed,
                    "severity": check.severity,
                    "message": check.message,
                }
            )

        # =========================================================
        # 4. RETURN API-FRIENDLY RESULT
        # =========================================================

        return {
            "symbol": symbol,
            "passed": report.passed,
            "checks": checks,
            "warnings": report.warnings,
            "errors": report.errors,
            "metadata": report.metadata,
        }