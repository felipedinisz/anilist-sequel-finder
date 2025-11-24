"""
Sequels API router
"""

from typing import Any, Dict
from fastapi import APIRouter, Query, HTTPException, Depends

import app.services.sequel_finder as sequel_service
from app.api.deps import get_current_user
from app.models.user import User
from app.services.anilist_client import AniListClient
from app.schemas.sequel import AddToListRequest

router = APIRouter()


@router.options("/find", include_in_schema=False)
async def options_find():
    """CORS preflight for /find"""
    return {}


@router.get("/find")
async def find_sequels(
    username: str = Query(..., description="AniList username"),
    force_refresh: bool = Query(False, description="Force refresh from AniList API")
) -> Dict[str, Any]:
    """Find missing sequels for a username"""
    try:
        result = await sequel_service.find_missing_sequels(username, force_refresh=force_refresh)
        return {
            "user": result["user"],
            "missing_sequels": result["missing_sequels"],
            "count": len(result["missing_sequels"])
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.options("/add", include_in_schema=False)
async def options_add():
    """CORS preflight for /add"""
    return {}


@router.post("/add")
async def add_to_list(
    request: AddToListRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Add anime to user's list"""
    try:
        client = AniListClient(access_token=current_user.access_token)
        result = await client.add_to_list(request.media_id, request.status)
        
        if "errors" in result:
            raise HTTPException(status_code=400, detail=result["errors"][0]["message"])
            
        # Invalidate cache for this user so subsequent searches are fresh
        await client.invalidate_user_lists(current_user.username)

        return result["data"]["SaveMediaListEntry"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
