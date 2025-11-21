"""Basic tests for FastAPI application root and health endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

# Ignore Python 3.14 deprecation warnings from dependencies
pytestmark = pytest.mark.filterwarnings("ignore::DeprecationWarning")

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"].startswith("Welcome")
    assert data["docs"] == "/docs"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy"}
