"""
Keep the in-memory database across restarts by saving it to Airtable.

Why: on Render's free plan there is no MONGO_URL, so db_setup.py uses an
in-memory database. Render restarts the free instance whenever it sleeps
(15 idle minutes) or redeploys, and everything stored only in the database
was wiped: booked calendar slots (double-booking risk), the admin inbox,
chat history, scheduled follow-up emails, and email unsubscribes.

How (built to spend as few Airtable API calls as possible, since the Free
Airtable plan allows 1,000 calls a month across the whole workspace):

  * One Airtable record per collection ("chunked" only when a collection's
    JSON passes ~90k characters, Airtable's long-text limit is 100k).
  * Boot: ONE list call (100 records a page) restores every collection
    into the in-memory database before the API serves requests.
  * While running: every SYNC_SECONDS the in-memory collections are
    serialized and compared with what was last saved. Nothing changed ->
    zero calls. Something changed -> one create and/or one update call per
    10 changed records (usually exactly one call).
  * Shutdown (Render sends SIGTERM before sleeping): one final flush.
  * Never retries in a loop; a failed save is logged and tried again on the
    next tick only if the data is still different.
  * Off unless AIRTABLE_STORE_TABLE is set, and never used when MONGO_URL is
    set (a real Mongo already persists). Tokens are never logged.

Large blobs (base64 "data:" images, e.g. portfolio photos) are not saved:
Airtable long text cannot hold them. Those collections are not in the
default list.

Airtable table (create once, in the base named below):
  Key   single line text  (primary field) e.g. "bookings#0"
  Data  long text

Env:
  AIRTABLE_STORE_TABLE        table name or id, e.g. "Website Data" (turns this on)
  AIRTABLE_STORE_BASE_ID      defaults to AIRTABLE_BASE_ID, then the GEAUXleads base
  AIRTABLE_STORE_COLLECTIONS  comma list, defaults to DEFAULT_COLLECTIONS
  AIRTABLE_STORE_SYNC_SECONDS defaults to 20
  AIRTABLE_API_KEY            same token the lead delivery uses
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import httpx
from bson import json_util

import airtable_leads

logger = logging.getLogger(__name__)

DEFAULT_COLLECTIONS = (
    "leads",
    "bookings",
    "chat_messages",
    "availability_rules",
    "availability_blocks",
    "lead_followups",
    "lead_unsubscribes",
)
CHUNK_CHARS = 90_000
BATCH = 10  # Airtable max records per create/update call
TIMEOUT = 15.0
_JSON_OPTS = json_util.JSONOptions(json_mode=json_util.JSONMode.RELAXED, tz_aware=True)


def _env(name: str, default: str = "") -> str:
    return (os.environ.get(name) or default).strip()


def table() -> str:
    return _env("AIRTABLE_STORE_TABLE")


def enabled(in_memory: bool) -> bool:
    return bool(in_memory and table() and airtable_leads._token())


def collections() -> List[str]:
    raw = _env("AIRTABLE_STORE_COLLECTIONS")
    names = [c.strip() for c in raw.split(",") if c.strip()] if raw else list(DEFAULT_COLLECTIONS)
    return names


def sync_seconds() -> float:
    try:
        return max(5.0, float(_env("AIRTABLE_STORE_SYNC_SECONDS", "20")))
    except ValueError:
        return 20.0


def endpoint() -> str:
    base = _env("AIRTABLE_STORE_BASE_ID") or _env("AIRTABLE_BASE_ID") or airtable_leads.DEFAULT_BASE_ID
    return f"https://api.airtable.com/v0/{base}/{quote(table(), safe='')}"


def _headers() -> Dict[str, str]:
    return {"Authorization": f"Bearer {airtable_leads._token()}"}


def _strip_blobs(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _strip_blobs(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_strip_blobs(v) for v in value]
    if isinstance(value, str) and value.startswith("data:") and len(value) > 2000:
        return "[image not saved]"
    return value


def serialize(docs: List[Dict[str, Any]]) -> str:
    return json_util.dumps([_strip_blobs(d) for d in docs], json_options=_JSON_OPTS,
                           sort_keys=True, separators=(",", ":"))


def chunk(text: str) -> List[str]:
    return [text[i:i + CHUNK_CHARS] for i in range(0, len(text), CHUNK_CHARS)] or ["[]"]


class AirtableStore:
    """Mirror selected collections of an in-memory Motor-like db to Airtable."""

    def __init__(self, db: Any) -> None:
        self.db = db
        self.record_ids: Dict[str, str] = {}   # Key -> Airtable record id
        self.saved: Dict[str, str] = {}        # Key -> Data last saved/loaded
        self.calls = 0
        self.last_error: Optional[str] = None
        self._lock = asyncio.Lock()
        self._task: Optional[asyncio.Task] = None
        # Saving is refused until a restore succeeded, so a failed boot read
        # can never overwrite the saved copy with an empty database.
        self.restored = False

    # ------------------------------------------------------------ restore
    async def restore(self) -> Dict[str, int]:
        """Load every saved collection into the in-memory db. Returns counts."""
        rows: List[Dict[str, Any]] = []
        offset: Optional[str] = None
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            while True:
                params: Dict[str, Any] = {"pageSize": 100}
                if offset:
                    params["offset"] = offset
                self.calls += 1
                r = await client.get(endpoint(), headers=_headers(), params=params)
                if r.status_code != 200:
                    raise RuntimeError(f"Airtable list failed: HTTP {r.status_code} {r.text[:200]}")
                body = r.json()
                rows.extend(body.get("records") or [])
                offset = body.get("offset")
                if not offset:
                    break

        parts: Dict[str, Dict[int, str]] = {}
        for rec in rows:
            fields = rec.get("fields") or {}
            key = str(fields.get("Key") or "")
            if "#" not in key:
                continue
            self.record_ids[key] = rec["id"]
            data = fields.get("Data") or ""
            self.saved[key] = data
            name, _, idx = key.rpartition("#")
            if idx.isdigit():
                parts.setdefault(name, {})[int(idx)] = data

        counts: Dict[str, int] = {}
        wanted = set(collections())
        for name, pieces in parts.items():
            if name not in wanted:
                continue
            text = "".join(pieces[i] for i in sorted(pieces))
            if not text.strip():
                continue
            try:
                docs = json_util.loads(text, json_options=_JSON_OPTS)
            except Exception as e:  # noqa: BLE001
                logger.error("Airtable store: could not read %s (%s); left empty", name, type(e).__name__)
                continue
            if docs:
                await self.db[name].delete_many({})
                await self.db[name].insert_many(docs)
            counts[name] = len(docs)
        self.restored = True
        return counts

    # ------------------------------------------------------------ save
    async def _snapshot(self) -> Dict[str, str]:
        out: Dict[str, str] = {}
        for name in collections():
            docs = await self.db[name].find({}).to_list(None)
            pieces = chunk(serialize(docs))
            for i, piece in enumerate(pieces):
                out[f"{name}#{i}"] = piece
            # A collection that shrank leaves its old extra chunks blank.
            i = len(pieces)
            while f"{name}#{i}" in self.saved:
                out[f"{name}#{i}"] = ""
                i += 1
        return out

    async def flush(self) -> int:
        """Save whatever changed. Returns the number of Airtable calls made."""
        if not self.restored:
            return 0
        async with self._lock:
            snap = await self._snapshot()
            changed = {k: v for k, v in snap.items() if self.saved.get(k, None) != v}
            # A brand-new empty collection does not need a record.
            changed = {k: v for k, v in changed.items() if k in self.record_ids or v not in ("", "[]")}
            if not changed:
                return 0
            creates = [k for k in changed if k not in self.record_ids]
            updates = [k for k in changed if k in self.record_ids]
            made = 0
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                for i in range(0, len(creates), BATCH):
                    keys = creates[i:i + BATCH]
                    made += 1
                    r = await client.post(endpoint(), headers=_headers(), json={
                        "records": [{"fields": {"Key": k, "Data": changed[k]}} for k in keys]})
                    if r.status_code != 200:
                        self.last_error = f"create HTTP {r.status_code}"
                        logger.error("Airtable store save failed: HTTP %s %s", r.status_code, r.text[:200])
                        continue
                    for k, rec in zip(keys, r.json().get("records") or []):
                        self.record_ids[k] = rec["id"]
                        self.saved[k] = changed[k]
                for i in range(0, len(updates), BATCH):
                    keys = updates[i:i + BATCH]
                    made += 1
                    r = await client.patch(endpoint(), headers=_headers(), json={
                        "records": [{"id": self.record_ids[k], "fields": {"Data": changed[k]}} for k in keys]})
                    if r.status_code != 200:
                        self.last_error = f"update HTTP {r.status_code}"
                        logger.error("Airtable store save failed: HTTP %s %s", r.status_code, r.text[:200])
                        continue
                    for k in keys:
                        self.saved[k] = changed[k]
            self.calls += made
            return made

    # ------------------------------------------------------------ loop
    async def run(self) -> None:
        while True:
            await asyncio.sleep(sync_seconds())
            try:
                await self.flush()
            except Exception as e:  # noqa: BLE001
                self.last_error = type(e).__name__
                logger.error("Airtable store flush error: %s", type(e).__name__)

    def start(self) -> None:
        self._task = asyncio.create_task(self.run())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
        try:
            await self.flush()
        except Exception as e:  # noqa: BLE001
            logger.error("Airtable store final flush error: %s", type(e).__name__)
