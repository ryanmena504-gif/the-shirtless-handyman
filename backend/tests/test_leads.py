"""Tests for the new lead-gen endpoints: /api/leads and /api/leads/quick."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://design-reveal.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- /api/leads/quick ----------

class TestQuickLead:
    def test_quick_lead_minimal_valid(self, client):
        payload = {"name": "TEST_QuickLead Jane", "phone": "5045550101", "source": "hero_form"}
        r = client.post(f"{API}/leads/quick", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str)
        assert data["status"] == "new"
        assert "message" in data

    def test_quick_lead_with_all_optional_fields(self, client):
        payload = {
            "name": "TEST_QL Full",
            "phone": "5045550102",
            "email": "test_ql@example.com",
            "zip_code": "70112",
            "project_type": "Bathroom",
            "source": "exit_intent_modal",
        }
        r = client.post(f"{API}/leads/quick", json=payload)
        assert r.status_code == 200
        assert r.json()["status"] == "new"

    def test_quick_lead_empty_name_returns_400(self, client):
        r = client.post(f"{API}/leads/quick", json={"name": "", "phone": "5045550103"})
        assert r.status_code == 400
        assert "Name and phone are required" in r.json().get("detail", "")

    def test_quick_lead_empty_phone_returns_400(self, client):
        r = client.post(f"{API}/leads/quick", json={"name": "John", "phone": "  "})
        assert r.status_code == 400
        assert "Name and phone are required" in r.json().get("detail", "")

    def test_quick_lead_default_source_when_omitted(self, client):
        r = client.post(f"{API}/leads/quick", json={"name": "TEST_QL DefaultSrc", "phone": "5045550104"})
        assert r.status_code == 200


# ---------- /api/leads (full form) ----------

class TestFullLead:
    def test_full_lead_create(self, client):
        payload = {
            "name": "TEST_FullLead",
            "phone": "5045550201",
            "email": "test_fl@example.com",
            "zip_code": "70115",
            "project_type": "Kitchen",
            "project_description": "Test description",
            "selected_design_style": "Modern",
            "room_photo": "",
            "project_id": None,
            "contractor_id": None,
        }
        r = client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and data["status"] == "new" and "message" in data


# ---------- /api/health/ai regression ----------

class TestHealthAi:
    def test_health_ai_returns_ok(self, client):
        r = client.get(f"{API}/health/ai", timeout=90)
        assert r.status_code == 200
        body = r.json()
        # We only need it to return JSON with an 'ok' field. ok=True is expected since EMERGENT_LLM_KEY is set.
        assert "ok" in body
        # If env key is configured, expect ok True
        if body.get("stage") != "config":
            assert body["ok"] is True, body
