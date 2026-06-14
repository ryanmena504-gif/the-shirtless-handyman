"""
Lead notification helpers — email (Resend) + SMS (Twilio).
Both are graceful: missing credentials log a warning but never break the lead flow.
"""
import os
import asyncio
import logging

logger = logging.getLogger(__name__)


def _build_lead_html(lead: dict) -> str:
    """Build the HTML body for a new-lead notification email."""
    name = lead.get("name") or "(no name)"
    phone = lead.get("phone") or ""
    email = lead.get("email") or ""
    zip_code = lead.get("zip_code") or ""
    description = lead.get("project_description") or ""
    style = lead.get("selected_design_style") or ""
    source = lead.get("source") or "quote_form"
    tel_link = f"tel:{phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')}" if phone else ""
    sms_link = f"sms:{phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')}" if phone else ""

    return f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; background:#FAFAF9; padding:24px; margin:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:#1A3C34; padding:24px 32px; color:#fff;">
    <p style="margin:0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#D97757; font-weight:bold;">New Lead · The Shirtless Handyman</p>
    <h1 style="margin:8px 0 0 0; font-size:24px; font-weight:600; color:#fff;">{name} wants a quote</h1>
    <p style="margin:6px 0 0 0; font-size:13px; color:rgba(255,255,255,0.7);">Source: {source}</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px; color:#1F2A28;">
      <tr><td style="padding:6px 0; color:#666; width:120px;">Phone</td><td style="padding:6px 0; font-weight:600;"><a href="{tel_link}" style="color:#1A3C34; text-decoration:none;">{phone}</a></td></tr>
      <tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0; font-weight:600;"><a href="mailto:{email}" style="color:#1A3C34; text-decoration:none;">{email}</a></td></tr>
      <tr><td style="padding:6px 0; color:#666;">ZIP</td><td style="padding:6px 0; font-weight:600;">{zip_code}</td></tr>
      {f'<tr><td style="padding:6px 0; color:#666;">Design Style</td><td style="padding:6px 0; font-weight:600;">{style}</td></tr>' if style else ''}
      {f'<tr><td style="padding:6px 0; color:#666; vertical-align:top;">Project</td><td style="padding:6px 0;">{description}</td></tr>' if description else ''}
    </table>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
      <td style="padding-right:8px;"><a href="{tel_link}" style="background:#D97757; color:#fff; text-decoration:none; padding:12px 22px; border-radius:999px; font-size:14px; font-weight:600; display:inline-block;">Call back now</a></td>
      <td><a href="{sms_link}" style="background:#1A3C34; color:#fff; text-decoration:none; padding:12px 22px; border-radius:999px; font-size:14px; font-weight:600; display:inline-block;">Text them</a></td>
    </tr></table>
    <p style="margin:24px 0 0 0; font-size:11px; color:#999;">Reminder: respond within 5 minutes to maximize close rate.</p>
  </td></tr>
</table>
</body></html>"""


def _build_lead_sms(lead: dict) -> str:
    """Build a short SMS body for the SMS notification."""
    name = (lead.get("name") or "Lead")[:30]
    phone = lead.get("phone") or "?"
    zip_code = lead.get("zip_code") or "?"
    ptype = (lead.get("project_type") or lead.get("selected_design_style") or "renovation")[:30]
    return f"🚨 New SH lead: {name} · {phone} · ZIP {zip_code} · {ptype}. Respond fast."


def _build_homeowner_autoreply(lead: dict) -> str:
    """Build the friendly homeowner auto-reply SMS body sent right after submission."""
    first_name = (lead.get("name") or "there").split()[0][:20]
    return (
        f"Hey {first_name}, Ryan from The Shirtless Handyman here — got your "
        f"quote request. I'll text you personally within the hour. "
        f"Reply STOP to opt out."
    )


def _parse_calculator_estimate(description: str) -> dict:
    """Pull the finish / sqft / price range out of the calculator's
    `project_description` string (format set by PricingCalculator.js)."""
    import re
    out = {"finish": "", "sqft": "", "price_range": ""}
    if not description:
        return out
    m = re.match(r"Pricing Calculator:\s*([^·]+)·\s*(\d+)\s*sq ft\s*·\s*estimate\s*(.+)", description)
    if m:
        out["finish"] = m.group(1).strip()
        out["sqft"] = m.group(2).strip()
        out["price_range"] = m.group(3).strip()
    return out


def _build_estimate_confirmation_html(lead: dict) -> str:
    """Customer-facing email confirming the estimate they just generated
    on the pricing calculator. Sent to the visitor's own inbox via Resend."""
    first_name = (lead.get("name") or "there").split()[0][:30]
    parsed = _parse_calculator_estimate(lead.get("project_description") or "")
    finish = parsed["finish"] or (lead.get("project_type") or "your project")
    sqft = parsed["sqft"]
    price_range = parsed["price_range"] or "(see below)"
    return f"""<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; background:#FAFAF9; padding:24px; margin:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:#0E0E0E; padding:30px 32px; color:#fff;">
    <p style="margin:0; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#D97757; font-weight:bold;">Your Estimate · The Shirtless Handyman</p>
    <h1 style="margin:10px 0 0 0; font-size:28px; font-weight:300; color:#fff; font-family: Georgia, serif;">Here&rsquo;s your quote, {first_name}.</h1>
  </td></tr>
  <tr><td style="padding:30px 32px;">
    <p style="margin:0 0 18px 0; font-size:15px; color:#1F2A28; line-height:1.55;">
      Thanks for trying the calculator. Here&rsquo;s a snapshot of what you just priced — keep this for reference, forward it to your partner, or hit reply with questions.
    </p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2; border-radius:12px; padding:6px; margin:18px 0;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#666; font-weight:bold;">Finish</p>
        <p style="margin:0 0 14px 0; font-size:18px; color:#1F2A28; font-weight:600;">{finish}</p>
        {f'<p style="margin:0 0 4px 0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#666; font-weight:bold;">Project Size</p><p style="margin:0 0 14px 0; font-size:18px; color:#1F2A28; font-weight:600;">{sqft} sq ft</p>' if sqft else ''}
        <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#666; font-weight:bold;">Estimated Range</p>
        <p style="margin:0; font-size:30px; color:#0E0E0E; font-family: Georgia, serif; font-weight:300;">{price_range}</p>
      </td></tr>
    </table>
    <p style="margin:18px 0; font-size:13px; color:#555; line-height:1.6;">
      <strong>What&rsquo;s included:</strong> substrate prep + bonding primer, premium materials &amp; pigment, 5&ndash;7 hand-applied layers, topcoat sealing for a 10-year finish.
    </p>
    <p style="margin:18px 0; font-size:13px; color:#555; line-height:1.6;">
      <strong>What&rsquo;s next:</strong> I&rsquo;ll text you within the hour to confirm the details and offer a free in-person walkthrough. The final quote is locked in after I see the space.
    </p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
      <td style="padding-right:8px;"><a href="sms:5042644919?body=Hey%20Ryan%2C%20I%20just%20got%20my%20estimate%20and%20want%20to%20talk." style="background:#D97757; color:#fff; text-decoration:none; padding:13px 24px; border-radius:999px; font-size:14px; font-weight:600; display:inline-block;">Text Ryan now</a></td>
      <td><a href="tel:5042644919" style="background:#0E0E0E; color:#fff; text-decoration:none; padding:13px 24px; border-radius:999px; font-size:14px; font-weight:600; display:inline-block;">Call 504-264-4919</a></td>
    </tr></table>
    <p style="margin:30px 0 0 0; font-size:12px; color:#999; line-height:1.5;">
      &mdash; Ryan Mena<br/>The Shirtless Handyman &middot; Greater New Orleans<br/>
      <a href="https://theshirtlesshandyman.com" style="color:#D97757; text-decoration:none;">theshirtlesshandyman.com</a>
    </p>
  </td></tr>
</table>
</body></html>"""


async def send_estimate_confirmation(lead: dict) -> bool:
    """Send the visitor a copy of their pricing-calculator estimate via Resend."""
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()
    to_email = (lead.get("email") or "").strip()

    if not api_key:
        logger.info("Estimate confirmation skipped — RESEND_API_KEY not configured")
        return False
    if not to_email or "@" not in to_email:
        logger.info("Estimate confirmation skipped — no homeowner email on the lead")
        return False
    if (lead.get("source") or "") != "pricing_calculator":
        return False

    try:
        import resend
        resend.api_key = api_key
        first_name = (lead.get("name") or "there").split()[0][:30]
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": f"Your renovation estimate, {first_name} — The Shirtless Handyman",
            "html": _build_estimate_confirmation_html(lead),
            "reply_to": os.environ.get("LEAD_NOTIFICATION_EMAIL", "").strip() or None,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Estimate confirmation sent (id={result.get('id')}) to {to_email}")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Estimate confirmation failed: {type(e).__name__}: {e}")
        return False


async def send_lead_email(lead: dict) -> bool:
    """Send the lead notification via Resend. Returns True on success."""
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    to_email = os.environ.get("LEAD_NOTIFICATION_EMAIL", "").strip()
    from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()

    if not api_key:
        logger.warning("Lead email skipped — RESEND_API_KEY is not configured")
        return False
    if not to_email:
        logger.warning("Lead email skipped — LEAD_NOTIFICATION_EMAIL is not configured")
        return False

    try:
        import resend
        resend.api_key = api_key
        subject = f"🔔 New lead: {lead.get('name', 'Homeowner')} ({lead.get('phone', 'no phone')})"
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": _build_lead_html(lead),
            "reply_to": lead.get("email") or None,
        }
        # Resend SDK is sync — run in a thread to keep FastAPI non-blocking.
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Lead email sent (id={result.get('id')}) to {to_email}")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Lead email failed: {type(e).__name__}: {e}")
        return False


async def send_lead_sms(lead: dict) -> bool:
    """Send the lead notification via Twilio SMS. Returns True on success."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    token = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    from_num = os.environ.get("TWILIO_FROM_NUMBER", "").strip()
    to_num = os.environ.get("LEAD_NOTIFICATION_PHONE", "").strip()

    if not (sid and token and from_num and to_num):
        logger.warning("Lead SMS skipped — Twilio not fully configured")
        return False

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        body = _build_lead_sms(lead)
        msg = await asyncio.to_thread(
            lambda: client.messages.create(body=body, from_=from_num, to=to_num)
        )
        logger.info(f"Lead SMS sent (sid={msg.sid}) to {to_num}")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Lead SMS failed: {type(e).__name__}: {e}")
        return False


def _normalize_phone(raw: str) -> str:
    """Best-effort E.164 normalization for US numbers."""
    digits = "".join(ch for ch in (raw or "") if ch.isdigit())
    if not digits:
        return ""
    if digits.startswith("1") and len(digits) == 11:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+1{digits}"
    if raw.startswith("+"):
        return raw
    return f"+{digits}"


async def send_homeowner_autoreply(lead: dict) -> bool:
    """Send a friendly auto-reply SMS to the homeowner's own phone the moment they submit."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    token = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    from_num = os.environ.get("TWILIO_FROM_NUMBER", "").strip()
    to_num = _normalize_phone(lead.get("phone", ""))

    if not (sid and token and from_num):
        logger.warning("Homeowner auto-reply skipped — Twilio not configured")
        return False
    if not to_num:
        logger.info("Homeowner auto-reply skipped — lead phone missing/invalid")
        return False

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        body = _build_homeowner_autoreply(lead)
        msg = await asyncio.to_thread(
            lambda: client.messages.create(body=body, from_=from_num, to=to_num)
        )
        logger.info(f"Homeowner auto-reply sent (sid={msg.sid}) to {to_num}")
        return True
    except Exception as e:  # noqa: BLE001
        logger.error(f"Homeowner auto-reply failed: {type(e).__name__}: {e}")
        return False


async def notify_new_lead(lead: dict) -> None:
    """Fire-and-forget: email Ryan + SMS Ryan + SMS auto-reply to homeowner +
    (for pricing-calculator leads only) email the homeowner a copy of their
    estimate — all in parallel."""
    await asyncio.gather(
        send_lead_email(lead),
        send_lead_sms(lead),
        send_homeowner_autoreply(lead),
        send_estimate_confirmation(lead),
        return_exceptions=True,
    )
