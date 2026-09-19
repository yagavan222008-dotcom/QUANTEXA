from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ExperimentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)

    dataset_id: int = Field(gt=0)

    strategy_version_id: int | None = Field(
        default=None,
        gt=0,
    )

    description: str | None = None

    parameters: dict[str, Any] = Field(
        default_factory=dict
    )

    start_date: datetime

    end_date: datetime

    transaction_cost: float = Field(
        default=0.0,
        ge=0,
    )

    slippage: float = Field(
        default=0.0,
        ge=0,
    )

    execution_model: str = Field(
        default="close",
        max_length=50,
    )

    code_version: str | None = Field(
        default=None,
        max_length=100,
    )

    status: str = Field(
        default="created",
        max_length=30,
    )


class ExperimentResponse(BaseModel):
    id: int

    dataset_id: int
    strategy_version_id: int | None

    name: str
    description: str | None

    parameters: dict[str, Any]

    start_date: datetime
    end_date: datetime

    transaction_cost: float
    slippage: float

    execution_model: str

    code_version: str | None
    status: str

    created_at: datetime

    model_config = {
        "from_attributes": True
    }