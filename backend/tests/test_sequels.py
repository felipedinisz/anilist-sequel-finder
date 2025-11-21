"""Tests for sequels endpoint using monkeypatch to avoid external HTTP calls."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def _patch_find(monkeypatch):
    async def fake_find_missing_sequels(username: str, access_token=None):
        # return deterministic fake data
        return [
            {
                "base_id": 1,
                "base_title": "Base Anime",
                "missing_id": 2,
                "missing_title": "Missing Sequel",
                "format": "TV",
            }
        ]

    monkeypatch.setattr(
        "app.services.sequel_finder.find_missing_sequels", fake_find_missing_sequels
    )
    yield


def test_find_sequels_endpoint():
    resp = client.get("/api/v1/sequels/find?username=testuser")
    assert resp.status_code == 200
    data = resp.json()
    assert "missing_sequels" in data
    assert data["count"] == 1
    assert data["missing_sequels"][0]["missing_title"] == "Missing Sequel"
