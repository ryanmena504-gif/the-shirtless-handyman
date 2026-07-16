"""
Lead webhook forwarder — sends every successful customer inquiry to a single
Make.com webhook (which fans out to Airtable, Slack, email, whatever the
scenario configures).

Design contract:
  1. **Fire-and-forget.** Webhook success/failure NEVER blocks the customer.
     The endpoint returns 200 to the browser even if Make is down.
  2. **Exactly one webhook per user submission.** Callers must fire once at
     the boundary of the user-facing endpoint, not from every internal
     `db.leads.insert_one` call. `/api/bookings` fires once for the whole
     submission even though internally it also writes a companion lead doc.
  3. **Uniform payload.** The exact schema the Make/Airtable scenario expects,
     regardless of which entry point (quote form, booking, chat, quick lead)
     created the lead.
  4. **Idempotent-friendly.** Payload includes a unique `lead_id` so Make can
     dedupe if it ever receives the same event twice.
  5. **Debuggable.** The last N send attempts are kept in an in-process ring
     buffer for the `/api/admin/webhook-events` endpoint.

Configure via env: `MAKE_WEBHOOK_URL`. Empty/unset → no-op (warns once).
"""
import asyncio
import logging
import os
from collections import deque
from datetime import datetime, timezone
from typing import Any

import httpx

logger = logging.getLogger(__name__)

WEBHOOK_TIMEOUT = 8.0  # seconds — Make is fast; anything slower means Make is down
MAX_LOG_EVENTS = 25    # ring buffer size for debug endpoint

_recent_events: deque = deque(maxlen=MAX_LOG_EVENTS)
_missing_url_warned = False


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _webhook_url() -> str:
    return (os.environ.get("MAKE_WEBHOOK_URL") or "").strip()


# =====================================================================
# Payload builders — normalize every entrypoint to the same schema
# =====================================================================

_STANDARD_KEYS = (
    "full_name", "phone", "email", "project_address",
    "project_type", "budget", "timeline", "notes",
    "lead_source", "submitted_at",
)


def _empty_payload() -> dict:
    return {k: "" for k in _STANDARD_KEYS}


def build_lead_payload(lead_source: str, *,
                       full_name: str = "",
                       phone: str = "",
                       email: str = "",
                       project_address: str = "",
                       project_type: str = "",
                       budget: str = "",
                       timeline: str = "",
                       notes: str = "",
                       lead_id: str = "",
                       source_endpoint: str = "") -> dict:
    """Build the canonical Make/Airtable payload for one customer submission."""
    payload = _empty_payload()
    payload.update({
        "full_name": (full_name or "").strip(),
        "phone": (phone or "").strip(),
        "email": (email or "").strip(),
        "project_address": (project_address or "").strip(),
        "project_type": (project_type or "").strip(),
        "budget": (budget or "").strip(),
        "timeline": (timeline or "").strip(),
        "notes": (notes or "").strip()[:1000],
        "lead_source": (lead_source or "Website").strip() or "Website",
        "submitted_at": _now_iso(),
    })
    # Non-standard metadata for internal Make debugging — Airtable module
    # picks up whichever columns it maps and ignores the rest.
    if lead_id:
        payload["lead_id"] = lead_id
    if source_endpoint:
        payload["source_endpoint"] = source_endpoint
    return payload


# =====================================================================
# Forwarder — fire-and-forget with ring-buffer logging
# =====================================================================

async def _post_webhook(url: str, payload: dict) -> dict:
    """Actually POST to Make. Returns a small event record for the debug log."""
    started = datetime.now(timezone.utc)
    event: dict[str, Any] = {
        "sent_at": started.isoformat(),
        "lead_source": payload.get("lead_source"),
        "lead_id": payload.get("lead_id"),
        "source_endpoint": payload.get("source_endpoint"),
        "payload": payload,
        "status": None,
        "response_snippet": None,
        "error": None,
    }
    try:
        async with httpx.AsyncClient(timeout=WEBHOOK_TIMEOUT) as client:
            r = await client.post(url, json=payload)
            event["status"] = r.status_code
            event["response_snippet"] = (r.text or "")[:500]
            logger.info(
                "lead_webhook: source=%s endpoint=%s → HTTP %s (%s ms)",
                payload.get("lead_source"),
                payload.get("source_endpoint"),
                r.status_code,
                int((datetime.now(timezone.utc) - started).total_seconds() * 1000),
            )
    except httpx.TimeoutException:
        event["error"] = "timeout"
        logger.warning("lead_webhook: TIMEOUT after %ss for source=%s",
                       WEBHOOK_TIMEOUT, payload.get("lead_source"))
    except Exception as e:  # noqa: BLE001
        event["error"] = str(e)[:300]
        logger.warning("lead_webhook: POST failed for source=%s → %s",
                       payload.get("lead_source"), e)
    return event


def forward_lead(payload: dict) -> None:
    """Fire-and-forget dispatch. Safe to call from any request handler —
    caller is not awaited for the outbound HTTP round-trip. Never raises."""
    global _missing_url_warned
    url = _webhook_url()
    if not url:
        if not _missing_url_warned:
            logger.warning(
                "lead_webhook: MAKE_WEBHOOK_URL is not configured — skipping "
                "webhook forwarding. Set it in backend/.env to enable Make/Airtable."
            )
            _missing_url_warned = True
        _recent_events.appendleft({
            "sent_at": _now_iso(),
            "lead_source": payload.get("lead_source"),
            "lead_id": payload.get("lead_id"),
            "source_endpoint": payload.get("source_endpoint"),
            "payload": payload,
            "status": None,
            "response_snippet": None,
            "error": "MAKE_WEBHOOK_URL not configured",
        })
        return

    async def _run():
        event = await _post_webhook(url, payload)
        _recent_events.appendleft(event)

    # Schedule on the running event loop without awaiting.
    try:
        asyncio.create_task(_run())
    except RuntimeError:
        # No running loop (shouldn't happen inside FastAPI) — run synchronously
        # in a fresh loop so we don't drop the event silently.
        asyncio.run(_run())


def recent_events(limit: int = 25) -> list[dict]:
    """Return the most recent webhook attempts (newest first) for debug UI."""
    return list(_recent_events)[: max(1, min(limit, MAX_LOG_EVENTS))]


def clear_recent_events() -> None:
    _recent_events.clear()
