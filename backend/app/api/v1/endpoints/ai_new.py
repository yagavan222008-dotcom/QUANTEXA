from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.ai.schemas import AIResearchRequest, AIResearchResponse
from app.engines.ai.orchestrator import AIQuantOrchestrator
from app.core.safe_errors_new import build_safe_error_response

router = APIRouter(
    prefix="/ai",
    tags=["AI Quant Copilot"],
)

orchestrator = AIQuantOrchestrator()

@router.post(
    "/research",
    response_model=AIResearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Quant Copilot Research Query",
    description="Submit a quantitative research question to Quant Copilot. Wraps backend engines to produce verified numerical results synthesized by Featherless AI.",
)
def quant_research(
    request: AIResearchRequest,
    db: Session = Depends(get_db),
):
    try:
        response = orchestrator.process_research_request(
            db=db,
            request=request,
        )
        return response

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:
        return build_safe_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during AI copilot execution.",
        )
