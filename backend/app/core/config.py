from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Quantext"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str = ""

    # ============================================================
    # SECURITY
    # ============================================================

    SECRET_KEY: str = ""

    # ============================================================
    # EXTERNAL APIs
    # ============================================================

    FEATHERLESS_API_KEY: str = ""
    ALPHA_VANTAGE_API_KEY: str = ""

    # ============================================================
    # CORS
    # ============================================================

    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    # ============================================================
    # PYDANTIC SETTINGS
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()