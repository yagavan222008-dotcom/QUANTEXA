from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.core.exception_handlers import internal_server_error_handler
from app.core.rate_limit import limiter


app = FastAPI(
    title="Quantext API",
    description="Quantitative Multi-Asset Financial Intelligence & Backtesting Platform",
    version="0.1.0",
)


# ---------------------------------------------------------
# Rate Limiting
# ---------------------------------------------------------

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# ---------------------------------------------------------
# Global Exception Handling
# ---------------------------------------------------------

app.add_exception_handler(
    Exception,
    internal_server_error_handler,
)


# ---------------------------------------------------------
# API Routes
# ---------------------------------------------------------

app.include_router(
    api_router,
    prefix="/api/v1",
)


# ---------------------------------------------------------
# Basic Routes
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "application": "Quantext",
        "status": "online",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "quantext-backend",
    }


# ---------------------------------------------------------
# Security Headers
# ---------------------------------------------------------

app.add_middleware(
    SecurityHeadersMiddleware
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)