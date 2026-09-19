from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.data.market_data_service import MarketDataService
from app.schemas.market import MarketDataResponse


router = APIRouter(
    prefix="/market-data",
    tags=["Market Data"],
)

market_data_service = MarketDataService()


@router.get(
    "/{symbol}",
    response_model=MarketDataResponse,
)
def get_market_data(
    symbol: str,
    db: Session = Depends(get_db),
):

    try:
        return market_data_service.get_market_history(
            db=db,
            symbol=symbol.upper(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
