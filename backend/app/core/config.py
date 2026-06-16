"""Application configuration loaded from environment."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "SafeSquare API"
    api_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "sqlite+./sfsq.db"
    cors_origins: list[str] = ["http://localhost:3000"]

    jwt_secret: str = "devsecret-change-me"
    jwt_alg: str = "HS256"
    access_token_ttl_min: int = 30
    refresh_token_ttl_days: int = 14

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
