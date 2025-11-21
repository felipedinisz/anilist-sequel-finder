"""
AniList API Client
"""

import httpx
import asyncio
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.cache import cache


class AniListClient:
    """Client for interacting with AniList GraphQL API"""

    def __init__(self, access_token: Optional[str] = None):
        self.api_url = settings.ANILIST_API_URL
        self.access_token = access_token

    async def _make_request(
        self, query: str, variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a GraphQL request to AniList API with Rate Limit handling

        Args:
            query: GraphQL query string
            variables: Query variables

        Returns:
            Response data
        """
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        max_retries = 5
        base_delay = 2.0

        async with httpx.AsyncClient() as client:
            for attempt in range(max_retries):
                try:
                    response = await client.post(
                        self.api_url,
                        json={"query": query, "variables": variables},
                        headers=headers,
                        timeout=30.0,
                    )

                    if response.status_code == 429:
                        retry_after = int(
                            response.headers.get(
                                "Retry-After", base_delay * (2**attempt)
                            )
                        )
                        print(f"⚠️ Rate limit hit (429). Retrying in {retry_after}s...")
                        await asyncio.sleep(retry_after)
                        continue

                    response.raise_for_status()
                    return response.json()

                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        # Should be handled above, but just in case
                        retry_after = base_delay * (2**attempt)
                        print(f"⚠️ Rate limit hit (429). Retrying in {retry_after}s...")
                        await asyncio.sleep(retry_after)
                        continue
                    raise e
                except (httpx.RequestError, httpx.TimeoutException) as e:
                    if attempt == max_retries - 1:
                        raise e
                    wait_time = base_delay * (2**attempt)
                    print(f"⚠️ Network error: {e}. Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)

            raise Exception("Max retries exceeded")

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
        self, username: str, status: str, page: int = 1, per_page: int = 50
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
        cache_key = f"user_list:{username}:{status}:{page}:{per_page}"
        cached_data = await cache.get(cache_key)
        if cached_data:
            return cached_data

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
            "perPage": per_page,
        }
        result = await self._make_request(query, variables)

        # Cache for 30 minutes
        await cache.set(cache_key, result, ttl=1800)

        return result

    async def get_media_details(self, media_id: int) -> Dict[str, Any]:
        """Get details for a specific anime"""
        cache_key = f"media_details:{media_id}"
        cached_data = await cache.get(cache_key)
        if cached_data:
            return cached_data

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
        data = result["data"]["Media"]

        # Cache for 24 hours
        await cache.set(cache_key, data, ttl=86400)

        return data

    async def add_to_list(
        self, media_id: int, status: str = "PLANNING"
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
