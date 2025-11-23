"""
Authentication routes
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import UserWithToken, TokenVerificationRequest
from app.services.anilist_client import AniListClient

router = APIRouter()


@router.get("/login")
async def login():
    """
    Initiate AniList OAuth login (Implicit Grant)

    Redirects user to AniList authorization page
    """
    # For Implicit Grant, we redirect to frontend callback
    redirect_uri = f"{settings.FRONTEND_URL}/auth/callback"
    
    auth_url = (
        f"{settings.ANILIST_AUTH_URL}"
        f"?client_id={settings.ANILIST_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=token"
    )
    return RedirectResponse(url=auth_url)


@router.post("/verify-token", response_model=UserWithToken)
async def verify_token(request: TokenVerificationRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify AniList access token and create/update user session
    """
    access_token = request.access_token

    # Get user info from AniList to validate token
    try:
        anilist_client = AniListClient(access_token)
        user_info = await anilist_client.get_user_info()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid AniList token",
        )

    # Check if user exists in database
    from sqlalchemy import select

    result = await db.execute(
        select(UserModel).where(UserModel.anilist_id == user_info["id"])
    )
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = UserModel(
            anilist_id=user_info["id"],
            username=user_info["name"],
            avatar_url=(
                user_info["avatar"]["large"] if user_info.get("avatar") else None
            ),
            access_token=access_token,
            settings={},
        )
        db.add(user)
    else:
        # Update existing user
        user.access_token = access_token
        user.username = user_info["name"]
        user.avatar_url = user_info["avatar"]["large"] if user_info.get("avatar") else None  # type: ignore

    await db.commit()
    await db.refresh(user)

    # Create JWT token
    jwt_token = create_access_token(
        data={
            "sub": str(user.id),
            "anilist_id": user.anilist_id,
            "username": user.username,
        }
    )

    return {
        **user.__dict__,
        "token": jwt_token,
        "token_type": "bearer"
    }


@router.get("/callback")
async def auth_callback(code: str, db: AsyncSession = Depends(get_db)):
    """
    Handle OAuth callback from AniList

    Args:
        code: Authorization code from AniList
        db: Database session

    Returns:
        User data with JWT token
    """
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            settings.ANILIST_TOKEN_URL,
            json={
                "client_id": settings.ANILIST_CLIENT_ID,
                "client_secret": settings.ANILIST_CLIENT_SECRET,
                "redirect_uri": settings.ANILIST_REDIRECT_URI,
                "code": code,
                "grant_type": "authorization_code",
            },
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code",
            )

        token_data = token_response.json()
        access_token = token_data["access_token"]

    # Get user info from AniList
    anilist_client = AniListClient(access_token)
    user_info = await anilist_client.get_user_info()

    # Check if user exists in database
    from sqlalchemy import select

    result = await db.execute(
        select(UserModel).where(UserModel.anilist_id == user_info["id"])
    )
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = UserModel(
            anilist_id=user_info["id"],
            username=user_info["name"],
            avatar_url=(
                user_info["avatar"]["large"] if user_info.get("avatar") else None
            ),
            access_token=access_token,
            settings={},
        )
        db.add(user)
    else:
        # Update existing user
        user.access_token = access_token
        user.username = user_info["name"]
        user.avatar_url = user_info["avatar"]["large"] if user_info.get("avatar") else None  # type: ignore

    await db.commit()
    await db.refresh(user)

    # Create JWT token
    jwt_token = create_access_token(
        data={
            "sub": str(user.id),
            "anilist_id": user.anilist_id,
            "username": user.username,
        }
    )

    # Redirect to frontend with token
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}"
    )


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}
