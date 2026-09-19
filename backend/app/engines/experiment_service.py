from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.experiment import Experiment


class ExperimentService:

    def create_experiment(
        self,
        db: Session,
        *,
        name: str,
        dataset_id: int,
        strategy_version_id: int | None,
        description: str | None,
        parameters: dict,
        start_date,
        end_date,
        transaction_cost: float,
        slippage: float,
        execution_model: str,
        code_version: str | None,
        status: str,
    ) -> Experiment:

        experiment = Experiment(
            name=name,
            dataset_id=dataset_id,
            strategy_version_id=strategy_version_id,
            description=description,
            parameters=parameters,
            start_date=start_date,
            end_date=end_date,
            transaction_cost=Decimal(str(transaction_cost)),
            slippage=Decimal(str(slippage)),
            execution_model=execution_model,
            code_version=code_version,
            status=status,
        )

        db.add(experiment)
        db.commit()
        db.refresh(experiment)

        return experiment

    def get_experiment(
        self,
        db: Session,
        experiment_id: int,
    ) -> Experiment | None:

        return (
            db.query(Experiment)
            .filter(
                Experiment.id == experiment_id
            )
            .first()
        )

    def list_experiments(
        self,
        db: Session,
        limit: int = 50,
    ) -> list[Experiment]:

        return (
            db.query(Experiment)
            .order_by(
                Experiment.created_at.desc()
            )
            .limit(limit)
            .all()
        )