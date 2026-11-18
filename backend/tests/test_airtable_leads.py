"""Offline tests for direct Airtable lead delivery (no network, no real records)."""
import asyncio
import json
import logging

import httpx
import pytest

import airtable_leads
import lead_webhook


def _run(coro):
    return asyncio.run(coro)


@pytest.fixture(autouse=True)
def _reset_airtable_state():
    airtable_leads._pending.clear()
    airtable_leads._recent.clear()
    task = airtable_leads._retry_task
    if task is not None and not task.done():
        task.cancel()
    airtable_leads._retry_task = None
    airtable_leads._wake = None
    yield
    task = airtable_leads._retry_task
    if task is not None and not task.done():
        task.cancel()
    airtable_leads._pending.clear()
    airtable_leads._retry_task = None
    airtable_leads._wake = None


def _patch_client(monkeypatch, handler, calls):
    real = httpx.AsyncClient

    def fake(*a, **kw):
        kw["transport"] = httpx.MockTransport(lambda req: (calls.append(req), handler(req, len(calls)))[1])
        return real(*a, **kw)

    monkeypatch.setattr(airtable_leads.httpx, "AsyncClient", fake)


def _payload(**overrides):
    payload = lead_webhook.build_lead_payload(
        "Website Quick Form (Hero)", full_name="TEST Person", phone="504-555-0100",
        email="not-an-email", project_address="70119", project_type="Shower", lead_id="abc",
    )
    payload.update(overrides)
    return payload


def _force_due():
    for item in airtable_leads._pending.values():
        item["next_at"] = 0


def test_writes_one_record_with_token(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(200, json={"records": [{"id": "recX"}]}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert ev["record_id"] == "recX" and len(calls) == 1
    assert airtable_leads.pending_count() == 0
    req = calls[0]
    assert req.url.path == "/v0/appuyAHSSzJrPWlec/tbliTlH5mmdOjc280"
    assert req.headers["authorization"] == "Bearer patTEST"
    body = json.loads(req.content)
    f = body["records"][0]["fields"]
    assert body["typecast"] is True
    assert f["Source"] == "Website" and f["Contact phone"] == "504-555-0100"
    assert f["Notes"].startswith("WEBSITE LEAD — Website Quick Form (Hero)")
    assert "Contact email" not in f  # invalid email kept in Notes only
    assert "not-an-email" in f["Notes"]
    assert "patTEST" not in json.dumps(ev)


def test_422_gets_single_minimal_fallback_then_queues(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(422, json={"error": "UNKNOWN_FIELD_NAME"}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert len(calls) == 2  # original + one minimal write, no tight loop
    assert set(json.loads(calls[1].content)["records"][0]["fields"]) == {"Leads Name", "Notes"}
    assert ev["error"]
    assert airtable_leads.pending_count() == 1


def test_422_minimal_success_is_not_queued(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []

    def handler(r, n):
        if n == 1:
            return httpx.Response(422, json={"error": "UNKNOWN_FIELD_NAME"})
        return httpx.Response(200, json={"records": [{"id": "recMin"}]})

    _patch_client(monkeypatch, handler, calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert ev["record_id"] == "recMin"
    assert len(calls) == 2
    assert airtable_leads.pending_count() == 0


def test_server_error_is_queued_then_retried(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []

    def handler(r, n):
        if n == 1:
            return httpx.Response(503, text="down")
        return httpx.Response(200, json={"records": [{"id": "recY"}]})

    _patch_client(monkeypatch, handler, calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert len(calls) == 1 and ev["status"] == 503
    assert airtable_leads.pending_count() == 1
    _force_due()
    results = _run(airtable_leads.retry_pending())
    assert results[0]["record_id"] == "recY"
    assert airtable_leads.pending_count() == 0
    assert len(calls) == 2


def test_unconfigured_logs_loudly_and_retries_after_key_is_set(monkeypatch, caplog):
    monkeypatch.delenv("AIRTABLE_API_KEY", raising=False)
    monkeypatch.delenv("AIRTABLE_TOKEN", raising=False)
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(200, json={"records": [{"id": "recZ"}]}), calls)
    caplog.set_level(logging.ERROR)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert calls == []
    assert ev["error"] == "AIRTABLE_API_KEY not configured"
    assert airtable_leads.pending_count() == 1
    text = caplog.text
    assert "NOT saved" in text
    assert "504-555-0100" in text
    assert "TEST Person" in text
    assert "patTEST" not in text
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    _force_due()
    results = _run(airtable_leads.retry_pending())
    assert results[0]["record_id"] == "recZ"
    assert airtable_leads.pending_count() == 0
    assert len(calls) == 1
    assert "patTEST" not in caplog.text


def test_duplicate_lead_id_stays_one_queue_entry(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(503, text="down"), calls)
    _run(airtable_leads.push_lead(_payload()))
    _run(airtable_leads.push_lead(_payload(full_name="TEST Person again")))
    assert airtable_leads.pending_count() == 1
    assert len(calls) == 2
    stored = next(iter(airtable_leads._pending.values()))["payload"]["full_name"]
    assert stored == "TEST Person again"


def test_full_queue_drops_oldest_and_logs_it(monkeypatch, caplog):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    monkeypatch.setattr(airtable_leads, "_MAX_PENDING", 1)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(503, text="down"), calls)
    caplog.set_level(logging.ERROR)
    _run(airtable_leads.push_lead(_payload(lead_id="first", phone="504-555-0001")))
    _run(airtable_leads.push_lead(_payload(lead_id="second", phone="504-555-0002")))
    assert airtable_leads.pending_count() == 1
    assert "first" not in airtable_leads._pending
    assert "second" in airtable_leads._pending
    assert "retry queue full" in caplog.text
    assert "504-555-0001" in caplog.text


def test_dry_run_sends_nothing(monkeypatch):
    monkeypatch.setenv("AIRTABLE_DRY_RUN", "true")
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(200, json={}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert ev["status"] == "dry_run" and calls == []
    assert airtable_leads.pending_count() == 0


def test_background_on_a_running_loop_queues_without_blocking(monkeypatch):
    """The FastAPI path schedules the write and returns before Airtable answers."""
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(503, text="down"), calls)

    async def _main():
        airtable_leads.push_lead_background(_payload(lead_id="looped"))
        pushes = [t for t in list(airtable_leads._inflight) if t is not airtable_leads._retry_task]
        if pushes:
            await asyncio.gather(*pushes)
        assert airtable_leads.pending_count() == 1
        assert "looped" in airtable_leads._pending

    _run(_main())
    assert len(calls) == 1


def test_forward_lead_still_returns_when_airtable_is_down(monkeypatch):
    """The visitor path must not raise, and the lead must sit in the retry queue."""
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    monkeypatch.delenv("MAKE_LEAD_WEBHOOK_URL", raising=False)
    monkeypatch.delenv("MAKE_WEBHOOK_URL", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(503, text="down"), calls)
    lead_webhook.forward_lead(_payload(lead_id="from-form"))
    assert airtable_leads.pending_count() == 1
    assert "from-form" in airtable_leads._pending
    assert len(calls) == 1
