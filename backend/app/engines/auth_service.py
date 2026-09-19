from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.users import UserCreate


class AuthService:

    # =========================================================
    # REGISTER USER
    # =========================================================

    def register_user(
        self,
        db: Session,
        user_data: UserCreate,
    ) -> User:

        email = user_data.email.lower().strip()
        username = user_data.username.strip()

        # -----------------------------------------------------
        # Check duplicate email
        # -----------------------------------------------------

        existing_email = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_email:
            raise ValueError(
                "An account with this email already exists."
            )

        # -----------------------------------------------------
        # Check duplicate username
        # -----------------------------------------------------

        existing_username = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_username:
            raise ValueError(
                "This username is already taken."
            )

        # -----------------------------------------------------
        # Hash password
        # -----------------------------------------------------

        hashed_password = hash_password(
            user_data.password
        )

        # -----------------------------------------------------
        # Create user
        # -----------------------------------------------------

        user = User(
            email=email,
            username=username,
            full_name=(
                user_data.full_name.strip()
                if user_data.full_name
                else None
            ),
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False,
            role="user",
        )

        db.add(user)

        try:
            db.commit()
            db.refresh(user)

        except Exception:
            db.rollback()
            raise

        return user

    # =========================================================
    # FIND USER BY EMAIL
    # =========================================================

    def get_user_by_email(
        self,
        db: Session,
        email: str,
    ) -> User | None:

        return (
            db.query(User)
            .filter(
                User.email == email.lower().strip()
            )
            .first()
        )

    # =========================================================
    # FIND USER BY USERNAME
    # =========================================================

    def get_user_by_username(
        self,
        db: Session,
        username: str,
    ) -> User | None:

        return (
            db.query(User)
            .filter(
                User.username == username.strip()
            )
            .first()
        )

    # =========================================================
    # FIND USER BY ID
    # =========================================================

    def get_user_by_id(
        self,
        db: Session,
        user_id: int,
    ) -> User | None:

        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    # =========================================================
    # AUTHENTICATE USER
    # =========================================================

    def authenticate_user(
        self,
        db: Session,
        email: str,
        password: str,
    ) -> User | None:

        user = self.get_user_by_email(
            db=db,
            email=email,
        )

        if user is None:
            return None

        if not verify_password(
            password,
            user.hashed_password,
        ):
            return None

        if not user.is_active:
            return None

        return user

    # =========================================================
    # CREATE USER ACCESS TOKEN
    # =========================================================

    def create_user_token(
        self,
        user: User,
    ) -> str:

        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
        }

        return create_access_token(
            data=token_data,
        )