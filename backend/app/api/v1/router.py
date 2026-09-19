from fastapi import APIRouter

from app.api.v1.endpoints.assets import router as assets_router
from app.api.v1.endpoints.market_data import router as market_data_router
from app.api.v1.endpoints.risk import router as risk_router
from app.api.v1.endpoints.correlation import router as correlation_router
from app.api.v1.endpoints.indicators import router as indicators_router
from app.api.v1.endpoints.strategies import router as strategies_router
from app.api.v1.endpoints.backtests import router as backtests_router
from app.api.v1.endpoints.robustness import router as robustness_router
from app.api.v1.endpoints.regimes import router as regimes_router
from app.api.v1.endpoints.experiments import router as experiments_router
from app.api.v1.endpoints.integrity import router as integrity_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.ai_new import router as ai_router


api_router = APIRouter()


api_router.include_router(
    assets_router
)

api_router.include_router(
    market_data_router
)

api_router.include_router(
    risk_router
)

api_router.include_router(
    correlation_router
)

api_router.include_router(
    indicators_router
)

api_router.include_router(
    strategies_router
)
api_router.include_router(
    backtests_router
)
api_router.include_router(
    robustness_router
)
api_router.include_router(
    regimes_router
)
api_router.include_router(
    experiments_router
)
api_router.include_router(
    integrity_router
)
api_router.include_router(auth_router)
api_router.include_router(ai_router)