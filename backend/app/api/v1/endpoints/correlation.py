from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.correlation_service import CorrelationService
from app.schemas.correlation import (
    CorrelationResponse,
    RollingCorrelationResponse,
)


router = APIRouter(
    prefix="/correlation",
    tags=["Correlation"],
)

correlation_service = CorrelationService()


@router.get(
    "",
    response_model=CorrelationResponse,
)
def get_correlation_matrix(
    symbols: str = Query(
        default="NVDA,BTC-USD,GC=F",
        description="Comma-separated asset symbols",
    ),
    method: str = Query(
        default="pearson",
        description="Correlation method: pearson, spearman, or kendall",
    ),
    db: Session = Depends(get_db),
):

    symbol_list = [
        symbol.strip()
        for symbol in symbols.split(",")
        if symbol.strip()
    ]

    try:
        return correlation_service.analyze_matrix(
            db=db,
            symbols=symbol_list,
            method=method,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "/rolling",
    response_model=RollingCorrelationResponse,
)
def get_rolling_correlation(
    asset_a: str,
    asset_b: str,
    window: int = Query(
        default=30,
        ge=2,
        description="Rolling correlation window in trading days",
    ),
    db: Session = Depends(get_db),
):

    try:
        return correlation_service.analyze_rolling(
            db=db,
            asset_a=asset_a,
            asset_b=asset_b,
            window=window,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
