from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/entaltek_rentas"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True

    # Storage — swap provider via STORAGE_BACKEND env var
    # Options: local | s3 | r2 | supabase
    STORAGE_BACKEND: str = "local"
    STORAGE_LOCAL_DIR: str = "media"
    STORAGE_BASE_URL: str = "http://localhost:8000/media"

    # S3 / R2 / Supabase (populated when STORAGE_BACKEND != local)
    STORAGE_BUCKET: str = ""
    STORAGE_REGION: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    STORAGE_ENDPOINT_URL: str = ""  # for R2 / custom S3-compatible

    # Upload limits
    IMAGE_MAX_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    IMAGE_ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "webp"}
    IMAGES_PER_PROPERTY_MAX: int = 20


settings = Settings()
