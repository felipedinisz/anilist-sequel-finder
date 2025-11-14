"""
Initialize database with tables
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import engine, Base
from app.models import User  # Import all models


async def init_db():
    """Create all database tables"""
    async with engine.begin() as conn:
        # Drop all tables (for development)
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database initialized successfully!")


if __name__ == "__main__":
    asyncio.run(init_db())
