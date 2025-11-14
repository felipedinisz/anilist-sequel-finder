"""
User model
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.sql import func

from app.db.session import Base


class User(Base):
    """User model for storing AniList user data"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    anilist_id = Column(Integer, unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    access_token = Column(Text, nullable=False)  # Encrypted in production
    refresh_token = Column(Text, nullable=True)
    
    # Settings
    settings = Column(JSON, default=dict, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_sync = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
