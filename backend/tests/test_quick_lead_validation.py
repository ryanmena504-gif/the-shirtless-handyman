"""Tests for relaxed /api/leads/quick validation accepting name + (phone OR email)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://design-reveal.preview.emergentagent.com").rstrip("/")
ENDPOINT = f"{BASE_URL}/api/leads/quick"


# -------- New behavior: email-only is allowed --------
def test_quick_lead_email_only_succeeds():
    payload = {"name": "TEST_StudioEmailOnly", "email": "studio_email@example.com", "source": "studio_email_gate"}
    r = requests.post(ENDPOINT, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 0
    assert body.get("status") == "new"
    assert "message" in body


# -------- Negative: neither phone nor email --------
def test_quick_lead_no_phone_no_email_rejected():
    payload = {"name": "TEST_NoContact", "source": "studio_email_gate"}
    r = requests.post(ENDPOINT, json=payload, timeout=15)
    assert r.status_code == 400, r.text


# -------- Regression: legacy name + phone still works --------
def test_quick_lead_legacy_name_phone_still_works():
    payload = {"name": "TEST_LegacyPhone", "phone": "5045551212", "source": "hero_form"}
    r = requests.post(ENDPOINT, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("status") == "new"
    assert "id" in body


# -------- Negative: empty name --------
def test_quick_lead_empty_name_rejected():
    payload = {"name": "   ", "phone": "5045551212"}
    r = requests.post(ENDPOINT, json=payload, timeout=15)
    assert r.status_code == 400
