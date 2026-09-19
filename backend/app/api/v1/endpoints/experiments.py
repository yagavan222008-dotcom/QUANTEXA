from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.engines.experiment_service import ExperimentService
from app.schemas.experiments import (
    ExperimentCreate,
    ExperimentResponse,
)


router = APIRouter(
    prefix="/experiments",
    tags=["Experiments"],
)

experiment_service = ExperimentService()


@router.post(
    "",
    response_model=ExperimentResponse,
    status_code=201,
)
def create_experiment(
    request: ExperimentCreate,
    db: Session = Depends(get_db),
):
    try:
        return experiment_service.create_experiment(
            db=db,
            name=request.name,
            dataset_id=request.dataset_id,
            strategy_version_id=request.strategy_version_id,
            description=request.description,
            parameters=request.parameters,
            start_date=request.start_date,
            end_date=request.end_date,
            transaction_cost=request.transaction_cost,
            slippage=request.slippage,
            execution_model=request.execution_model,
            code_version=request.code_version,
            status=request.status,
        )

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[ExperimentResponse],
)
def list_experiments(
    limit: int = Query(
        50,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    return experiment_service.list_experiments(
        db=db,
        limit=limit,
    )


@router.get(
    "/{experiment_id}",
    response_model=ExperimentResponse,
)
def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
):
    experiment = experiment_service.get_experiment(
        db=db,
        experiment_id=experiment_id,
    )

    if experiment is None:
        raise HTTPException(
            status_code=404,
            detail=f"Experiment {experiment_id} not found",
        )

    return experiment