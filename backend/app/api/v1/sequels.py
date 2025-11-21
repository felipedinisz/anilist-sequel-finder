"""
Sequels API router
"""

from typing import Any, Dict
from fastapi import APIRouter, Query, HTTPException

import app.services.sequel_finder as sequel_service

router = APIRouter()


@router.get("/find")
async def find_sequels(
    username: str = Query(..., description="AniList username")
) -> Dict[str, Any]:
    """Find missing sequels for a username"""
    try:
        result = await sequel_service.find_missing_sequels(username)
        return {
            "user": result["user"],
            "missing_sequels": result["missing_sequels"],
            "count": len(result["missing_sequels"])
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
