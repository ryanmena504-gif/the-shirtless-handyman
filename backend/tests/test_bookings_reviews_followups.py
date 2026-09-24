"""
Tests for new features (iteration 10):
- POST /api/bookings (chat booking flow)
- GET  /api/google-reviews (graceful degrade when no API key)
- GET  /api/followups/unsubscribe/{token}
- POST /api/leads/quick -> schedules 3 followups in db.lead_followups
- Unsubscribe flow skips future followups for the same email
"""
import os
import time
import uuid
import requests
import pytest
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Read from frontend/.env directly as a fallback (test env)
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"
with open("/app/backend/.env") as f:
    for line in f:
        if line.startswith("MONGO_URL="):
            MONGO_URL = line.split("=", 1)[1].strip().strip('"')
        elif line.startswith("DB_NAME="):
            DB_NAME = line.split("=", 1)[1].strip().strip('"')


@pytest.fixture(scope="module")
def db():
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]


@pytest.fixture
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- /api/bookings ----------

class TestBookings:
    def test_create_booking_success(self, session, db):
        payload = {
            "name": "TEST_Booker One",
            "phone": "555-000-1111",
            "email": "test_booker1@example.com",
            "preferred_date": "2026-03-15",
            "preferred_time": "morning",
            "project_type": "Bathroom microcement",
            "notes": "TEST run",
        }
        r = session.post(f"{BASE_URL}/api/bookings", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body and isinstance(body["id"], str)
        assert body["status"] == "confirmed"

        # Verify booking persisted
        booking = db.bookings.find_one({"id": body["id"]})
        assert booking is not None
        assert booking["name"] == "TEST_Booker One"
        assert booking["preferred_date"] == "2026-03-15"
        assert booking["preferred_time"] == "morning"

        # Verify lead created with source='chat_booking'
        lead = db.leads.find_one({"booking_id": body["id"]})
        assert lead is not None, "Lead row not created for booking"
        assert lead["source"] == "chat_booking"
        assert lead["name"] == "TEST_Booker One"

    def test_create_booking_missing_required(self, session):
        # Missing phone, date, time
        payload = {"name": "TEST_Missing", "phone": "", "preferred_date": "", "preferred_time": ""}
        r = session.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
        assert r.status_code == 400
        body = r.json()
        detail = body.get("detail", "")
        assert "Name, phone, date, and time are required" in detail


# ---------- /api/google-reviews ----------

class TestGoogleReviews:
    def test_graceful_degrade_no_api_key(self, session):
        r = session.get(f"{BASE_URL}/api/google-reviews", timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "place_id" in body
        assert "reviews" in body
        assert body["reviews"] == []
        assert body["rating"] is None
        assert "review_count" in body


# ---------- /api/followups/unsubscribe/{token} ----------

class TestUnsubscribeInvalid:
    def test_invalid_token_returns_404_html(self, session):
        r = session.get(f"{BASE_URL}/api/followups/unsubscribe/invalid-token-xyz", timeout=15)
        assert r.status_code == 404
        assert "Link not found" in r.text


# ---------- /api/leads/quick + followup scheduling + unsubscribe flow ----------

class TestLeadsQuickAndFollowups:
    def test_quick_lead_schedules_three_followups(self, session, db):
        unique_email = f"test_quick_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "TEST_QuickLead",
            "email": unique_email,
            "phone": "555-222-3333",
            "zip_code": "70115",
            "project_type": "Microcement floor",
        }
        r = session.post(f"{BASE_URL}/api/leads/quick", json=payload, timeout=20)
        assert r.status_code in (200, 201), r.text

        # schedule_followups is fired as asyncio.create_task — give it a moment
        time.sleep(1.5)

        rows = list(db.lead_followups.find({"email": unique_email}).sort("step", 1))
        assert len(rows) == 3, f"Expected 3 followups, got {len(rows)}: {rows}"
        statuses = {row["status"] for row in rows}
        assert statuses == {"pending"}, f"All should be pending, got {statuses}"

        # Verify staggered send_at (+24h, +72h, +120h roughly)
        send_ats = sorted(r["send_at"] for r in rows)
        diffs_hours = [(send_ats[i+1] - send_ats[i]).total_seconds() / 3600 for i in range(2)]
        # gaps should be ~48h then ~48h (72-24=48, 120-72=48)
        assert 47 < diffs_hours[0] < 49, f"first gap {diffs_hours[0]}"
        assert 47 < diffs_hours[1] < 49, f"second gap {diffs_hours[1]}"

        # Each row has an unsub_token
        for row in rows:
            assert row.get("unsub_token")

        return unique_email, rows

    def test_unsubscribe_flow_marks_skipped_and_blocks_new_lead(self, session, db):
        # Step 1: create a lead with email
        unique_email = f"test_unsub_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "TEST_Unsub",
            "email": unique_email,
            "phone": "555-444-5555",
            "zip_code": "70115",
            "project_type": "Microcement floor",
        }
        r = session.post(f"{BASE_URL}/api/leads/quick", json=payload, timeout=20)
        assert r.status_code in (200, 201)
        time.sleep(1.5)

        rows = list(db.lead_followups.find({"email": unique_email}))
        assert len(rows) == 3
        token = rows[0]["unsub_token"]

        # Step 2: hit unsubscribe URL with a real token
        r2 = session.get(f"{BASE_URL}/api/followups/unsubscribe/{token}", timeout=15)
        assert r2.status_code == 200, r2.text
        assert "unsubscribed" in r2.text.lower()

        # Step 3: verify unsubscribe row + remaining followups marked skipped
        assert db.lead_unsubscribes.find_one({"email": unique_email}) is not None
        remaining = list(db.lead_followups.find({"email": unique_email}))
        statuses = {row["status"] for row in remaining}
        # All previously-pending rows now skipped_unsubscribed
        assert statuses == {"skipped_unsubscribed"}, f"Got statuses: {statuses}"

        # Step 4: a NEW lead with the same email should not schedule any new followups
        r3 = session.post(f"{BASE_URL}/api/leads/quick", json=payload, timeout=20)
        assert r3.status_code in (200, 201)
        time.sleep(1.5)

        new_rows = list(db.lead_followups.find({"email": unique_email}))
        # Should still only be the original 3 (now skipped); no new pending rows added
        assert len(new_rows) == 3, f"Unsubscribed email should not get new followups; got {len(new_rows)}"


# ---------- Frontend route smoke tests ----------

class TestFrontendRoutes:
    """These hit the public frontend URL. Just verify pages return 200."""

    def test_local_service_page_loads(self, session):
        # Frontend is SPA — index.html returns 200 regardless of route
        r = requests.get(f"{BASE_URL}/microcement-installers-new-orleans", timeout=15)
        assert r.status_code == 200

    def test_blog_post_route_loads(self):
        r = requests.get(f"{BASE_URL}/blog/how-to-choose-microcement-installer-new-orleans", timeout=15)
        assert r.status_code == 200
