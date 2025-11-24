"""
Core configuration using Pydantic Settings
"""

import json
import os
from typing import Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    # App
    APP_NAME: str = "AniList Sequel Finder"
    APP_ENV: str = "development"
    DEBUG: bool = False  # Safer default for production
    SECRET_KEY: str
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"

    # AniList OAuth
    ANILIST_CLIENT_ID: str
    ANILIST_CLIENT_SECRET: str = ""  # Optional for Implicit Grant flow
    ANILIST_REDIRECT_URI: str = "http://localhost:5173/auth/callback"  # Default for dev
    ANILIST_AUTH_URL: str = "https://anilist.co/api/v2/oauth/authorize"
    ANILIST_TOKEN_URL: str = "https://anilist.co/api/v2/oauth/token"
    ANILIST_API_URL: str = "https://graphql.anilist.co"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS - stored as string by default, parsed to list after initialization
    CORS_ORIGINS: Any = "http://localhost:3000,http://localhost:8000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:8000,http://127.0.0.1:5173"

    # Cache
    CACHE_DIR: str = ".cache"
    CACHE_TTL: int = 86400  # 24 hours

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Redis (Optional)
    REDIS_URL: str | None = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    @field_validator("CORS_ORIGINS", mode="wrap")
    @classmethod
    def parse_cors_origins(cls, v, handler):
        """Parse CORS_ORIGINS from string to list"""
        try:
            # Call the default validator
            result = handler(v)
        except Exception:
            # If default validation fails, use v as-is
            result = v
        
        # Now parse the result
        if isinstance(result, str):
            cors_str = result.strip()
            # Try to parse as JSON array first
            if cors_str.startswith("["):
                try:
                    parsed = json.loads(cors_str)
                    if isinstance(parsed, list):
                        return parsed
                except (json.JSONDecodeError, TypeError, ValueError):
                    pass
            # Parse as comma-separated
            return [origin.strip() for origin in cors_str.split(",") if origin.strip()]
        elif isinstance(result, list):
            # Already a list, ensure all items are strings
            return [str(origin) for origin in result]
        else:
            # Fallback: convert to list with single item
            return [str(result)]


# Load CORS_ORIGINS from environment if set, otherwise use default
_cors_env = os.getenv("CORS_ORIGINS")
if _cors_env:
    # Parse it immediately to avoid Pydantic issues
    if _cors_env.strip().startswith("["):
        try:
            _cors_list = json.loads(_cors_env.strip())
        except (json.JSONDecodeError, TypeError, ValueError):
            _cors_list = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]
    else:
        _cors_list = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]
    
    # Temporarily remove it from environment so Settings doesn't try to parse it
    os.environ.pop("CORS_ORIGINS", None)


# Global settings instance
try:
    settings = Settings()
    # If we pre-parsed CORS_ORIGINS, use it
    if _cors_env:
        settings.CORS_ORIGINS = _cors_list
except Exception as e:
    print(f"Warning: Failed to load settings: {e}")
    import traceback
    traceback.print_exc()
    # Create a minimal settings object
    settings = Settings(
        SECRET_KEY="dev-key",
        ANILIST_CLIENT_ID="dev-id",
        JWT_SECRET_KEY="dev-key",
    )

# Ensure CORS_ORIGINS is always a list
if not isinstance(settings.CORS_ORIGINS, list):
    print(f"WARNING: CORS_ORIGINS is not a list! Type: {type(settings.CORS_ORIGINS)}, Value: {settings.CORS_ORIGINS}")
    if isinstance(settings.CORS_ORIGINS, str):
        settings.CORS_ORIGINS = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
    else:
        settings.CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8000"]

print(f"✓ CORS_ORIGINS configured: {settings.CORS_ORIGINS}")
