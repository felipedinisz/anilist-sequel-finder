import pytest
from unittest.mock import AsyncMock, patch
from app.services.sequel_finder import find_missing_sequels


@pytest.mark.asyncio
async def test_find_missing_sequels_logic():
    # Mock data
    username = "testuser"

    # Anime 1: Completed, has sequel Anime 2
    anime1 = {
        "id": 1,
        "title": {"romaji": "Anime 1"},
        "relations": {
            "edges": [
                {
                    "relationType": "SEQUEL",
                    "node": {"id": 2, "title": {"romaji": "Anime 2"}, "format": "TV"},
                }
            ]
        },
    }

    # Anime 3: Completed, has sequel Anime 4
    anime3 = {
        "id": 3,
        "title": {"romaji": "Anime 3"},
        "relations": {
            "edges": [
                {
                    "relationType": "SEQUEL",
                    "node": {"id": 4, "title": {"romaji": "Anime 4"}, "format": "TV"},
                }
            ]
        },
    }

    # Mock responses
    # First call is for COMPLETED
    # Second call is for PLANNING

    # Scenario:
    # User completed Anime 1 and Anime 3.
    # User plans Anime 4.
    # Missing: Anime 2.

    mock_completed_response = {
        "data": {
            "Page": {
                "pageInfo": {"hasNextPage": False},
                "mediaList": [{"media": anime1}, {"media": anime3}],
            }
        }
    }

    mock_planning_response = {
        "data": {
            "Page": {
                "pageInfo": {"hasNextPage": False},
                "mediaList": [{"media": {"id": 4}}],  # Anime 4 is in planning
            }
        }
    }

    with patch("app.services.sequel_finder.AniListClient") as MockClient:
        mock_instance = MockClient.return_value

        # Setup side_effect for get_user_anime_list
        async def side_effect(user, status, page=1, per_page=50):
            if status == "COMPLETED":
                return mock_completed_response
            elif status == "PLANNING":
                return mock_planning_response
            # Return empty list for other statuses (CURRENT, PAUSED, DROPPED)
            return {
                "data": {
                    "Page": {
                        "pageInfo": {"hasNextPage": False},
                        "mediaList": [],
                    }
                }
            }

        mock_instance.get_user_anime_list = AsyncMock(side_effect=side_effect)

        results = await find_missing_sequels(username)

        assert len(results) == 1
        assert results[0]["base_id"] == 1
        assert results[0]["missing_id"] == 2
        assert results[0]["missing_title"] == "Anime 2"


@pytest.mark.asyncio
async def test_find_missing_sequels_pagination():
    # Test pagination logic
    username = "testuser"

    # Page 1: Anime 1 (Completed)
    anime1 = {"id": 1, "title": {"romaji": "Anime 1"}, "relations": {"edges": []}}

    mock_page1 = {
        "data": {
            "Page": {
                "pageInfo": {"hasNextPage": True},
                "mediaList": [{"media": anime1}],
            }
        }
    }

    # Page 2: Anime 2 (Completed)
    anime2 = {"id": 2, "title": {"romaji": "Anime 2"}, "relations": {"edges": []}}

    mock_page2 = {
        "data": {
            "Page": {
                "pageInfo": {"hasNextPage": False},
                "mediaList": [{"media": anime2}],
            }
        }
    }

    mock_planning = {
        "data": {"Page": {"pageInfo": {"hasNextPage": False}, "mediaList": []}}
    }

    with patch("app.services.sequel_finder.AniListClient") as MockClient:
        mock_instance = MockClient.return_value

        async def side_effect(user, status, page=1, per_page=50):
            if status == "COMPLETED":
                if page == 1:
                    return mock_page1
                elif page == 2:
                    return mock_page2
            elif status == "PLANNING":
                return mock_planning
            # Return empty list for other statuses
            return {
                "data": {
                    "Page": {
                        "pageInfo": {"hasNextPage": False},
                        "mediaList": [],
                    }
                }
            }

        mock_instance.get_user_anime_list = AsyncMock(side_effect=side_effect)

        results = await find_missing_sequels(username)

        # We just want to verify that it fetched both pages of completed anime
        # Since there are no sequels, results should be empty, but we can check call count
        assert len(results) == 0

        # Verify calls
        # Should call COMPLETED page 1, COMPLETED page 2, PLANNING page 1
        calls = mock_instance.get_user_anime_list.call_args_list

        # Filter calls by status
        completed_calls = [c for c in calls if c[0][1] == "COMPLETED"]
        assert len(completed_calls) == 2
        assert completed_calls[0].kwargs.get("page") == 1 or completed_calls[0][2] == 1
        assert completed_calls[1].kwargs.get("page") == 2 or completed_calls[1][2] == 2


@pytest.mark.asyncio
async def test_find_missing_sequels_deep_search():
    # Test deep search logic (A -> B -> C)
    username = "testuser"

    # Anime A: Completed, has sequel Anime B
    anime_a = {
        "id": 1,
        "title": {"romaji": "Anime A"},
        "relations": {
            "edges": [
                {
                    "relationType": "SEQUEL",
                    "node": {"id": 2, "title": {"romaji": "Anime B"}, "format": "TV"},
                }
            ]
        },
    }

    # Anime B: Missing, has sequel Anime C
    anime_b_details = {
        "id": 2,
        "title": {"romaji": "Anime B"},
        "relations": {
            "edges": [
                {
                    "relationType": "SEQUEL",
                    "node": {"id": 3, "title": {"romaji": "Anime C"}, "format": "TV"},
                }
            ]
        },
    }

    # Anime C: Missing, no sequels
    anime_c_details = {
        "id": 3,
        "title": {"romaji": "Anime C"},
        "relations": {"edges": []},
    }

    mock_completed = {
        "data": {
            "Page": {
                "pageInfo": {"hasNextPage": False},
                "mediaList": [{"media": anime_a}],
            }
        }
    }

    mock_planning = {
        "data": {"Page": {"pageInfo": {"hasNextPage": False}, "mediaList": []}}
    }

    with patch("app.services.sequel_finder.AniListClient") as MockClient:
        mock_instance = MockClient.return_value

        # Mock get_user_anime_list
        async def list_side_effect(user, status, page=1, per_page=50):
            if status == "COMPLETED":
                return mock_completed
            elif status == "PLANNING":
                return mock_planning
            # Return empty list for other statuses
            return {
                "data": {
                    "Page": {
                        "pageInfo": {"hasNextPage": False},
                        "mediaList": [],
                    }
                }
            }

        mock_instance.get_user_anime_list = AsyncMock(side_effect=list_side_effect)

        # Mock get_media_details
        async def details_side_effect(media_id):
            if media_id == 2:
                return anime_b_details
            elif media_id == 3:
                return anime_c_details
            return {}

        mock_instance.get_media_details = AsyncMock(side_effect=details_side_effect)

        results = await find_missing_sequels(username)

        # Should find B (from A) and C (from B)
        assert len(results) == 2

        # Check first result (Anime B)
        res_b = next(r for r in results if r["missing_id"] == 2)
        assert res_b["base_id"] == 1
        assert res_b["missing_title"] == "Anime B"

        # Check second result (Anime C)
        res_c = next(r for r in results if r["missing_id"] == 3)
        assert res_c["base_id"] == 2
        assert res_c["missing_title"] == "Anime C"
