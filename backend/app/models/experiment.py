from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Reproducibility references
    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("datasets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    strategy_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("strategy_versions.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    # Human-readable experiment information
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Exact experiment configuration
    parameters: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    # Backtest / analysis period
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # Execution assumptions
    transaction_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
        default=Decimal("0"),
    )

    slippage: Mapped[Decimal] = mapped_column(
        Numeric(12, 8),
        nullable=False,
        default=Decimal("0"),
    )

    execution_model: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="close",
    )

    # Software/reproducibility information
    code_version: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="created",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )