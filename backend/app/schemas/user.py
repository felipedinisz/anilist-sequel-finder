"""
User schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user schema"""
    anilist_id: int
    username: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    access_token: str
    refresh_token: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    settings: Optional[dict] = None


class UserInDB(UserBase):
    """User schema as stored in database"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_sync: Optional[datetime] = None
    settings: dict = Field(default_factory=dict)
    
    class Config:
        from_attributes = True


class User(UserInDB):
    """User schema for API responses (without sensitive data)"""
    pass


class UserWithToken(User):
    """User schema with JWT token"""
    token: str
    token_type: str = "bearer"
