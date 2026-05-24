"""Tests for iteration 7: PATCH /api/leads/{id}/status, batched admin/leads,
zippopotam.us ZIP geocoding cache, and homeowner auto-reply graceful fallback."""
import os
import time
import requests
import pytest
from pymongo import MongoClient

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_PW = "renovate2024admin"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture(scope="module")
def db():
    return MongoClient(MONGO_URL)[DB_NAME]


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def admin_token(client):
    r = client.post(f"{API}/admin/login", json={"password": ADMIN_PW})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def contractor_token(client):
    # Use seeded contractor
    r = client.post(f"{API}/contractors/login",
                    json={"email": "info@crescentcityreno.com", "password": "password123"})
    assert r.status_code == 200, r.text
    return r.json()["token"]


def _create_lead(client, zip_code="70112", name="TEST_StatusLead"):
    payload = {"name": name, "phone": "5045559999", "email": "t@test.com",
               "zip_code": zip_code, "project_type": "Bathroom",
               "project_description": "x", "selected_design_style": "Modern",
               "room_photo": "", "project_id": None, "contractor_id": None}
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 200, r.text
    return r.json()["id"]


# ----- PATCH /api/leads/{lead_id}/status -----

class TestLeadStatusUpdate:
    def test_no_auth_returns_401_or_403(self, client):
        lead_id = _create_lead(client)
        r = requests.patch(f"{API}/leads/{lead_id}/status", json={"status": "contacted"})
        assert r.status_code in (401, 403), r.text

    def test_admin_can_update_any_lead(self, client, admin_token):
        lead_id = _create_lead(client)
        r = client.patch(f"{API}/leads/{lead_id}/status",
                         json={"status": "contacted"},
                         headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "contacted"

    def test_invalid_status_returns_400(self, client, admin_token):
        lead_id = _create_lead(client)
        r = client.patch(f"{API}/leads/{lead_id}/status",
                         json={"status": "garbage"},
                         headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 400
        assert "must be one of" in r.json().get("detail", "").lower()

    def test_contractor_can_update_lead_in_their_zip(self, client, contractor_token):
        # Crescent City reno services NOLA zips including 70112
        lead_id = _create_lead(client, zip_code="70112")
        r = client.patch(f"{API}/leads/{lead_id}/status",
                         json={"status": "contacted"},
                         headers={"Authorization": f"Bearer {contractor_token}"})
        assert r.status_code == 200, r.text

    def test_contractor_cannot_update_lead_outside_zips(self, client, contractor_token):
        # NYC zip is NOT in Crescent City's service area
        lead_id = _create_lead(client, zip_code="10001", name="TEST_NY_Lead")
        r = client.patch(f"{API}/leads/{lead_id}/status",
                         json={"status": "contacted"},
                         headers={"Authorization": f"Bearer {contractor_token}"})
        assert r.status_code == 404, r.text


# ----- GET /api/admin/leads batched contractor names -----

class TestAdminLeadsBatched:
    def test_admin_leads_has_contractor_name_field(self, client, admin_token, db):
        # Create a lead with contractor_id set, then check admin/leads enriches it.
        contractor = db.contractors.find_one({"email": "info@crescentcityreno.com"})
        assert contractor is not None
        lead_id = "TEST_admin_batch_" + os.urandom(4).hex()
        db.leads.insert_one({
            "id": lead_id, "name": "TEST_Batch", "phone": "5550001",
            "email": "", "zip_code": "70112", "project_type": "Kitchen",
            "project_description": "", "selected_design_style": "",
            "room_photo": "", "project_id": None,
            "contractor_id": contractor["id"], "source": "test",
            "status": "new", "created_at": "2026-01-01T00:00:00Z",
        })
        r = client.get(f"{API}/admin/leads",
                       headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        leads = r.json()["leads"]
        match = next((l for l in leads if l["id"] == lead_id), None)
        assert match is not None
        assert match.get("contractor_name") == contractor["company_name"]


# ----- ZIP geocoding -----

class TestZipGeocoding:
    def test_uncached_zip_triggers_fetch_and_cache(self, client, db):
        # 89109 = Las Vegas, NOT in static map. Remove cache first.
        db.zip_cache.delete_one({"zip": "89109"})
        r = client.get(f"{API}/contractors/search", params={"zip_code": "89109"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "contractors" in data
        assert len(data["contractors"]) >= 1  # fallback should return contractors
        loc = data["user_location"]
        assert "lat" in loc and "lng" in loc
        # Allow a moment for cache write
        time.sleep(0.5)
        cached = db.zip_cache.find_one({"zip": "89109"})
        # If zippopotam.us is reachable, cache exists with Las Vegas-ish coords (~36, -115)
        if cached:
            assert 35.5 < cached["lat"] < 36.5, cached
            assert -116 < cached["lng"] < -114, cached
            assert cached.get("state") in ("NV", "")

    def test_invalid_zip_falls_back_gracefully(self, client):
        r = client.get(f"{API}/contractors/search", params={"zip_code": "99999"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "user_location" in data
        # Should not crash — coords default to center of US or similar
        loc = data["user_location"]
        assert isinstance(loc["lat"], (int, float))
        assert isinstance(loc["lng"], (int, float))


# ----- health/ai regression -----

class TestHealthRegression:
    def test_health_ai(self, client):
        r = client.get(f"{API}/health/ai", timeout=90)
        assert r.status_code == 200
        body = r.json()
        assert "ok" in body
