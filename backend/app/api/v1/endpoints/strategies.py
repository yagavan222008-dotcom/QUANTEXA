from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.strategy_service import StrategyService
from app.schemas.strategies import (
    StrategyListResponse,
    StrategySignalRequest,
    StrategySignalResponse,
)


router = APIRouter(
    prefix="/strategies",
    tags=["Strategies"],
)

strategy_service = StrategyService()


@router.get(
    "",
    response_model=StrategyListResponse,
)
def get_strategies():
    strategies = (
        strategy_service.get_available_strategies()
    )

    return {
        "strategies": [
            {"name": name}
            for name in strategies
        ]
    }


@router.post(
    "/signals",
    response_model=StrategySignalResponse,
)
def generate_strategy_signals(
    request: StrategySignalRequest,
    db: Session = Depends(get_db),
):

    try:

        return strategy_service.generate_signals(
            db=db,
            symbol=request.symbol,
            strategy_name=request.strategy,
            parameters=request.parameters,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
