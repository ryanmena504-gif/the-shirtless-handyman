"""
Direct Airtable delivery for website leads.

Every website submission (quote form, quick form, QR form, /book calendar,
chat widget) is written as ONE new record in Ryan's GEAUXleads "Leads" table,
so website leads show up in the same place as every other lead.

Design rules:
  * Fire-and-forget: never blocks or fails the visitor's request.
  * The durable write is the main path. If Airtable is down, rejects the
    record, or AIRTABLE_API_KEY is missing, the lead is logged at error level
    (no token) and kept in an in-memory queue that retries with backoff for
    the life of this process. A restart clears that queue; the error log is
    the copy that survives a crash.
  * A 422 (unknown field) still does one immediate fallback write with only
    the name and notes, then queues if that also fails.
  * The token comes from the AIRTABLE_API_KEY env var on the server only.
    It is never logged or returned by any endpoint.
  * AIRTABLE_DRY_RUN=true logs what would be written instead of sending.
    Dry runs are not queued.

Env:
  AIRTABLE_API_KEY         personal access token with data.records:write on the base
  AIRTABLE_BASE_ID         default appuyAHSSzJrPWlec (GEAUXleads)
  AIRTABLE_LEADS_TABLE_ID  default tbliTlH5mmdOjc280 (Leads)
  AIRTABLE_DRY_RUN         "true" to log instead of writing
"""
import asyncio
import logging
import os
import re
import time
import uuid
from collections import deque
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

DEFAULT_BASE_ID = "appuyAHSSzJrPWlec"
DEFAULT_TABLE_ID = "tbliTlH5mmdOjc280"
SITE_URL = "https://www.theshirtlesshandyman.com"
# Source is the existing Leads single-select choice. The specific form
# (quote, hero, booking, …) is in Notes, which is what the Airtable
# "Website lead → email Ryan" automation matches on ("WEBSITE LEAD").
SOURCE_CHOICE = "Website"
TIMEOUT = 10.0
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# First retry soon, then back off. The queue lives only in this process.
_BACKOFF_SECONDS = (20, 60, 180, 600, 1800)
_MAX_PENDING = 500

_recent: deque = deque(maxlen=25)
_inflight: set = set()
_pending: dict = {}
_retry_task: asyncio.Task | None = None
_wake: asyncio.Event | None = None


def _token() -> str:
    return (os.environ.get("AIRTABLE_API_KEY") or os.environ.get("AIRTABLE_TOKEN") or "").strip()


def is_configured() -> bool:
    return bool(_token()) or _dry_run()


def _dry_run() -> bool:
    return (os.environ.get("AIRTABLE_DRY_RUN") or "").strip().lower() in ("1", "true", "yes")


def _endpoint() -> str:
    base = (os.environ.get("AIRTABLE_BASE_ID") or DEFAULT_BASE_ID).strip()
    table = (os.environ.get("AIRTABLE_LEADS_TABLE_ID") or DEFAULT_TABLE_ID).strip()
    return f"https://api.airtable.com/v0/{base}/{table}"


def pending_count() -> int:
    return len(_pending)


def build_fields(payload: dict) -> dict:
    """Map the canonical lead payload (lead_webhook.build_lead_payload) to
    Leads-table fields. Contact phone / Contact email are the live columns
    GEAUXleads writes; Phone number and Email are the deprecated ones."""
    name = payload.get("full_name") or "Website visitor"
    email = (payload.get("email") or "").strip()
    phone = (payload.get("phone") or "").strip()
    when = payload.get("submitted_at") or datetime.now(timezone.utc).isoformat()
    lines = [f"WEBSITE LEAD — {payload.get('lead_source') or 'Website form'}"]
    if payload.get("project_type"):
        lines.append(f"Project: {payload['project_type']}")
    if payload.get("project_address"):
        lines.append(f"ZIP / address: {payload['project_address']}")
    if phone:
        lines.append(f"Phone: {phone}")
    if email:
        lines.append(f"Email: {email}")
    if payload.get("notes"):
        lines.append(f"Notes: {payload['notes']}")
    lines.append(f"Submitted: {when}")
    fields = {
        "Leads Name": name,
        "Contact name": name,
        "Source": SOURCE_CHOICE,
        "Source URL": SITE_URL,
        "Status": "New",
        "Notes": "\n".join(lines),
    }
    if payload.get("lead_id"):
        fields["ID"] = payload["lead_id"]
    if payload.get("project_address"):
        fields["Address"] = payload["project_address"]
    if phone:
        fields["Contact phone"] = phone
    if email and _EMAIL_RE.match(email):
        fields["Contact email"] = email
    return fields


def _queue_key(payload: dict) -> str:
    lead_id = str(payload.get("lead_id") or "").strip()
    if lead_id:
        return lead_id
    key = str(payload.get("_queue_key") or "").strip()
    if not key:
        key = uuid.uuid4().hex
        payload["_queue_key"] = key
    return key


def _backoff(attempts: int) -> float:
    idx = min(max(attempts, 0), len(_BACKOFF_SECONDS) - 1)
    return float(_BACKOFF_SECONDS[idx])


def _log_unsaved(payload: dict, error: str) -> None:
    logger.error(
        "airtable_leads: lead NOT saved (queued for retry, %d pending) "
        "lead_id=%s source=%s name=%s phone=%s email=%s error=%s",
        len(_pending),
        payload.get("lead_id") or "",
        payload.get("lead_source") or "",
        payload.get("full_name") or "",
        payload.get("phone") or "",
        payload.get("email") or "",
        error,
    )


def _drop_oldest_if_full() -> None:
    if len(_pending) < _MAX_PENDING:
        return
    dropped_key = next(iter(_pending))
    dropped = _pending.pop(dropped_key)
    body = dropped.get("payload") or {}
    logger.error(
        "airtable_leads: retry queue full (%d); dropping oldest queued lead "
        "lead_id=%s source=%s name=%s phone=%s email=%s last_error=%s",
        _MAX_PENDING,
        body.get("lead_id") or "",
        body.get("lead_source") or "",
        body.get("full_name") or "",
        body.get("phone") or "",
        body.get("email") or "",
        dropped.get("error") or "",
    )


def _enqueue(payload: dict, error: str) -> None:
    stored = dict(payload)
    key = _queue_key(stored)
    prev = _pending.get(key)
    if prev is None:
        _drop_oldest_if_full()
    attempts = prev["attempts"] if prev else 0
    _pending[key] = {
        "payload": stored,
        "attempts": attempts,
        "next_at": time.monotonic() + _backoff(attempts),
        "error": error,
    }
    _log_unsaved(stored, error)
    _ensure_retry_loop()


def _saved(event: dict) -> bool:
    if event.get("dry_run"):
        return True
    return event.get("status") == 200


async def _write(fields: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        return await client.post(
            _endpoint(),
            headers={"Authorization": f"Bearer {_token()}"},
            json={"records": [{"fields": fields}], "typecast": True},
        )


def _blank_event(payload: dict) -> dict:
    return {
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "lead_id": payload.get("lead_id"),
        "lead_source": payload.get("lead_source"),
        "status": None,
        "record_id": None,
        "error": None,
        "dry_run": _dry_run(),
    }


async def _deliver(payload: dict) -> dict:
    """One delivery attempt. Does not queue or raise."""
    fields = build_fields(payload)
    event = _blank_event(payload)
    if _dry_run():
        logger.info("airtable_leads DRY RUN → %s fields=%s", _endpoint(), fields)
        event["status"] = "dry_run"
        event["fields"] = fields
        return event
    if not _token():
        event["error"] = "AIRTABLE_API_KEY not configured"
        return event
    try:
        r = await _write(fields)
        if r.status_code == 422:
            # A column was renamed or removed. One fallback write with the two
            # most basic fields so the lead still lands. Not a tight loop.
            logger.warning("airtable_leads: 422 %s — writing minimal record", r.text[:300])
            r = await _write({"Leads Name": fields["Leads Name"], "Notes": fields["Notes"]})
        event["status"] = r.status_code
        if r.status_code == 200:
            event["record_id"] = (r.json().get("records") or [{}])[0].get("id")
            logger.info(
                "airtable_leads: saved %s (%s)",
                event["record_id"],
                payload.get("lead_source"),
            )
        else:
            event["error"] = (r.text or "")[:300]
            logger.error("airtable_leads: HTTP %s %s", r.status_code, event["error"])
    except Exception as e:  # noqa: BLE001
        event["error"] = f"{type(e).__name__}: {str(e)[:200]}"
        logger.error("airtable_leads: send failed → %s", event["error"])
    return event


async def push_lead(payload: dict) -> dict:
    """Write one lead. On failure, queue it for a later retry. Never raises."""
    event = await _deliver(payload)
    if _saved(event):
        lead_id = str(payload.get("lead_id") or "").strip()
        if lead_id:
            _pending.pop(lead_id, None)
    else:
        _enqueue(payload, event.get("error") or f"HTTP {event.get('status')}")
    _recent.appendleft(event)
    return event


async def retry_pending() -> list:
    """Try every queued lead whose backoff has elapsed. One attempt each."""
    now = time.monotonic()
    due = [key for key, item in list(_pending.items()) if item["next_at"] <= now]
    results = []
    for key in due:
        item = _pending.get(key)
        if not item:
            continue
        event = await _deliver(item["payload"])
        _recent.appendleft(event)
        results.append(event)
        if _saved(event):
            _pending.pop(key, None)
            logger.info("airtable_leads: retry saved %s", event.get("record_id"))
        else:
            item["attempts"] = item["attempts"] + 1
            item["error"] = event.get("error") or f"HTTP {event.get('status')}"
            item["next_at"] = time.monotonic() + _backoff(item["attempts"])
            _log_unsaved(item["payload"], item["error"])
    return results


def _ensure_retry_loop() -> None:
    global _retry_task
    if not _pending:
        return
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return
    if _retry_task is not None and not _retry_task.done():
        if _wake is not None:
            _wake.set()
        return
    _retry_task = asyncio.create_task(_retry_loop())
    _inflight.add(_retry_task)
    _retry_task.add_done_callback(_inflight.discard)


async def _retry_loop() -> None:
    """Sleep until the next queued lead is due, then try it. Exits when empty."""
    global _wake
    _wake = asyncio.Event()
    try:
        while _pending:
            _wake.clear()
            now = time.monotonic()
            delay = max(0.0, min(item["next_at"] - now for item in _pending.values()))
            if delay > 0:
                try:
                    await asyncio.wait_for(_wake.wait(), timeout=delay)
                except asyncio.TimeoutError:
                    pass
            await retry_pending()
    except asyncio.CancelledError:
        raise


def push_lead_background(payload: dict) -> None:
    """Schedule push_lead without awaiting it. Never raises.

    An unconfigured or failing Airtable still queues the lead. The visitor
    request is never failed from here."""
    async def _run():
        try:
            await push_lead(payload)
        except Exception as e:  # noqa: BLE001
            logger.error("airtable_leads: background push crashed: %s", e)
            _enqueue(payload, f"{type(e).__name__}: {e}")

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        try:
            asyncio.run(_run())
        except Exception as e:  # noqa: BLE001
            logger.error("airtable_leads: background push crashed: %s", e)
            _enqueue(payload, f"{type(e).__name__}: {e}")
        return

    task = asyncio.create_task(_run())
    _inflight.add(task)
    task.add_done_callback(_inflight.discard)


def recent_events(limit: int = 25) -> list:
    return list(_recent)[: max(1, min(limit, 25))]
