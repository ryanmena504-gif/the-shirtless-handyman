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


async def notify_new_lead(lead: dict) -> None:
    """Fire-and-forget: send both email and SMS notifications in parallel."""
    await asyncio.gather(send_lead_email(lead), send_lead_sms(lead), return_exceptions=True)
