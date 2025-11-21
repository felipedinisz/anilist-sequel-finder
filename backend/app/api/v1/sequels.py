"""
Sequels API router
"""

from typing import Any, Dict
from fastapi import APIRouter, Query

import app.services.sequel_finder as sequel_service

router = APIRouter()


@router.get("/find")
async def find_sequels(
    username: str = Query(..., description="AniList username")
) -> Dict[str, Any]:
    """Find missing sequels for a username"""
    missing = await sequel_service.find_missing_sequels(username)
    return {"missing_sequels": missing, "count": len(missing)}
