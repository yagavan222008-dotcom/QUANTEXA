from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.risk_service import RiskAnalysisService

router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"],
)

risk_service = RiskAnalysisService()


@router.get("/{symbol}")
def get_risk_analysis(
    symbol: str,
    db: Session = Depends(get_db),
):
    try:
        return risk_service.analyze(
            db=db,
            symbol=symbol.upper(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )
