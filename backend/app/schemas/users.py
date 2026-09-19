from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# REGISTER USER
# ============================================================

class UserCreate(BaseModel):
    email: EmailStr

    username: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_.-]+$",
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    full_name: str | None = Field(
        default=None,
        max_length=100,
    )


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: str | None
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
# ============================================================
# LOGIN
# ============================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=1,
        max_length=128,
    )


# ============================================================
# TOKEN RESPONSE
# ============================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"