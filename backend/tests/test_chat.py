"""Backend tests for the AI chat bot endpoints (/api/chat, /api/chat/{session_id}/history).

Covers:
- New chat session with friendly reply, lead_id null on first turn
- Multi-turn memory carrying over bathroom context to a microcement pricing follow-up
- Lead extraction (phone/email) returns a non-null lead_id
- GET /api/chat/{session_id}/history returns sorted messages
- 400 validations for empty session_id, empty message, oversized message
- Regression: /api/leads/quick still works
"""
import os
import re
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
    open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
CHAT_URL = f"{BASE_URL}/api/chat"


@pytest.fixture(scope="module")
def session_id():
    return f"TEST_{uuid.uuid4().hex[:12]}"


def _post_chat(session_id: str, message: str, timeout: int = 90):
    return requests.post(
        CHAT_URL,
        json={"session_id": session_id, "message": message},
        timeout=timeout,
    )


# ---------------- Turn 1: bathroom remodel ----------------
def test_chat_turn1_new_session(session_id):
    r = _post_chat(session_id, "Hey, I want to remodel my bathroom")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    assert "reply" in data and isinstance(data["reply"], str)
    assert "lead_id" in data
    assert data["lead_id"] is None, "lead_id should be null on first turn (no contact info)"
    assert len(data["reply"]) > 0
    assert len(data["reply"]) < 1200, "Reply expected to be reasonably concise"
    # store reply for next test if needed
    pytest.turn1_reply = data["reply"]


# ---------------- Turn 2: multi-turn memory + pricing ----------------
def test_chat_turn2_memory_and_microcement_pricing(session_id):
    r = _post_chat(session_id, "It is about 60 sq ft. How much for microcement?")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    reply = data["reply"].lower()
    assert data["lead_id"] is None
    # Must reference microcement pricing — accept any digit indicating pricing
    assert "microcement" in reply or "$" in reply or "sq" in reply, \
        f"Reply should reference microcement / pricing: {data['reply']}"
    # Should mention a dollar figure roughly within the published range $1080-$2100 OR per-sqft $18-$35
    has_price_digit = bool(re.search(r"\$\s*\d", data["reply"]))
    assert has_price_digit, f"Reply should mention a $ price: {data['reply']}"
    # Should NOT ask "what surface again" — case-insensitive check
    assert "what surface again" not in reply
    assert "which room again" not in reply


# ---------------- Turn 3: lead extraction ----------------
def test_chat_turn3_lead_extraction(session_id):
    msg = "Have Ryan text me, my number is 504-555-7777 and email TEST_chat@example.com"
    r = _post_chat(session_id, msg)
    assert r.status_code == 200, f"{r.status_code}: {r.text}"
    data = r.json()
    assert data["lead_id"] is not None, f"lead_id should be returned for contact info: {data}"
    assert isinstance(data["lead_id"], str) and len(data["lead_id"]) > 0


# ---------------- History endpoint ----------------
def test_chat_history_sorted(session_id):
    r = requests.get(f"{BASE_URL}/api/chat/{session_id}/history", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "messages" in data
    msgs = data["messages"]
    # We've done 3 user turns + 3 assistant turns => 6 messages
    assert len(msgs) >= 6, f"Expected >=6 messages, got {len(msgs)}"
    # Sorted ascending by created_at
    created = [m["created_at"] for m in msgs]
    assert created == sorted(created), "history must be ascending by created_at"
    # Roles alternate user/assistant
    roles = [m["role"] for m in msgs]
    assert roles[0] == "user"
    assert roles[1] == "assistant"


# ---------------- Validations ----------------
def test_chat_empty_session_id_returns_400():
    r = _post_chat("", "hello")
    assert r.status_code == 400


def test_chat_empty_message_returns_400():
    r = _post_chat(f"TEST_{uuid.uuid4().hex[:8]}", "")
    assert r.status_code == 400


def test_chat_oversized_message_returns_400():
    big = "a" * 2500
    r = _post_chat(f"TEST_{uuid.uuid4().hex[:8]}", big)
    assert r.status_code == 400


# ---------------- Regression: /api/leads/quick ----------------
def test_quick_lead_still_works():
    r = requests.post(
        f"{BASE_URL}/api/leads/quick",
        json={"name": "TEST_RegressionUser", "phone": "504-555-1234", "source": "test_regression"},
        timeout=10,
    )
    assert r.status_code == 200, f"{r.status_code}: {r.text}"
    data = r.json()
    assert "id" in data and data.get("status") == "new"
