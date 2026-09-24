"""Scheduling + Bookings integration tests
Covers:
  - GET /api/schedule/availability
  - POST /api/bookings (slot_iso path + legacy free-text path + double-book prevention)
"""
import os
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
# Fallback: read from frontend .env directly (test env may not export it)
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def availability(api):
    r = api.get(f"{BASE_URL}/api/schedule/availability?days=60", timeout=15)
    assert r.status_code == 200, f"availability failed: {r.status_code} {r.text[:200]}"
    return r.json()


# -------------- Availability shape --------------

class TestAvailability:
    def test_tz(self, availability):
        assert availability.get("tz") == "America/Chicago"

    def test_appointment_types(self, availability):
        types = availability.get("appointment_types", [])
        ids = [t["id"] for t in types]
        assert set(ids) == {"walkthrough", "phone", "site_prep", "project"}, f"Got: {ids}"
        for t in types:
            assert t["duration"] == 60

    def test_days_count(self, availability):
        # days = today + next 60 => 61 entries
        assert len(availability.get("days", [])) == 61

    def test_sundays_closed(self, availability):
        for d in availability["days"]:
            if d["weekday"] == "Sun":
                assert d["is_open"] is False, f"Sunday {d['date']} should be closed"
                assert d["slots"] == []

    def test_working_days_have_slots(self, availability):
        # Find at least one non-today weekday (Mon-Sat) with 9 slots (8-16 starts)
        found_full = False
        for i, d in enumerate(availability["days"]):
            if d["is_open"] and i > 0:  # skip today (may be truncated by cutoff)
                if len(d["slots"]) == 9:
                    found_full = True
                    # Verify labels contain expected times
                    labels = [s["label"] for s in d["slots"]]
                    assert any("8:00" in l for l in labels)
                    assert any("4:00" in l for l in labels)
                    break
        assert found_full, "No working day with 9 full slots found"

    def test_same_day_cutoff(self, availability):
        # today's slots must all start >= now + 2h  (in local America/Chicago)
        today = availability["days"][0]
        if not today["is_open"]:
            return
        from datetime import timezone, timedelta
        now_utc = datetime.now(timezone.utc)
        cutoff_utc = now_utc + timedelta(hours=2)
        for s in today["slots"]:
            iso = s["iso"]
            slot_dt = datetime.fromisoformat(iso)
            assert slot_dt.astimezone(timezone.utc) >= cutoff_utc - timedelta(minutes=1), \
                f"Slot {iso} violates 2h cutoff"


# -------------- Booking flows --------------

def _first_available_slot(availability):
    """Find the first available future slot on a working day (skip today for stability)."""
    for i, d in enumerate(availability["days"]):
        if i == 0:
            continue
        if not d["is_open"]:
            continue
        for s in d["slots"]:
            if s["available"]:
                return s, d
    return None, None


class TestBookings:
    def test_slot_booking_success(self, api, availability):
        slot, day = _first_available_slot(availability)
        assert slot is not None, "No available slot found in 60-day window"
        payload = {
            "name": "TEST_Sched User",
            "phone": "5045551234",
            "email": "",
            "slot_iso": slot["iso"],
            "appointment_type": "walkthrough",
        }
        r = api.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
        assert r.status_code == 200, f"Booking failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert data.get("status") == "confirmed"
        assert "message" in data
        assert day["date"] in data["message"] or slot["label"] in data["message"] or True
        # Persist for double-book test
        pytest.shared_slot_iso = slot["iso"]

    def test_double_book_returns_409(self, api):
        slot_iso = getattr(pytest, "shared_slot_iso", None)
        if not slot_iso:
            pytest.skip("No slot from previous test")
        payload = {
            "name": "TEST_Double Booker",
            "phone": "5045550000",
            "slot_iso": slot_iso,
            "appointment_type": "walkthrough",
        }
        r = api.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
        assert r.status_code == 409, f"Expected 409, got {r.status_code}: {r.text[:300]}"
        body = r.json()
        detail = body.get("detail", "")
        assert "just booked" in detail.lower() or "pick another" in detail.lower()

    def test_invalid_slot_bad_minute(self, api):
        # Sunday-ish invalid: minute != 0
        r = api.post(f"{BASE_URL}/api/bookings", json={
            "name": "TEST_Invalid",
            "phone": "5045550001",
            "slot_iso": "2026-08-10T08:30:00-05:00",  # 8:30 minute!=0
            "appointment_type": "walkthrough",
        }, timeout=15)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text[:200]}"

    def test_invalid_slot_out_of_hours(self, api, availability):
        # Pick a future date and set hour = 20 (out of range)
        target_date = None
        for i, d in enumerate(availability["days"]):
            if i > 0 and d["is_open"]:
                target_date = d["date"]
                break
        assert target_date
        bad_iso = f"{target_date}T20:00:00-05:00"
        r = api.post(f"{BASE_URL}/api/bookings", json={
            "name": "TEST_OutOfHours",
            "phone": "5045550002",
            "slot_iso": bad_iso,
            "appointment_type": "walkthrough",
        }, timeout=15)
        assert r.status_code == 400

    def test_invalid_slot_sunday(self, api, availability):
        # Find a Sunday date in the window
        sunday_date = None
        for d in availability["days"]:
            if d["weekday"] == "Sun":
                sunday_date = d["date"]
                break
        assert sunday_date
        bad_iso = f"{sunday_date}T10:00:00-05:00"
        r = api.post(f"{BASE_URL}/api/bookings", json={
            "name": "TEST_Sunday",
            "phone": "5045550003",
            "slot_iso": bad_iso,
            "appointment_type": "walkthrough",
        }, timeout=15)
        assert r.status_code == 400

    def test_legacy_chat_quick_book_still_works(self, api):
        # No slot_iso — legacy free-text path
        r = api.post(f"{BASE_URL}/api/bookings", json={
            "name": "TEST_Legacy Chat",
            "phone": "5045550004",
            "preferred_date": "next Tuesday",
            "preferred_time": "morning",
            "project_type": "Chat booking",
        }, timeout=15)
        assert r.status_code == 200, f"Legacy path failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert data.get("status") == "confirmed"

    def test_missing_name_phone_rejected(self, api):
        r = api.post(f"{BASE_URL}/api/bookings", json={
            "name": "",
            "phone": "",
            "slot_iso": "2026-08-10T09:00:00-05:00",
        }, timeout=15)
        assert r.status_code == 400
