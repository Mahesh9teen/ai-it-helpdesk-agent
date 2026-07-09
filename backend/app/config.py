"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the backend service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="AI IT Helpdesk Agent", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    app_env: str = Field(default="development", alias="APP_ENV")
    ollama_host: str = Field(default="http://ollama:11434", alias="OLLAMA_HOST")
    ollama_model_name: str = Field(default="llama3.2", alias="OLLAMA_MODEL_NAME")
    ollama_embedding_model: str = Field(default="nomic-embed-text", alias="OLLAMA_EMBEDDING_MODEL")
    faiss_index_path: str = Field(default="/app/data/faiss_index", alias="FAISS_INDEX_PATH")
    database_url: str = Field(
        default="postgresql+asyncpg://helpdesk:helpdesk@postgres:5432/helpdesk",
        alias="DATABASE_URL",
    )
    jwt_secret: str = Field(default="replace-me", alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=60, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="CORS_ORIGINS",
    )
    identity_provider: str = Field(default="mock", alias="IDENTITY_PROVIDER")
    azuread_enabled: bool = Field(default=False, alias="AZUREAD_ENABLED")
    azuread_tenant_id: str | None = Field(default=None, alias="AZUREAD_TENANT_ID")
    azuread_client_id: str | None = Field(default=None, alias="AZUREAD_CLIENT_ID")
    azuread_client_secret: str | None = Field(default=None, alias="AZUREAD_CLIENT_SECRET")
    azuread_graph_scope: str = Field(default="https://graph.microsoft.com/.default", alias="AZUREAD_GRAPH_SCOPE")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings so modules can import configuration cheaply."""

    return Settings()
