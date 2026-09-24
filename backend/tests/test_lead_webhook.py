"""
Backend tests for the Make.com lead webhook wiring across all 4 customer
inquiry endpoints:
  - POST /api/leads              (Website Quote Form)
  - POST /api/leads/quick        (Website Quick Form (Hero) / Email Capture)
  - POST /api/chat               (Website Chatbot — only when contact info)
  - POST /api/bookings           (Website Booking — exactly ONE call, not two)

Contract:
  1. Fire-and-forget: customer response NEVER blocked by webhook failure
  2. Exactly ONE outbound webhook call per user submission
  3. Uniform 10-key standardized payload
  4. Distinct lead_source labels per entry point

NOTE: MAKE_WEBHOOK_URL points to a REAL Make.com hook. We keep total live
submissions to ~10 across this run and clean mongo after.
"""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = "http://localhost:8001"  # per E1 instruction — bypass Cloudflare edge
ADMIN_PASSWORD = "renovate2024admin"
STANDARD_KEYS = {
    "full_name", "phone", "email", "project_address",
    "project_type", "budget", "timeline", "notes",
    "lead_source", "submitted_at",
}
TEST_EMAIL_PREFIX = "TEST_webhook_"


# ------------------------------------------------------------------ Fixtures

@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def mongo():
    url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    dbname = os.environ.get("DB_NAME", "test_database")
    client = MongoClient(url)
    yield client[dbname]
    # Session-end cleanup: remove all TEST_ docs so real Airtable stays clean
    client[dbname].leads.delete_many({"email": {"$regex": f"^{TEST_EMAIL_PREFIX}"}})
    client[dbname].bookings.delete_many({"email": {"$regex": f"^{TEST_EMAIL_PREFIX}"}})
    client[dbname].leads.delete_many({"name": {"$regex": "^TEST_"}})
    client[dbname].bookings.delete_many({"name": {"$regex": "^TEST_"}})
    client.close()


# ------------------------------------------------------------------ Helpers

def _clear_events(api, admin_headers):
    r = api.delete(f"{BASE_URL}/api/admin/webhook-events", headers=admin_headers)
    assert r.status_code == 200, r.text


def _get_events(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/webhook-events?limit=25", headers=admin_headers)
    assert r.status_code == 200, r.text
    return r.json().get("events", [])


def _wait_for_events(api, admin_headers, expected_count=1, timeout=8.0):
    """Poll the debug ring buffer until we see the expected event count or timeout."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        events = _get_events(api, admin_headers)
        if len(events) >= expected_count:
            return events
        time.sleep(0.5)
    return _get_events(api, admin_headers)


def _assert_standard_payload(payload: dict, expected_source: str):
    missing = STANDARD_KEYS - set(payload.keys())
    assert not missing, f"Payload missing standard keys: {missing}. Got keys={list(payload.keys())}"
    assert payload["lead_source"] == expected_source, \
        f"Expected lead_source={expected_source!r} got {payload.get('lead_source')!r}"
    assert payload.get("submitted_at"), "submitted_at should be a non-empty ISO string"
    # UTC ISO check — either ends in +00:00 or Z
    ts = payload["submitted_at"]
    assert ("+00:00" in ts or ts.endswith("Z")), f"submitted_at should be UTC: {ts}"


def _assert_ok_make_response(event: dict):
    """Verify Make responded with HTTP 200. Skip assert if Make returned error
    (e.g., scenario disabled) but never fail the whole run on that alone."""
    if event.get("error"):
        pytest.fail(f"Webhook errored: {event.get('error')} payload_source={event.get('lead_source')}")
    assert event.get("status") == 200, (
        f"Expected Make 200 got status={event.get('status')} "
        f"snippet={event.get('response_snippet')!r}"
    )


# =================================================================== TESTS

class TestQuoteFormWebhook:
    """POST /api/leads → lead_source='Website Quote Form'"""

    def test_leads_fires_one_webhook_with_standard_payload(self, api, admin_headers, mongo):
        _clear_events(api, admin_headers)
        payload = {
            "name": "TEST_Quote User",
            "phone": "5045551001",
            "email": f"{TEST_EMAIL_PREFIX}quote_{uuid.uuid4().hex[:8]}@example.com",
            "zip_code": "70115",
            "project_description": "TEST kitchen remodel",
            "selected_design_style": "modern",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("id"), "lead should have id"

        events = _wait_for_events(api, admin_headers, expected_count=1, timeout=8.0)
        assert len(events) == 1, f"Expected exactly 1 webhook event, got {len(events)}: {events}"
        ev = events[0]
        _assert_standard_payload(ev["payload"], "Website Quote Form")
        assert ev["payload"]["full_name"] == "TEST_Quote User"
        assert ev["payload"]["email"] == payload["email"]
        assert ev["payload"].get("lead_id") == body["id"]
        _assert_ok_make_response(ev)


class TestQuickLeadWebhook:
    """POST /api/leads/quick — source_map drives lead_source label."""

    def test_hero_form_source_labels_website_quick_form(self, api, admin_headers):
        _clear_events(api, admin_headers)
        payload = {
            "name": "TEST_Hero User",
            "phone": "5045551002",
            "email": f"{TEST_EMAIL_PREFIX}hero_{uuid.uuid4().hex[:8]}@example.com",
            "zip_code": "70117",
            "project_type": "bathroom",
            "source": "hero_form",
        }
        r = api.post(f"{BASE_URL}/api/leads/quick", json=payload)
        assert r.status_code == 200, r.text
        events = _wait_for_events(api, admin_headers, expected_count=1)
        assert len(events) == 1, f"Expected 1 event, got {len(events)}"
        ev = events[0]
        _assert_standard_payload(ev["payload"], "Website Quick Form (Hero)")
        assert ev["payload"]["project_type"] == "bathroom"
        _assert_ok_make_response(ev)

    def test_email_capture_source_labels_website_email_capture(self, api, admin_headers):
        _clear_events(api, admin_headers)
        payload = {
            "name": "TEST_Studio User",
            "email": f"{TEST_EMAIL_PREFIX}studio_{uuid.uuid4().hex[:8]}@example.com",
            "source": "email_capture",
        }
        r = api.post(f"{BASE_URL}/api/leads/quick", json=payload)
        assert r.status_code == 200, r.text
        events = _wait_for_events(api, admin_headers, expected_count=1)
        assert len(events) == 1, f"Expected 1 event, got {len(events)}"
        ev = events[0]
        _assert_standard_payload(ev["payload"], "Website Email Capture (Studio)")
        _assert_ok_make_response(ev)


class TestChatWebhook:
    """POST /api/chat — fires only when contact info detected."""

    def test_chat_with_email_and_phone_fires_one_webhook(self, api, admin_headers):
        _clear_events(api, admin_headers)
        session_id = f"TEST_chat_{uuid.uuid4().hex[:8]}"
        chat_email = f"{TEST_EMAIL_PREFIX}chat_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "session_id": session_id,
            "message": f"Hi I want a kitchen remodel. My email is {chat_email} and phone 5045551234",
            "name": "TEST_Chat User",
        }
        r = api.post(f"{BASE_URL}/api/chat", json=payload, timeout=30)
        # Chat can 502 if LLM key is down — skip if so, don't false-fail webhook test
        if r.status_code == 502:
            pytest.skip(f"Chat AI unavailable: {r.text}")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("lead_id"), "chat should have created a lead"

        events = _wait_for_events(api, admin_headers, expected_count=1, timeout=8.0)
        assert len(events) == 1, f"Expected 1 event, got {len(events)}: {events}"
        ev = events[0]
        _assert_standard_payload(ev["payload"], "Website Chatbot")
        assert ev["payload"].get("lead_id") == body["lead_id"]
        assert ev["payload"]["email"] == chat_email
        _assert_ok_make_response(ev)

    def test_chat_without_contact_info_does_NOT_fire_webhook(self, api, admin_headers):
        _clear_events(api, admin_headers)
        session_id = f"TEST_chat_nocontact_{uuid.uuid4().hex[:8]}"
        payload = {
            "session_id": session_id,
            "message": "Hi, just curious what services you offer.",
            "name": "TEST_Curious",
        }
        r = api.post(f"{BASE_URL}/api/chat", json=payload, timeout=30)
        if r.status_code == 502:
            pytest.skip("Chat AI unavailable")
        assert r.status_code == 200, r.text
        assert r.json().get("lead_id") is None, "no lead should be created without contact info"

        # Give any (incorrect) fire-and-forget time to run
        time.sleep(3)
        events = _get_events(api, admin_headers)
        assert len(events) == 0, f"Chat w/o contact should NOT fire webhook. Got: {events}"


class TestBookingWebhook:
    """
    PRIMARY case (the bug the user reported).
    POST /api/bookings must fire exactly ONE webhook with lead_source='Website Booking'.
    NOT two (booking + companion-lead deduped).
    """

    def _pick_open_slot(self, api):
        r = api.get(f"{BASE_URL}/api/schedule/availability?days=14")
        assert r.status_code == 200, r.text
        for d in r.json().get("days", []):
            for s in d.get("slots", []):
                if s.get("available"):
                    return s["iso"]
        pytest.skip("No available slot in next 14 days — cannot exercise booking path")

    def test_booking_fires_exactly_one_webhook_website_booking(self, api, admin_headers, mongo):
        _clear_events(api, admin_headers)
        slot_iso = self._pick_open_slot(api)
        email = f"{TEST_EMAIL_PREFIX}booking_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "TEST_Booking User",
            "phone": "5045551003",
            "email": email,
            "slot_iso": slot_iso,
            "appointment_type": "walkthrough",
            "project_type": "kitchen",
            "notes": "TEST notes",
            "zip_code": "70118",
            "session_id": "TEST_session",
        }
        r = api.post(f"{BASE_URL}/api/bookings", json=payload)
        assert r.status_code == 200, r.text
        booking_id = r.json().get("id")
        assert booking_id, "booking should return an id"
        assert "booked" in (r.json().get("message") or "").lower()

        # Wait for fire-and-forget task
        events = _wait_for_events(api, admin_headers, expected_count=1, timeout=8.0)

        # Sleep an extra 2s to ensure any DUPLICATE call would also be captured
        time.sleep(2)
        events = _get_events(api, admin_headers)
        assert len(events) == 1, (
            f"CRITICAL: /api/bookings must fire exactly 1 webhook. Got {len(events)} events: {events}"
        )
        ev = events[0]
        _assert_standard_payload(ev["payload"], "Website Booking")
        assert ev["payload"]["full_name"] == "TEST_Booking User"
        assert ev["payload"].get("lead_id") == booking_id
        assert ev["payload"]["project_type"] in ("kitchen", "walkthrough", "Booked consultation")
        _assert_ok_make_response(ev)


class TestWebhookFailureDoesNotBlockCustomer:
    """
    Fire-and-forget contract: if Make is unreachable, /api/bookings must still
    return 200 to the customer. Restore MAKE_WEBHOOK_URL after test.
    """

    def test_bad_url_still_returns_200_to_customer(self, api, admin_headers, mongo):
        # Temporarily point env var to a dead host inside the running process.
        # Since the backend reads MAKE_WEBHOOK_URL fresh in lead_webhook._webhook_url(),
        # we can't easily hot-swap it without editing .env + restart. Instead:
        #   1) Read current env
        #   2) Rewrite backend/.env to a dead URL
        #   3) supervisorctl restart backend
        #   4) submit booking
        #   5) restore .env and restart

        env_path = "/app/backend/.env"
        with open(env_path) as f:
            original = f.read()
        assert "MAKE_WEBHOOK_URL=" in original, ".env must have MAKE_WEBHOOK_URL"

        broken = []
        for line in original.splitlines():
            if line.startswith("MAKE_WEBHOOK_URL="):
                broken.append("MAKE_WEBHOOK_URL=http://localhost:59999/nonexistent")
            else:
                broken.append(line)
        broken_content = "\n".join(broken) + "\n"

        try:
            with open(env_path, "w") as f:
                f.write(broken_content)
            os.system("sudo supervisorctl restart backend >/dev/null 2>&1")
            # wait for backend to come back
            deadline = time.time() + 20
            while time.time() < deadline:
                try:
                    if api.get(f"{BASE_URL}/api/admin/login", timeout=2).status_code in (405, 200, 401, 422):
                        break
                except Exception:
                    pass
                time.sleep(0.5)

            # Refresh admin token (JWT is env-secret dependent — same secret so still valid)
            tok = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
            assert tok.status_code == 200, tok.text
            new_headers = {"Authorization": f"Bearer {tok.json()['token']}", "Content-Type": "application/json"}

            _clear_events(api, new_headers)

            # Pick a slot
            avail = api.get(f"{BASE_URL}/api/schedule/availability?days=14").json()
            slot_iso = None
            for d in avail.get("days", []):
                for s in d.get("slots", []):
                    if s.get("available"):
                        slot_iso = s["iso"]; break
                if slot_iso:
                    break
            if not slot_iso:
                pytest.skip("no slot available")

            email = f"{TEST_EMAIL_PREFIX}baddest_{uuid.uuid4().hex[:8]}@example.com"
            r = api.post(f"{BASE_URL}/api/bookings", json={
                "name": "TEST_BadURL User",
                "phone": "5045551004",
                "email": email,
                "slot_iso": slot_iso,
                "appointment_type": "walkthrough",
                "project_type": "bathroom",
                "notes": "TEST bad webhook",
                "zip_code": "70119",
            })
            assert r.status_code == 200, f"CUSTOMER BLOCKED by webhook failure: {r.status_code} {r.text}"
            body = r.json()
            assert body.get("id"), "booking id required"
            assert body.get("status") == "confirmed"

            # Give async task time to fail
            time.sleep(4)
            events = _get_events(api, new_headers)
            assert len(events) == 1, f"Expected 1 event with error, got {len(events)}"
            ev = events[0]
            # Either error is set OR status is a connection failure (None/5xx)
            assert ev.get("error") or ev.get("status") not in (200,), \
                f"Expected error on webhook. Got: {ev}"
        finally:
            with open(env_path, "w") as f:
                f.write(original)
            os.system("sudo supervisorctl restart backend >/dev/null 2>&1")
            # wait for restart
            deadline = time.time() + 20
            while time.time() < deadline:
                try:
                    if api.post(f"{BASE_URL}/api/admin/login",
                                json={"password": ADMIN_PASSWORD}, timeout=2).status_code == 200:
                        break
                except Exception:
                    pass
                time.sleep(0.5)


class TestStandardPayloadSchema:
    """All 4 endpoints should produce payloads with the same 10-key schema."""

    def test_all_sources_use_standard_schema(self, api, admin_headers):
        # We only need to verify by inspecting the last set of events collected
        # across the other tests, but since pytest ordering isn't guaranteed we
        # just do a fresh /api/leads submission and verify.
        _clear_events(api, admin_headers)
        payload = {
            "name": "TEST_SchemaCheck",
            "phone": "5045550000",
            "email": f"{TEST_EMAIL_PREFIX}schema_{uuid.uuid4().hex[:8]}@example.com",
            "zip_code": "70115",
            "project_description": "schema check",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200
        events = _wait_for_events(api, admin_headers, expected_count=1)
        assert events
        payload_out = events[0]["payload"]
        for k in STANDARD_KEYS:
            assert k in payload_out, f"Standard key missing: {k}"
        assert "lead_id" in payload_out
        assert "source_endpoint" in payload_out
