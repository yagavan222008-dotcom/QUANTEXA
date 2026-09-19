from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.indicator_service import IndicatorService
from app.schemas.indicators import IndicatorResponse


router = APIRouter(
    prefix="/indicators",
    tags=["Indicators"],
)

indicator_service = IndicatorService()


@router.get(
    "/{symbol}",
    response_model=IndicatorResponse,
)
def get_indicators(
    symbol: str,
    sma_fast: int = Query(20, ge=1),
    sma_slow: int = Query(50, ge=1),
    ema_fast: int = Query(20, ge=1),
    ema_slow: int = Query(50, ge=1),
    rolling_window: int = Query(20, ge=1),
    volatility_window: int = Query(20, ge=1),
    db: Session = Depends(get_db),
):
    try:
        return indicator_service.analyze(
            db=db,
            symbol=symbol.upper(),
            sma_fast=sma_fast,
            sma_slow=sma_slow,
            ema_fast=ema_fast,
            ema_slow=ema_slow,
            rolling_window=rolling_window,
            volatility_window=volatility_window,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )