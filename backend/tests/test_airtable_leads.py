"""Offline tests for direct Airtable lead delivery (no network, no real records)."""
import asyncio
import json

import httpx

import airtable_leads
import lead_webhook


def _run(coro):
    return asyncio.run(coro)


def _patch_client(monkeypatch, handler, calls):
    real = httpx.AsyncClient

    def fake(*a, **kw):
        kw["transport"] = httpx.MockTransport(lambda req: (calls.append(req), handler(req, len(calls)))[1])
        return real(*a, **kw)

    monkeypatch.setattr(airtable_leads.httpx, "AsyncClient", fake)


def _payload():
    return lead_webhook.build_lead_payload(
        "Website Quick Form (Hero)", full_name="TEST Person", phone="504-555-0100",
        email="not-an-email", project_address="70119", project_type="Shower", lead_id="abc",
    )


def test_writes_one_record_with_token(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(200, json={"records": [{"id": "recX"}]}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert ev["record_id"] == "recX" and len(calls) == 1
    req = calls[0]
    assert req.url.path == "/v0/appuyAHSSzJrPWlec/tbliTlH5mmdOjc280"
    assert req.headers["authorization"] == "Bearer patTEST"
    body = json.loads(req.content)
    f = body["records"][0]["fields"]
    assert body["typecast"] is True
    assert f["Source"] == "Website" and f["Contact phone"] == "504-555-0100"
    assert "Contact email" not in f  # invalid email kept in Notes only
    assert "not-an-email" in f["Notes"]
    assert "patTEST" not in json.dumps(ev)


def test_422_gets_single_minimal_fallback_then_stops(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(422, json={"error": "UNKNOWN_FIELD_NAME"}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert len(calls) == 2  # original + one minimal write, no loop
    assert set(json.loads(calls[1].content)["records"][0]["fields"]) == {"Leads Name", "Notes"}
    assert ev["error"]


def test_server_error_is_not_retried(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_DRY_RUN", raising=False)
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(503, text="down"), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert len(calls) == 1 and ev["status"] == 503


def test_dry_run_sends_nothing(monkeypatch):
    monkeypatch.setenv("AIRTABLE_DRY_RUN", "true")
    calls = []
    _patch_client(monkeypatch, lambda r, n: httpx.Response(200, json={}), calls)
    ev = _run(airtable_leads.push_lead(_payload()))
    assert ev["status"] == "dry_run" and calls == []
