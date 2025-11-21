"""Tests for sequels endpoint using monkeypatch to avoid external HTTP calls."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def _patch_find(monkeypatch):
    async def fake_find_missing_sequels(username: str, access_token=None):
        # return deterministic fake data
        return {
            "user": {"name": "testuser", "avatar": {"large": "url"}},
            "missing_sequels": [
                {
                    "base_id": 1,
                    "base_title": "Base Anime",
                    "missing_id": 2,
                    "missing_title": "Missing Sequel",
                    "format": "TV",
                }
            ]
        }

    monkeypatch.setattr(
        "app.services.sequel_finder.find_missing_sequels", fake_find_missing_sequels
    )
    yield


def test_find_sequels_endpoint():
    resp = client.get("/api/v1/sequels/find?username=testuser")
    assert resp.status_code == 200
    data = resp.json()
    assert "missing_sequels" in data
    assert "user" in data
    assert data["count"] == 1
    assert data["missing_sequels"][0]["missing_title"] == "Missing Sequel"


def test_find_sequels_user_not_found(monkeypatch):
    async def fake_find_missing_sequels_404(username: str, access_token=None):
        raise ValueError(f"User '{username}' not found on AniList")

    monkeypatch.setattr(
        "app.services.sequel_finder.find_missing_sequels", fake_find_missing_sequels_404
    )
    
    resp = client.get("/api/v1/sequels/find?username=nonexistent")
    assert resp.status_code == 404
    assert "User 'nonexistent' not found" in resp.json()["detail"]


def test_find_sequels_server_error(monkeypatch):
    async def fake_find_missing_sequels_500(username: str, access_token=None):
        raise Exception("Unexpected error")

    monkeypatch.setattr(
        "app.services.sequel_finder.find_missing_sequels", fake_find_missing_sequels_500
    )
    
    resp = client.get("/api/v1/sequels/find?username=testuser")
    assert resp.status_code == 500
    assert "Unexpected error" in resp.json()["detail"]
