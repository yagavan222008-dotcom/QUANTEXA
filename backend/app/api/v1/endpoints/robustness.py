from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.robustness_service import RobustnessService
from app.schemas.robustness import (
    RobustnessRequest,
    RobustnessResponse,
)


router = APIRouter(
    prefix="/robustness",
    tags=["Robustness"],
)

robustness_service = RobustnessService()


@router.post(
    "",
    response_model=RobustnessResponse,
)
def run_robustness(
    request: RobustnessRequest,
    db: Session = Depends(get_db),
):
    try:
        return robustness_service.run_robustness(
            db=db,
            symbol=request.symbol,
            strategy_name=request.strategy,
            parameter_grid=request.parameter_grid,
            transaction_costs=request.transaction_costs,
            slippages=request.slippages,
            initial_capital=request.initial_capital,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )