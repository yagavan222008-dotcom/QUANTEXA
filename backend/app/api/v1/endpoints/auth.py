from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.database.session import get_db
from app.engines.audit_service import AuditLogService
from app.engines.auth_service import AuthService
from app.models.user import User
from app.schemas.users import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

auth_service = AuthService()
audit_service = AuditLogService()


# ============================================================
# REGISTER
# ============================================================

@limiter.limit("3/minute")
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        user = auth_service.register_user(
            db=db,
            user_data=user_data,
        )

        audit_service.log(
            db=db,
            action="USER_REGISTERED",
            user_id=user.id,
            resource_type="user",
            resource_id=str(user.id),
            ip_address=(
                request.client.host
                if request.client
                else None
            ),
            user_agent=request.headers.get(
                "user-agent"
            ),
            details={
                "username": user.username,
            },
            status="success",
        )

        return user

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


# ============================================================
# LOGIN
# ============================================================

@limiter.limit("5/minute")
@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: Request,
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = auth_service.authenticate_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
    )

    # --------------------------------------------------------
    # Failed login
    # --------------------------------------------------------

    if user is None:

        audit_service.log(
            db=db,
            action="USER_LOGIN_FAILED",
            ip_address=(
                request.client.host
                if request.client
                else None
            ),
            user_agent=request.headers.get(
                "user-agent"
            ),
            details={
                "email": user_data.email.lower().strip(),
            },
            status="failed",
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # --------------------------------------------------------
    # Create JWT
    # --------------------------------------------------------

    access_token = auth_service.create_user_token(
        user=user,
    )

    # --------------------------------------------------------
    # Successful login audit
    # --------------------------------------------------------

    audit_service.log(
        db=db,
        action="USER_LOGIN",
        user_id=user.id,
        resource_type="user",
        resource_id=str(user.id),
        ip_address=(
            request.client.host
            if request.client
            else None
        ),
        user_agent=request.headers.get(
            "user-agent"
        ),
        details={
            "username": user.username,
        },
        status="success",
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


# ============================================================
# CURRENT USER — PROTECTED
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user