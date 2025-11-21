import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.anilist_client import AniListClient
import httpx

@pytest.mark.asyncio
async def test_make_request_success():
    with patch("httpx.AsyncClient") as MockClient:
        mock_client_instance = MockClient.return_value
        mock_client_instance.__aenter__.return_value = mock_client_instance
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": "success"}
        mock_client_instance.post = AsyncMock(return_value=mock_response)

        client = AniListClient()
        result = await client._make_request("query")
        assert result == {"data": "success"}

@pytest.mark.asyncio
async def test_make_request_rate_limit_retry():
    with patch("httpx.AsyncClient") as MockClient:
        mock_client_instance = MockClient.return_value
        mock_client_instance.__aenter__.return_value = mock_client_instance
        
        # First response 429, second 200
        mock_response_429 = MagicMock()
        mock_response_429.status_code = 429
        mock_response_429.headers = {"Retry-After": "1"}
        
        mock_response_200 = MagicMock()
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {"data": "success"}
        
        mock_client_instance.post = AsyncMock(side_effect=[mock_response_429, mock_response_200])

        client = AniListClient()
        
        # Mock asyncio.sleep to avoid waiting
        with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            result = await client._make_request("query")
            assert result == {"data": "success"}
            assert mock_client_instance.post.call_count == 2
            mock_sleep.assert_called_with(1)

@pytest.mark.asyncio
async def test_get_public_user_profile():
    with patch("app.services.anilist_client.AniListClient._make_request") as mock_request:
        mock_request.return_value = {
            "data": {
                "User": {
                    "id": 1,
                    "name": "testuser"
                }
            }
        }
        
        client = AniListClient()
        result = await client.get_public_user_profile("testuser")
        assert result["name"] == "testuser"
        mock_request.assert_called_once()

@pytest.mark.asyncio
async def test_get_media_details_batch_caching():
    # Test that cached items are returned and not fetched
    with patch("app.core.cache.cache.get", new_callable=AsyncMock) as mock_cache_get:
        # Mock cache hit for ID 1, miss for ID 2
        async def cache_side_effect(key):
            if "media_details_v3:1" in key:
                return {"id": 1, "title": "Anime 1"}
            return None
        mock_cache_get.side_effect = cache_side_effect
        
        with patch("app.services.anilist_client.AniListClient._make_request") as mock_request:
            mock_request.return_value = {
                "data": {
                    "Page": {
                        "pageInfo": {"hasNextPage": False},
                        "media": [{"id": 2, "title": "Anime 2"}]
                    }
                }
            }
            
            with patch("app.core.cache.cache.set", new_callable=AsyncMock) as mock_cache_set:
                client = AniListClient()
                results = await client.get_media_details_batch([1, 2])
                
                assert len(results) == 2
                ids = {r["id"] for r in results}
                assert 1 in ids
                assert 2 in ids
                
                # Should have requested only ID 2
                call_args = mock_request.call_args
                assert call_args is not None
                variables = call_args[0][1] # Second arg is variables
                assert variables["ids"] == [2]
