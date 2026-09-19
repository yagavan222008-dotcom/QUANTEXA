from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.data.market_data_service import MarketDataService
from app.schemas.market import AssetOverviewResponse


router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)

market_data_service = MarketDataService()


@router.get(
    "/overview",
    response_model=AssetOverviewResponse,
)
def get_assets_overview(
    db: Session = Depends(get_db),
):

    from app.engines.data.repositories.market_data_repository import (
        MarketDataRepository,
    )

    repository = MarketDataRepository()

    assets = repository.list_assets(db=db)

    results = []

    for asset in assets:
        try:
            result = market_data_service.get_asset_overview(
                db=db,
                symbol=asset.symbol,
            )
            results.append(result)
        except ValueError:
            continue

    return {
        "assets": results,
    }


@router.get("/{symbol}")
def get_asset(
    symbol: str,
    db: Session = Depends(get_db),
):

    try:
        return market_data_service.get_asset_overview(
            db=db,
            symbol=symbol.upper(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
