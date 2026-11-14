"""
Direct Airtable delivery for website leads.

Every website submission (quote form, quick form, QR form, /book calendar,
chat widget) is written as ONE new record in Ryan's GEAUXleads "Leads" table,
so website leads show up in the same place as every other lead.

Design rules:
  * Fire-and-forget: never blocks or fails the visitor's request.
  * ONE attempt per lead. No retry loop. If Airtable rejects a field (HTTP
    422, e.g. a renamed column), a single fallback write with only the name
    and notes is made so the lead is not lost; anything else is logged and
    dropped. The visitor's browser also offers the "Text it to Ryan" backup.
  * The token comes from the AIRTABLE_API_KEY env var on the server only.
    It is never logged or returned by any endpoint.
  * AIRTABLE_DRY_RUN=true logs what would be written instead of sending.

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
from collections import deque
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

DEFAULT_BASE_ID = "appuyAHSSzJrPWlec"
DEFAULT_TABLE_ID = "tbliTlH5mmdOjc280"
SITE_URL = "https://www.theshirtlesshandyman.com"
TIMEOUT = 10.0
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_recent: deque = deque(maxlen=25)
_inflight: set = set()


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


def build_fields(payload: dict) -> dict:
    """Map the canonical lead payload (lead_webhook.build_lead_payload) to
    Leads-table fields."""
    name = payload.get("full_name") or "Website visitor"
    email = (payload.get("email") or "").strip()
    phone = (payload.get("phone") or "").strip()
    when = payload.get("submitted_at") or datetime.now(timezone.utc).isoformat()
    lines = [f"WEBSITE LEAD — {payload.get('lead_source') or 'Website'}"]
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
        "Source": "Website",
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


async def _write(fields: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        return await client.post(
            _endpoint(),
            headers={"Authorization": f"Bearer {_token()}"},
            json={"records": [{"fields": fields}], "typecast": True},
        )


async def push_lead(payload: dict) -> dict:
    """Write one lead. Returns a small event record (no secrets)."""
    fields = build_fields(payload)
    event = {
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "lead_id": payload.get("lead_id"),
        "lead_source": payload.get("lead_source"),
        "status": None,
        "record_id": None,
        "error": None,
        "dry_run": _dry_run(),
    }
    if _dry_run():
        logger.info("airtable_leads DRY RUN → %s fields=%s", _endpoint(), fields)
        event["status"] = "dry_run"
        event["fields"] = fields
        _recent.appendleft(event)
        return event
    if not _token():
        event["error"] = "AIRTABLE_API_KEY not configured"
        _recent.appendleft(event)
        return event
    try:
        r = await _write(fields)
        if r.status_code == 422:
            # A column was renamed/removed. One fallback write with the two
            # most basic fields so the lead still lands. Not a retry loop.
            logger.warning("airtable_leads: 422 %s — writing minimal record", r.text[:300])
            r = await _write({"Leads Name": fields["Leads Name"], "Notes": fields["Notes"]})
        event["status"] = r.status_code
        if r.status_code == 200:
            event["record_id"] = (r.json().get("records") or [{}])[0].get("id")
            logger.info("airtable_leads: saved %s (%s)", event["record_id"], payload.get("lead_source"))
        else:
            event["error"] = (r.text or "")[:300]
            logger.error("airtable_leads: HTTP %s %s", r.status_code, event["error"])
    except Exception as e:  # noqa: BLE001
        event["error"] = f"{type(e).__name__}: {str(e)[:200]}"
        logger.error("airtable_leads: send failed (not retried) → %s", event["error"])
    _recent.appendleft(event)
    return event


def push_lead_background(payload: dict) -> None:
    """Schedule push_lead without awaiting it. Never raises."""
    if not is_configured():
        return
    try:
        task = asyncio.create_task(push_lead(payload))
        _inflight.add(task)
        task.add_done_callback(_inflight.discard)
    except RuntimeError:
        asyncio.run(push_lead(payload))


def recent_events(limit: int = 25) -> list:
    return list(_recent)[: max(1, min(limit, 25))]
