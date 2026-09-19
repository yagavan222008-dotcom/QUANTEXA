from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.backtest_service import BacktestService
from app.schemas.backtests import (
    BacktestRequest,
    BacktestResponse,
)


router = APIRouter(
    prefix="/backtests",
    tags=["Backtesting"],
)

backtest_service = BacktestService()


@router.post(
    "",
    response_model=BacktestResponse,
)
def run_backtest(
    request: BacktestRequest,
    db: Session = Depends(get_db),
):
    try:
        return backtest_service.run_backtest(
            db=db,
            symbol=request.symbol,
            strategy_name=request.strategy,
            strategy_parameters=request.parameters,
            initial_capital=request.initial_capital,
            transaction_cost=request.transaction_cost,
            slippage=request.slippage,
            risk_free_rate=request.risk_free_rate,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )