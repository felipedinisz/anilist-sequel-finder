"""
Core configuration using Pydantic Settings
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "AniList Sequel Finder"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str
    API_V1_PREFIX: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str
    
    # AniList OAuth
    ANILIST_CLIENT_ID: str
    ANILIST_CLIENT_SECRET: str
    ANILIST_REDIRECT_URI: str
    ANILIST_AUTH_URL: str = "https://anilist.co/api/v2/oauth/authorize"
    ANILIST_TOKEN_URL: str = "https://anilist.co/api/v2/oauth/token"
    ANILIST_API_URL: str = "https://graphql.anilist.co"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Cache
    CACHE_DIR: str = ".cache"
    CACHE_TTL: int = 86400  # 24 hours
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Redis (Optional)
    REDIS_URL: str | None = None
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
