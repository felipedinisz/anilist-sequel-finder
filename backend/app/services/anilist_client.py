"""
AniList API Client
"""
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class AniListClient:
    """Client for interacting with AniList GraphQL API"""
    
    def __init__(self, access_token: Optional[str] = None):
        self.api_url = settings.ANILIST_API_URL
        self.access_token = access_token
        
    async def _make_request(
        self, 
        query: str, 
        variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GraphQL request to AniList API
        
        Args:
            query: GraphQL query string
            variables: Query variables
            
        Returns:
            Response data
        """
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
            
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.api_url,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get authenticated user information"""
        query = """
        query {
          Viewer {
            id
            name
            avatar {
              large
            }
          }
        }
        """
        result = await self._make_request(query)
        return result["data"]["Viewer"]
    
    async def get_user_anime_list(
        self, 
        username: str, 
        status: str, 
        page: int = 1,
        per_page: int = 50
    ) -> Dict[str, Any]:
        """
        Get user's anime list
        
        Args:
            username: AniList username
            status: List status (COMPLETED, PLANNING, etc.)
            page: Page number
            per_page: Items per page
            
        Returns:
            Anime list data
        """
        query = """
        query ($username: String, $status: MediaListStatus, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              currentPage
              hasNextPage
              total
            }
            mediaList(userName: $username, type: ANIME, status: $status) {
              media {
                id
                title {
                  romaji
                  english
                }
                format
                episodes
                duration
                coverImage {
                  large
                }
                relations {
                  edges {
                    relationType
                    node {
                      id
                      title {
                        romaji
                      }
                      format
                    }
                  }
                }
              }
            }
          }
        }
        """
        variables = {
            "username": username,
            "status": status,
            "page": page,
            "perPage": per_page
        }
        return await self._make_request(query, variables)
    
    async def get_media_details(self, media_id: int) -> Dict[str, Any]:
        """Get details for a specific anime"""
        query = """
        query ($id: Int) {
          Media(id: $id) {
            id
            title {
              romaji
              english
            }
            format
            episodes
            duration
            coverImage {
              large
            }
            relations {
              edges {
                relationType
                node {
                  id
                  title {
                    romaji
                  }
                  format
                  episodes
                  duration
                }
              }
            }
          }
        }
        """
        result = await self._make_request(query, {"id": media_id})
        return result["data"]["Media"]
    
    async def add_to_list(
        self, 
        media_id: int, 
        status: str = "PLANNING"
    ) -> Dict[str, Any]:
        """Add anime to user's list"""
        mutation = """
        mutation ($mediaId: Int!, $status: MediaListStatus!) {
          SaveMediaListEntry(mediaId: $mediaId, status: $status) {
            id
            status
            media {
              id
              title {
                romaji
              }
            }
          }
        }
        """
        variables = {"mediaId": media_id, "status": status}
        return await self._make_request(mutation, variables)
