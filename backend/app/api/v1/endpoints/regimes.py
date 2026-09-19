from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.regime_service import RegimeService
from app.schemas.regimes import RegimeResponse


router = APIRouter(
    prefix="/regimes",
    tags=["Regimes"],
)

regime_service = RegimeService()


@router.get("/{symbol}", response_model=RegimeResponse)
def get_regime_analysis(
    symbol: str,
    return_window: int = Query(20, ge=1),
    volatility_window: int = Query(20, ge=1),
    db: Session = Depends(get_db),
):
    try:
        return regime_service.analyze(
            db=db,
            symbol=symbol.upper(),
            return_window=return_window,
            volatility_window=volatility_window,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )