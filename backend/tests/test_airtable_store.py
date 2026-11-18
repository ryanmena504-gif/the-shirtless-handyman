"""Offline tests for the Airtable snapshot of the in-memory DB.
A fake Airtable (httpx.MockTransport) stands in for the API; no network."""
import asyncio
import json
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from mongomock_motor import AsyncMongoMockClient

import airtable_store


class FakeAirtable:
    def __init__(self):
        self.records = {}  # id -> fields
        self.calls = []
        self.fail_list = False
        self._n = 0

    def handler(self, req: httpx.Request) -> httpx.Response:
        self.calls.append((req.method, str(req.url)))
        assert req.headers["authorization"] == "Bearer patTEST"
        if req.method == "GET":
            if self.fail_list:
                return httpx.Response(404, json={"error": "TABLE_NOT_FOUND"})
            return httpx.Response(200, json={"records": [
                {"id": rid, "fields": f} for rid, f in self.records.items()]})
        body = json.loads(req.content)
        assert len(body["records"]) <= 10
        out = []
        for rec in body["records"]:
            if req.method == "POST":
                self._n += 1
                rid = f"rec{self._n}"
                self.records[rid] = dict(rec["fields"])
            else:
                rid = rec["id"]
                self.records[rid].update(rec["fields"])
            out.append({"id": rid, "fields": self.records[rid]})
        return httpx.Response(200, json={"records": out})


@pytest.fixture
def fake(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.setenv("AIRTABLE_STORE_TABLE", "Website Data")
    monkeypatch.delenv("AIRTABLE_STORE_COLLECTIONS", raising=False)
    monkeypatch.delenv("AIRTABLE_STORE_BASE_ID", raising=False)
    monkeypatch.delenv("AIRTABLE_BASE_ID", raising=False)
    f = FakeAirtable()
    real = httpx.AsyncClient

    def client(*a, **kw):
        kw["transport"] = httpx.MockTransport(f.handler)
        return real(*a, **kw)

    monkeypatch.setattr(airtable_store.httpx, "AsyncClient", client)
    return f


def _db():
    return AsyncMongoMockClient()["shirtless_handyman"]


def run(coro):
    return asyncio.run(coro)


def test_off_unless_table_and_token_set_and_never_with_real_mongo(monkeypatch):
    monkeypatch.setenv("AIRTABLE_API_KEY", "patTEST")
    monkeypatch.delenv("AIRTABLE_STORE_TABLE", raising=False)
    assert airtable_store.enabled(True) is False
    monkeypatch.setenv("AIRTABLE_STORE_TABLE", "Website Data")
    assert airtable_store.enabled(True) is True
    assert airtable_store.enabled(False) is False  # MONGO_URL set


def test_endpoint_defaults_to_the_leads_base_and_encodes_the_table_name(fake):
    assert airtable_store.endpoint() == (
        "https://api.airtable.com/v0/appuyAHSSzJrPWlec/Website%20Data")


def test_data_survives_a_restart(fake):
    slot = datetime(2026, 11, 20, 15, 0, tzinfo=timezone.utc)

    async def first_life():
        db = _db()
        store = airtable_store.AirtableStore(db)
        assert await store.restore() == {}
        await db.bookings.insert_one({"id": "b1", "name": "Jane", "slot_start_utc": slot})
        await db.lead_unsubscribes.insert_one({"email": "x@example.com"})
        await db.leads.insert_one({"id": "l1", "full_name": "Jane", "photo": "data:image/png;base64," + "A" * 5000})
        await db.portfolio.insert_one({"id": "p1"})  # not in the saved list
        return await store.flush()

    calls = run(first_life())
    assert calls == 1  # three new collections -> one create call
    assert {f["Key"] for f in fake.records.values()} == {"bookings#0", "lead_unsubscribes#0", "leads#0"}

    async def second_life():
        db = _db()  # fresh, empty in-memory DB, like a Render restart
        store = airtable_store.AirtableStore(db)
        counts = await store.restore()
        booking = await db.bookings.find_one({"id": "b1"}, {"_id": 0})
        # Booked-slot queries still work on restored, timezone-aware datetimes.
        clash = await db.bookings.find_one({"slot_start_utc": {"$gte": slot - timedelta(minutes=1),
                                                               "$lt": slot + timedelta(hours=1)}})
        lead = await db.leads.find_one({"id": "l1"}, {"_id": 0})
        unsub = await db.lead_unsubscribes.find_one({"email": "x@example.com"})
        port = await db.portfolio.find_one({"id": "p1"})
        nothing_changed = await store.flush()
        return counts, booking, clash, lead, unsub, port, nothing_changed

    counts, booking, clash, lead, unsub, port, nothing_changed = run(second_life())
    assert counts == {"bookings": 1, "lead_unsubscribes": 1, "leads": 1}
    # Mongo (and mongomock) store datetimes as naive UTC; same before and after.
    assert booking["name"] == "Jane"
    assert booking["slot_start_utc"].replace(tzinfo=None) == slot.replace(tzinfo=None)
    assert clash is not None
    assert lead["photo"] == "[image not saved]"
    assert unsub is not None
    assert port is None
    assert nothing_changed == 0  # restored data is not re-uploaded


def test_unchanged_data_costs_zero_calls_and_a_change_costs_one(fake):
    async def go():
        db = _db()
        store = airtable_store.AirtableStore(db)
        await store.restore()
        await db.bookings.insert_one({"id": "b1"})
        first = await store.flush()
        idle = [await store.flush() for _ in range(5)]
        await db.bookings.update_one({"id": "b1"}, {"$set": {"status": "cancelled"}})
        changed = await store.flush()
        return first, idle, changed

    first, idle, changed = run(go())
    assert first == 1 and idle == [0] * 5 and changed == 1
    assert [m for m, _ in fake.calls] == ["GET", "POST", "PATCH"]


def test_big_collections_are_chunked_and_shrink_cleanly(fake, monkeypatch):
    monkeypatch.setattr(airtable_store, "CHUNK_CHARS", 500)

    async def go():
        db = _db()
        store = airtable_store.AirtableStore(db)
        await store.restore()
        await db.chat_messages.insert_many([{"i": i, "text": "x" * 100} for i in range(30)])
        await store.flush()
        many = len(fake.records)
        await db.chat_messages.delete_many({"i": {"$gte": 2}})
        await store.flush()
        db2 = _db()
        store2 = airtable_store.AirtableStore(db2)
        counts = await store2.restore()
        return many, counts

    many, counts = run(go())
    assert many > 1
    assert counts == {"chat_messages": 2}


def test_failed_restore_never_overwrites_the_saved_copy(fake):
    fake.records["recOld"] = {"Key": "bookings#0", "Data": '[{"id":"b1"}]'}
    fake.fail_list = True

    async def go():
        db = _db()
        store = airtable_store.AirtableStore(db)
        with pytest.raises(RuntimeError):
            await store.restore()
        await db.bookings.insert_one({"id": "new"})
        return await store.flush()

    assert run(go()) == 0
    assert fake.records["recOld"]["Data"] == '[{"id":"b1"}]'
    assert [m for m, _ in fake.calls] == ["GET"]


def test_server_restores_on_boot_and_reports_it_in_health(fake, monkeypatch):
    fake.records["rec1"] = {"Key": "lead_unsubscribes#0", "Data": '[{"email":"old@example.com"}]'}
    monkeypatch.delenv("MONGO_URL", raising=False)
    from fastapi.testclient import TestClient
    import server
    with TestClient(server.app) as c:
        h = c.get("/api/health").json()
        assert h["database"].startswith("in-memory, saved to Airtable")
        assert server._store is not None and server._store.restored
        found = c.portal.call(server.db.lead_unsubscribes.find_one, {"email": "old@example.com"})
        assert found is not None
    assert "token" not in json.dumps(h).lower()
