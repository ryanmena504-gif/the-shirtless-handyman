"""
Lead follow-up sequence — 3 emails over 5 days for any lead that gave an email.

Schedule (relative to lead creation):
  Day 1 (+24h)  — "Did you try the Studio yet?" gentle nudge
  Day 3 (+72h)  — "Real NOLA project we just finished" social proof
  Day 5 (+120h) — "If now isn't the right time…" soft close + 5% offer

Mechanism: each lead with an email gets 3 rows inserted into `lead_followups`.
A background polling task in server.py runs every 5 min, picks rows where
`send_at <= now` and `status == 'pending'`, sends via Resend, marks them sent.

Unsubscribe: each email contains a one-click unsubscribe URL. We store an
opt-out by email address in `lead_unsubscribes` and skip sends for those.
"""
import os
import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# Send the three follow-ups in this order. `delay_hours` is from lead creation.
FOLLOWUP_PLAN = [
    {"step": 1, "delay_hours": 24,  "template": "day1_nudge"},
    {"step": 2, "delay_hours": 72,  "template": "day3_social_proof"},
    {"step": 3, "delay_hours": 120, "template": "day5_soft_close"},
]


def _unsub_url(token: str) -> str:
    base = os.environ.get("SITE_BASE_URL", "https://theshirtlesshandyman.com").rstrip("/")
    return f"{base}/api/followups/unsubscribe/{token}"


def _email_shell(inner_html: str, unsub_url: str) -> str:
    return f"""<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;background:#FAFAF9;padding:24px;margin:0;color:#1F2A28;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
{inner_html}
<tr><td style="padding:18px 32px 26px 32px;border-top:1px solid #EEEAE0;">
<p style="margin:0;font-size:11px;color:#999;line-height:1.5;">
— Ryan Mena · The Shirtless Handyman · New Orleans<br/>
<a href="https://theshirtlesshandyman.com" style="color:#D97757;text-decoration:none;">theshirtlesshandyman.com</a> · 504-264-4919
</p>
<p style="margin:14px 0 0 0;font-size:10px;color:#bbb;line-height:1.5;">
You're getting this because you requested a quote or tried the Seamless Studio.<br/>
<a href="{unsub_url}" style="color:#bbb;text-decoration:underline;">Unsubscribe</a> from these follow-ups.
</p></td></tr>
</table></body></html>"""


def _build_day1(name: str, unsub_url: str) -> dict:
    first = name.split()[0][:30] if name else "there"
    body = f"""<tr><td style="background:#0E0E0E;padding:30px 32px;color:#fff;">
<p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D97757;font-weight:bold;">Following up</p>
<h1 style="margin:10px 0 0 0;font-size:26px;font-weight:300;color:#fff;font-family:Georgia,serif;">Did you get a chance to try the Studio, {first}?</h1>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px 0;">It's Ryan. Wanted to make sure my last text didn't get buried.</p>
<p style="margin:0 0 14px 0;">If you haven't yet, take 60 seconds and drop a photo of your bathroom into <a href="https://theshirtlesshandyman.com/upload" style="color:#D97757;font-weight:600;text-decoration:none;">The Seamless Studio</a> — you'll see your actual room rendered in microcement, tadelakt, or rockscape. No commitment. No spam. Just shows you what's possible before we even talk.</p>
<p style="margin:0 0 14px 0;">When you're ready to chat real numbers, hit reply or text me at 504-264-4919.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
<td><a href="https://theshirtlesshandyman.com/upload" style="background:#D97757;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">Try the Studio (free)</a></td>
</tr></table></td></tr>"""
    return {
        "subject": f"Quick follow-up on your renovation, {first}",
        "html": _email_shell(body, unsub_url),
    }


def _build_day3(name: str, unsub_url: str) -> dict:
    first = name.split()[0][:30] if name else "there"
    body = f"""<tr><td style="background:#1A3C34;padding:30px 32px;color:#fff;">
<p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D97757;font-weight:bold;">From the workshop</p>
<h1 style="margin:10px 0 0 0;font-size:26px;font-weight:300;color:#fff;font-family:Georgia,serif;">A NOLA bathroom we just finished, {first}.</h1>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px 0;">Wanted to share what we wrapped up this week — a microcement walk-in shower in a Lakeview shotgun.</p>
<p style="margin:0 0 14px 0;">The homeowners had 90s tile with cracked grout that kept growing mold every summer. We bonded microcement directly to the existing tile (no demolition), color-tinted it to a warm bone, and sealed it in two coats. Six days, start to finish. No more grout to scrub. One continuous waterproof shell.</p>
<p style="margin:0 0 14px 0;">If you've been on the fence because demolition felt overwhelming — this is what makes microcement different. Most of my NOLA jobs don't lose a single tile.</p>
<p style="margin:0 0 14px 0;">You can see the full portfolio here: <a href="https://theshirtlesshandyman.com/portfolio" style="color:#D97757;font-weight:600;text-decoration:none;">theshirtlesshandyman.com/portfolio</a>.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
<td style="padding-right:8px;"><a href="https://theshirtlesshandyman.com/portfolio" style="background:#D97757;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">See the project</a></td>
<td><a href="sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20ready%20to%20talk%20about%20my%20project." style="background:#0E0E0E;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">Text Ryan</a></td>
</tr></table></td></tr>"""
    return {
        "subject": "A real NOLA microcement project — fresh off the trowel",
        "html": _email_shell(body, unsub_url),
    }


def _build_day5(name: str, unsub_url: str) -> dict:
    first = name.split()[0][:30] if name else "there"
    body = f"""<tr><td style="background:#0E0E0E;padding:30px 32px;color:#fff;">
<p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D97757;font-weight:bold;">Last note from Ryan</p>
<h1 style="margin:10px 0 0 0;font-size:26px;font-weight:300;color:#fff;font-family:Georgia,serif;">If now isn't the right time, {first} — no pressure.</h1>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px 0;">Last note from me, promise. I know renovation timing is rarely simple — budgets, schedules, family — so I never want to push.</p>
<p style="margin:0 0 14px 0;">If you're still kicking the idea around, here are two small things that might help:</p>
<ul style="margin:0 0 14px 18px;padding:0;font-size:15px;line-height:1.6;">
  <li><strong>Lock in 2026 pricing:</strong> book a quote this month and I'll honor today's rate for an install up to 90 days out.</li>
  <li><strong>5% off your final invoice</strong> if you mention this email when you book.</li>
</ul>
<p style="margin:0 0 14px 0;">Otherwise, no hard feelings — I'll stop sending these emails. If your timing shifts later this year, you know where to find me.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
<td style="padding-right:8px;"><a href="sms:5042644919?body=Hey%20Ryan%2C%20locking%20in%20the%205%25%20off%20from%20your%20email." style="background:#D97757;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">Lock in the 5% off</a></td>
<td><a href="tel:5042644919" style="background:#1A3C34;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">Call 504-264-4919</a></td>
</tr></table></td></tr>"""
    return {
        "subject": f"Final note from Ryan — and a small offer, {first}",
        "html": _email_shell(body, unsub_url),
    }


TEMPLATES = {
    "day1_nudge": _build_day1,
    "day3_social_proof": _build_day3,
    "day5_soft_close": _build_day5,
    "post_visit_review": lambda name, unsub: _build_post_visit_review(name, unsub),
}


REVIEW_URL = "https://g.page/r/CZgh4ltLoG1SEBI/review"


def _build_post_visit_review(name: str, unsub_url: str) -> dict:
    first = name.split()[0][:30] if name else "there"
    body = f"""<tr><td style="background:#0E0E0E;padding:30px 32px;color:#fff;">
<p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D97757;font-weight:bold;">Quick favor</p>
<h1 style="margin:10px 0 0 0;font-size:26px;font-weight:300;color:#fff;font-family:Georgia,serif;">30 seconds could really help me, {first}.</h1>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px 0;">Hope everything went well with the visit. I'm working on getting the business more visible on Google and AI search — and honest customer reviews are the single biggest lever for that.</p>
<p style="margin:0 0 14px 0;">If you have 30 seconds, would you leave an honest Google review? Even one line means the world to a one-person shop like mine.</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr>
<td><a href="{REVIEW_URL}" style="background:#D97757;color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px;font-weight:600;display:inline-block;">Leave a Google review →</a></td>
</tr></table>
<p style="margin:22px 0 0 0;font-size:13px;color:#666;">Not the right time? No worries at all — reply anytime with feedback and I'll take it straight to heart. — Ryan</p></td></tr>"""
    return {
        "subject": f"Quick favor, {first} — 30-second Google review?",
        "html": _email_shell(body, unsub_url),
    }


async def ensure_indexes(db) -> None:
    """Indexes that speed up the polling worker."""
    try:
        await db.lead_followups.create_index([("status", 1), ("send_at", 1)])
        await db.lead_followups.create_index("lead_id")
        await db.lead_unsubscribes.create_index("email", unique=True)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Could not ensure followup indexes: {e}")


async def schedule_followups(db, lead: dict) -> None:
    """Insert 3 pending followup rows for a newly created lead.
    Skips silently if the lead has no email OR has already unsubscribed."""
    email = (lead.get("email") or "").strip().lower()
    if not email or "@" not in email:
        return
    unsub = await db.lead_unsubscribes.find_one({"email": email})
    if unsub:
        return

    now = datetime.now(timezone.utc)
    docs = []
    for step in FOLLOWUP_PLAN:
        docs.append({
            "id": str(uuid.uuid4()),
            "lead_id": lead.get("id"),
            "email": email,
            "name": lead.get("name") or "",
            "template": step["template"],
            "step": step["step"],
            "send_at": now + timedelta(hours=step["delay_hours"]),
            "status": "pending",
            "unsub_token": str(uuid.uuid4()),
            "created_at": now,
            "sent_at": None,
            "error": "",
        })
    try:
        await db.lead_followups.insert_many(docs)
        logger.info(f"Scheduled {len(docs)} follow-ups for lead {lead.get('id')} <{email}>")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Failed to schedule follow-ups for {email}: {e}")


async def schedule_post_visit_review(db, booking: dict) -> None:
    """After a booked appointment happens, ask the customer for a Google review.
    Sends 2 days after the slot_start_utc so the memory is fresh but not intrusive.
    Skips if there's no email, if unsubscribed, or if the booking has no slot."""
    email = (booking.get("email") or "").strip().lower()
    if not email or "@" not in email:
        return
    slot_start = booking.get("slot_start_utc")
    if not slot_start:
        # Chat quick-book without a canonical slot — skip; we don't know when the visit happened
        return
    unsub = await db.lead_unsubscribes.find_one({"email": email})
    if unsub:
        return

    now = datetime.now(timezone.utc)
    send_at = slot_start + timedelta(days=2)
    if send_at < now:
        send_at = now + timedelta(minutes=5)  # slot already passed — fire on next worker tick

    doc = {
        "id": str(uuid.uuid4()),
        "lead_id": booking.get("id"),
        "email": email,
        "name": booking.get("name") or "",
        "template": "post_visit_review",
        "step": 99,
        "send_at": send_at,
        "status": "pending",
        "unsub_token": str(uuid.uuid4()),
        "created_at": now,
        "sent_at": None,
        "error": "",
    }
    try:
        await db.lead_followups.insert_one(doc)
        logger.info(f"Scheduled post-visit review request for booking {booking.get('id')} <{email}> at {send_at.isoformat()}")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Failed to schedule review request for {email}: {e}")


async def _send_one(row: dict) -> bool:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()
    if not api_key:
        return False
    builder = TEMPLATES.get(row["template"])
    if not builder:
        return False

    msg = builder(row.get("name") or "", _unsub_url(row["unsub_token"]))
    try:
        import resend
        resend.api_key = api_key
        params = {
            "from": from_email,
            "to": [row["email"]],
            "subject": msg["subject"],
            "html": msg["html"],
            "reply_to": os.environ.get("LEAD_NOTIFICATION_EMAIL", "").strip() or None,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Follow-up {row['template']} sent to {row['email']} (id={result.get('id')})")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Follow-up send failed for {row['email']} ({row['template']}): {e}")
        return False


async def process_due_followups(db) -> int:
    """Polled by the background worker. Sends every pending row whose send_at
    has passed. Returns count of attempted sends."""
    now = datetime.now(timezone.utc)
    cursor = db.lead_followups.find(
        {"status": "pending", "send_at": {"$lte": now}},
        {"_id": 0},
    ).limit(50)
    sent = 0
    async for row in cursor:
        # Honor unsubscribes that landed after scheduling.
        unsub = await db.lead_unsubscribes.find_one({"email": row["email"]})
        if unsub:
            await db.lead_followups.update_one(
                {"id": row["id"]},
                {"$set": {"status": "skipped_unsubscribed", "sent_at": now}},
            )
            continue
        ok = await _send_one(row)
        await db.lead_followups.update_one(
            {"id": row["id"]},
            {"$set": {
                "status": "sent" if ok else "failed",
                "sent_at": datetime.now(timezone.utc),
                "error": "" if ok else "send_failed",
            }},
        )
        if ok:
            sent += 1
    return sent


async def unsubscribe_by_token(db, token: str) -> Optional[str]:
    """Used by the GET /api/followups/unsubscribe/{token} endpoint.
    Returns the email that was unsubscribed (or None if token not found)."""
    row = await db.lead_followups.find_one({"unsub_token": token}, {"_id": 0})
    if not row:
        return None
    email = (row.get("email") or "").lower()
    if not email:
        return None
    await db.lead_unsubscribes.update_one(
        {"email": email},
        {"$set": {"email": email, "unsubscribed_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    # Mark all the lead's still-pending rows as skipped so the worker won't fire them.
    await db.lead_followups.update_many(
        {"email": email, "status": "pending"},
        {"$set": {"status": "skipped_unsubscribed"}},
    )
    return email


async def background_worker(db, interval_seconds: int = 300) -> None:
    """Long-running task started in server.py's startup event. Runs forever."""
    await ensure_indexes(db)
    logger.info(f"Follow-up worker started (interval={interval_seconds}s)")
    while True:
        try:
            n = await process_due_followups(db)
            if n:
                logger.info(f"Follow-up worker: sent {n} email(s) this cycle")
        except Exception as e:  # noqa: BLE001
            logger.exception(f"Follow-up worker iteration failed: {e}")
        await asyncio.sleep(interval_seconds)
