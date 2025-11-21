"""
AniList API Client
"""

import httpx
import asyncio
from typing import Dict, Any, Optional, List
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

    async def get_public_user_profile(self, username: str) -> Dict[str, Any]:
        """Get public user profile details"""
        query = """
        query ($username: String) {
          User(name: $username) {
            id
            name
            avatar {
              large
            }
            bannerImage
            statistics {
              anime {
                count
                minutesWatched
                episodesWatched
              }
            }
          }
        }
        """
        result = await self._make_request(query, {"username": username})
        return result["data"]["User"]

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
        cache_key = f"user_list_v3:{username}:{status}:{page}:{per_page}"
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
              score(format: POINT_100)
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
                      coverImage {
                        large
                      }
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

        # Cache for 5 minutes only, to ensure freshness while avoiding immediate re-fetches
        await cache.set(cache_key, result, ttl=300)

        return result

    async def get_media_details(self, media_id: int) -> Dict[str, Any]:
        """Get details for a specific anime"""
        cache_key = f"media_details_v2:{media_id}"
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
                  coverImage {
                    large
                  }
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

    async def get_media_details_batch(self, media_ids: List[int]) -> List[Dict[str, Any]]:
        """Get details for multiple anime in a single request"""
        # Check cache first
        cached_results = []
        ids_to_fetch = []
        
        for mid in media_ids:
            cache_key = f"media_details_v2:{mid}"
            cached = await cache.get(cache_key)
            if cached:
                cached_results.append(cached)
            else:
                ids_to_fetch.append(mid)
        
        if not ids_to_fetch:
            return cached_results

        # Fetch missing IDs
        query = """
        query ($ids: [Int], $page: Int) {
          Page(page: $page, perPage: 50) {
            pageInfo {
              hasNextPage
            }
            media(id_in: $ids) {
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
                    coverImage {
                      large
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        fetched_results = []
        page = 1
        
        while True:
            variables = {"ids": ids_to_fetch, "page": page}
            result = await self._make_request(query, variables)
            
            if "errors" in result:
                print(f"Error fetching batch: {result['errors']}")
                break
                
            data = result.get("data", {}).get("Page", {})
            media_list = data.get("media", [])
            fetched_results.extend(media_list)
            
            # Cache fetched items
            for media in media_list:
                cache_key = f"media_details_v2:{media['id']}"
                await cache.set(cache_key, media, ttl=86400)
            
            if not data.get("pageInfo", {}).get("hasNextPage"):
                break
            page += 1

        return cached_results + fetched_results

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
