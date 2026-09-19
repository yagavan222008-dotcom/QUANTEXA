from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogService:

    # =========================================================
    # CREATE AUDIT LOG
    # =========================================================

    def log(
        self,
        db: Session,
        *,
        action: str,
        user_id: int | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        details: dict[str, Any] | None = None,
        status: str = "success",
    ) -> AuditLog:

        # -----------------------------------------------------
        # Never store secrets in audit metadata.
        # -----------------------------------------------------

        safe_details = self._sanitize_details(
            details
        )

        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=safe_details,
            status=status,
        )

        db.add(audit_log)

        try:
            db.commit()
            db.refresh(audit_log)

        except Exception:
            db.rollback()
            raise

        return audit_log

    # =========================================================
    # SANITIZE DETAILS
    # =========================================================

    @staticmethod
    def _sanitize_details(
        details: dict[str, Any] | None,
    ) -> dict[str, Any] | None:

        if details is None:
            return None

        sensitive_keys = {
            "password",
            "hashed_password",
            "token",
            "access_token",
            "refresh_token",
            "authorization",
            "api_key",
            "secret_key",
            "featherless_api_key",
            "alpha_vantage_api_key",
        }

        sanitized: dict[str, Any] = {}

        for key, value in details.items():

            normalized_key = key.lower().strip()

            if normalized_key in sensitive_keys:
                sanitized[key] = "[REDACTED]"
                continue

            sanitized[key] = value

        return sanitized

    # =========================================================
    # GET USER AUDIT LOGS
    # =========================================================

    def get_user_logs(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
    ) -> list[AuditLog]:

        limit = max(1, min(limit, 100))

        return (
            db.query(AuditLog)
            .filter(
                AuditLog.user_id == user_id
            )
            .order_by(
                AuditLog.created_at.desc()
            )
            .limit(limit)
            .all()
        )

    # =========================================================
    # GET RECENT AUDIT LOGS
    # =========================================================

    def get_recent_logs(
        self,
        db: Session,
        limit: int = 50,
    ) -> list[AuditLog]:

        limit = max(1, min(limit, 100))

        return (
            db.query(AuditLog)
            .order_by(
                AuditLog.created_at.desc()
            )
            .limit(limit)
            .all()
        )