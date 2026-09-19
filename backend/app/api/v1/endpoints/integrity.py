from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.integrity_service import IntegrityService


router = APIRouter(
    prefix="/integrity",
    tags=["Backtest Integrity"],
)

integrity_service = IntegrityService()


@router.get("/{symbol}")
def validate_backtest_integrity(
    symbol: str,
    initial_capital: float = Query(
        100000.0,
        gt=0,
    ),
    transaction_cost: float = Query(
        0.001,
        ge=0,
    ),
    slippage: float = Query(
        0.001,
        ge=0,
    ),
    db: Session = Depends(get_db),
):
    try:
        return integrity_service.validate_backtest(
            db=db,
            symbol=symbol.upper(),
            initial_capital=initial_capital,
            transaction_cost=transaction_cost,
            slippage=slippage,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )