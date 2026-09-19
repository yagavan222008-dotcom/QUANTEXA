from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import pandas as pd


@dataclass
class IntegrityCheck:
    name: str
    passed: bool
    severity: str
    message: str


@dataclass
class IntegrityReport:
    passed: bool
    checks: list[IntegrityCheck] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    errors: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class BacktestIntegrityEngine:

    def validate(
        self,
        data: pd.DataFrame,
        *,
        initial_capital: float,
        transaction_cost: float,
        slippage: float,
        strategy_parameters: dict | None = None,
    ) -> IntegrityReport:

        checks: list[IntegrityCheck] = []
        warnings: list[str] = []
        errors: list[str] = []

        # =========================================================
        # 1. DATASET NOT EMPTY
        # =========================================================

        if data.empty:
            errors.append(
                "Market data is empty."
            )

            checks.append(
                IntegrityCheck(
                    name="non_empty_dataset",
                    passed=False,
                    severity="error",
                    message="Market data is empty.",
                )
            )

        else:
            checks.append(
                IntegrityCheck(
                    name="non_empty_dataset",
                    passed=True,
                    severity="info",
                    message="Market data contains observations.",
                )
            )

        # =========================================================
        # 2. REQUIRED CLOSE COLUMN
        # =========================================================

        has_close = "close" in data.columns

        if not has_close:
            errors.append(
                "Market data does not contain a 'close' column."
            )

        checks.append(
            IntegrityCheck(
                name="close_column",
                passed=has_close,
                severity=(
                    "info"
                    if has_close
                    else "error"
                ),
                message=(
                    "Close price column is present."
                    if has_close
                    else "Close price column is missing."
                ),
            )
        )

        # Stop price-dependent checks if close is missing.
        if not has_close:
            return IntegrityReport(
                passed=False,
                checks=checks,
                warnings=warnings,
                errors=errors,
                metadata={
                    "initial_capital": initial_capital,
                    "transaction_cost": transaction_cost,
                    "slippage": slippage,
                },
            )

        # =========================================================
        # 3. INDEX VALIDATION
        # =========================================================

        index_is_unique = data.index.is_unique

        checks.append(
            IntegrityCheck(
                name="unique_timestamps",
                passed=index_is_unique,
                severity=(
                    "info"
                    if index_is_unique
                    else "error"
                ),
                message=(
                    "Timestamps are unique."
                    if index_is_unique
                    else "Duplicate timestamps detected."
                ),
            )
        )

        if not index_is_unique:
            errors.append(
                "Duplicate timestamps detected."
            )

        # =========================================================
        # 4. CHRONOLOGICAL ORDER
        # =========================================================

        chronological = (
            data.index.is_monotonic_increasing
        )

        checks.append(
            IntegrityCheck(
                name="chronological_order",
                passed=chronological,
                severity="warning"
                if not chronological
                else "info",
                message=(
                    "Market data is chronologically ordered."
                    if chronological
                    else "Market data is not chronologically ordered."
                ),
            )
        )

        if not chronological:
            warnings.append(
                "Market data will require chronological sorting."
            )

        # =========================================================
        # 5. MISSING CLOSE VALUES
        # =========================================================

        missing_close = int(
            data["close"].isna().sum()
        )

        no_missing_close = (
            missing_close == 0
        )

        checks.append(
            IntegrityCheck(
                name="missing_close_prices",
                passed=no_missing_close,
                severity=(
                    "info"
                    if no_missing_close
                    else "error"
                ),
                message=(
                    "No missing close prices."
                    if no_missing_close
                    else (
                        f"{missing_close} missing "
                        "close prices detected."
                    )
                ),
            )
        )

        if not no_missing_close:
            errors.append(
                f"{missing_close} missing close prices detected."
            )

        # =========================================================
        # 6. INVALID CLOSE PRICES
        # =========================================================

        invalid_prices = int(
            (data["close"] <= 0).sum()
        )

        valid_prices = (
            invalid_prices == 0
        )

        checks.append(
            IntegrityCheck(
                name="valid_close_prices",
                passed=valid_prices,
                severity=(
                    "info"
                    if valid_prices
                    else "error"
                ),
                message=(
                    "All close prices are positive."
                    if valid_prices
                    else (
                        f"{invalid_prices} invalid "
                        "close prices detected."
                    )
                ),
            )
        )

        if not valid_prices:
            errors.append(
                f"{invalid_prices} invalid close prices detected."
            )

        # =========================================================
        # 7. INITIAL CAPITAL
        # =========================================================

        valid_capital = (
            initial_capital > 0
        )

        checks.append(
            IntegrityCheck(
                name="initial_capital",
                passed=valid_capital,
                severity=(
                    "info"
                    if valid_capital
                    else "error"
                ),
                message=(
                    "Initial capital is positive."
                    if valid_capital
                    else "Initial capital must be greater than zero."
                ),
            )
        )

        if not valid_capital:
            errors.append(
                "Initial capital must be greater than zero."
            )

        # =========================================================
        # 8. TRANSACTION COST
        # =========================================================

        valid_transaction_cost = (
            transaction_cost >= 0
        )

        checks.append(
            IntegrityCheck(
                name="transaction_cost",
                passed=valid_transaction_cost,
                severity=(
                    "info"
                    if valid_transaction_cost
                    else "error"
                ),
                message=(
                    "Transaction cost is valid."
                    if valid_transaction_cost
                    else "Transaction cost cannot be negative."
                ),
            )
        )

        if not valid_transaction_cost:
            errors.append(
                "Transaction cost cannot be negative."
            )

        # =========================================================
        # 9. SLIPPAGE
        # =========================================================

        valid_slippage = (
            slippage >= 0
        )

        checks.append(
            IntegrityCheck(
                name="slippage",
                passed=valid_slippage,
                severity=(
                    "info"
                    if valid_slippage
                    else "error"
                ),
                message=(
                    "Slippage is valid."
                    if valid_slippage
                    else "Slippage cannot be negative."
                ),
            )
        )

        if not valid_slippage:
            errors.append(
                "Slippage cannot be negative."
            )

        # =========================================================
        # 10. STRATEGY PARAMETERS
        # =========================================================

        parameters_valid = (
            strategy_parameters is None
            or isinstance(
                strategy_parameters,
                dict,
            )
        )

        checks.append(
            IntegrityCheck(
                name="strategy_parameters",
                passed=parameters_valid,
                severity=(
                    "info"
                    if parameters_valid
                    else "error"
                ),
                message=(
                    "Strategy parameters are valid."
                    if parameters_valid
                    else "Strategy parameters must be a dictionary."
                ),
            )
        )

        if not parameters_valid:
            errors.append(
                "Strategy parameters must be a dictionary."
            )

        # =========================================================
        # 11. LOOK-AHEAD WARNING
        # =========================================================

        warnings.append(
            "Signal integrity depends on the strategy implementation. "
            "The integrity engine does not assume that every custom "
            "strategy is free from look-ahead bias."
        )

        checks.append(
            IntegrityCheck(
                name="lookahead_bias",
                passed=True,
                severity="warning",
                message=(
                    "No automatic look-ahead violation detected. "
                    "Strategy implementation must still be reviewed."
                ),
            )
        )

        # =========================================================
        # 12. FINAL RESULT
        # =========================================================

        passed = len(errors) == 0

        return IntegrityReport(
            passed=passed,
            checks=checks,
            warnings=warnings,
            errors=errors,
            metadata={
                "observations": len(data),
                "start_date": (
                    data.index[0]
                    if not data.empty
                    else None
                ),
                "end_date": (
                    data.index[-1]
                    if not data.empty
                    else None
                ),
                "initial_capital": initial_capital,
                "transaction_cost": transaction_cost,
                "slippage": slippage,
            },
        )