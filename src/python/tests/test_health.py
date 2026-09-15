"""Basic health check tests for the Python analytics service."""

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_check():
    """Test that the health endpoint returns 200 and expected payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "supplyguard-python-analytics"
