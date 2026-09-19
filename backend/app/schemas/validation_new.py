from __future__ import annotations

import re
from datetime import datetime, date
from typing import Any
from pydantic import BaseModel, Field, EmailStr, field_validator

# Standard Asset Symbol Regex (alphanumeric, dot, hyphen, equals sign for tickers like GC=F, BTC-USD, NVDA)
SYMBOL_REGEX = re.compile(r"^[A-Za-z0-9\.\=\-\^]{1,20}$")

# Username regex (letters, numbers, underscore, dot, hyphen)
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_.-]{3,50}$")

def validate_asset_symbol(symbol: str) -> str:
    """
    Validate and normalize financial asset ticker symbols.
    Excludes empty strings, invalid characters, and excessive length.
    """
    if not symbol or not isinstance(symbol, str):
        raise ValueError("Asset symbol cannot be empty.")
    cleaned = symbol.strip().upper()
    if not SYMBOL_REGEX.match(cleaned):
        raise ValueError(f"Invalid asset symbol format: '{symbol}'")
    return cleaned

def validate_date_range(
    start_date: datetime | date | str | None,
    end_date: datetime | date | str | None,
) -> tuple[datetime | None, datetime | None]:
    """
    Validate start_date and end_date ranges.
    Ensures start_date <= end_date and formats properly.
    """
    def _parse(val: Any) -> datetime | None:
        if val is None:
            return None
        if isinstance(val, datetime):
            return val
        if isinstance(val, date):
            return datetime.combine(val, datetime.min.time())
        if isinstance(val, str):
            val_str = val.strip()
            if not val_str:
                return None
            try:
                return datetime.fromisoformat(val_str.replace("Z", "+00:00"))
            except ValueError:
                raise ValueError(f"Invalid date format: '{val}'")
        raise ValueError(f"Unsupported date type: {type(val)}")

    dt_start = _parse(start_date)
    dt_end = _parse(end_date)

    if dt_start and dt_end and dt_start > dt_end:
        raise ValueError("start_date cannot be after end_date.")

    return dt_start, dt_end

def validate_financial_parameters(
    initial_capital: float | None = None,
    transaction_cost: float | None = None,
    slippage: float | None = None,
    risk_free_rate: float | None = None,
) -> dict[str, float]:
    """
    Validate numerical financial parameters (capital > 0, transaction cost >= 0, slippage >= 0, etc.).
    Prevents negative or excessively large values (e.g. > 1e12).
    """
    validated = {}
    if initial_capital is not None:
        if initial_capital <= 0:
            raise ValueError("initial_capital must be strictly positive (> 0).")
        if initial_capital > 1e12:
            raise ValueError("initial_capital exceeds maximum supported threshold (1 Trillion).")
        validated["initial_capital"] = float(initial_capital)

    if transaction_cost is not None:
        if transaction_cost < 0:
            raise ValueError("transaction_cost cannot be negative.")
        if transaction_cost > 1.0:
            raise ValueError("transaction_cost cannot exceed 1.0 (100%).")
        validated["transaction_cost"] = float(transaction_cost)

    if slippage is not None:
        if slippage < 0:
            raise ValueError("slippage cannot be negative.")
        if slippage > 1.0:
            raise ValueError("slippage cannot exceed 1.0 (100%).")
        validated["slippage"] = float(slippage)

    if risk_free_rate is not None:
        if risk_free_rate < 0 or risk_free_rate > 2.0:
            raise ValueError("risk_free_rate must be between 0.0 and 2.0 (0% - 200%).")
        validated["risk_free_rate"] = float(risk_free_rate)

    return validated

def validate_pagination(
    page: int = 1,
    page_size: int = 50,
    max_size: int = 500,
) -> tuple[int, int]:
    """
    Validate pagination query parameters.
    """
    if page < 1:
        raise ValueError("page must be >= 1")
    if page_size < 1:
        raise ValueError("page_size must be >= 1")
    bounded_size = min(page_size, max_size)
    return page, bounded_size

class ValidatedUserRegistration(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: str) -> str:
        v = v.strip()
        if not USERNAME_REGEX.match(v):
            raise ValueError("Username can only contain alphanumeric characters, underscores, dots, and hyphens.")
        return v

    @field_validator("password")
    @classmethod
    def check_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v

class ValidatedBacktestInput(BaseModel):
    symbol: str
    strategy: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    initial_capital: float = Field(default=100000.0, gt=0, le=1e12)
    transaction_cost: float = Field(default=0.001, ge=0, le=1.0)
    slippage: float = Field(default=0.001, ge=0, le=1.0)
    risk_free_rate: float = Field(default=0.0, ge=0, le=2.0)

    @field_validator("symbol")
    @classmethod
    def check_symbol(cls, v: str) -> str:
        return validate_asset_symbol(v)

    @field_validator("strategy")
    @classmethod
    def check_strategy(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Strategy name cannot be empty.")
        if len(v) > 50:
            raise ValueError("Strategy name too long.")
        return v
