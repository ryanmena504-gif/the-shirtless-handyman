"""
Self-serve scheduling — availability computation + slot reservation.

Rules (owner-configurable later via admin):
  - Working days: Monday through Saturday (Sunday closed)
  - Working hours: 08:00–17:00 local (America/Chicago)
  - Slot length: 60 minutes, on-the-hour starts (8, 9, 10, ..., 16 → last start is 16:00)
  - Booking window: next 60 days from today
  - Same-day booking cutoff: 2 hours before the slot

Availability is computed on-demand from:
  1. The static rules above (no separate DB row required for the common case).
  2. `db.availability_blocks` — one-off blocked ranges (vacation, on-site jobs, etc.).
  3. `db.bookings` — slots already reserved (any status except 'cancelled').

The returned "slots" list has ISO datetime strings in America/Chicago local time
(with offset) so the frontend can render them without needing tz math.
"""
from datetime import datetime, timedelta, time, timezone
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# ---- Config (Mon=0, Sun=6) ------------------------------------------------
WORKING_WEEKDAYS = {0, 1, 2, 3, 4, 5}  # Mon–Sat
WORK_START_HOUR = 8
WORK_END_HOUR = 17           # last slot starts at 16:00 (ends at 17:00)
SLOT_MINUTES = 60
BOOKING_WINDOW_DAYS = 60
SAME_DAY_CUTOFF_HOURS = 2

APPOINTMENT_TYPES = [
    {"id": "walkthrough", "label": "Free in-home walkthrough",     "duration": 60},
    {"id": "phone",       "label": "Phone consult",                "duration": 60},
    {"id": "site_prep",   "label": "Site prep / measurements",     "duration": 60},
    {"id": "project",     "label": "Project start (multi-day)",    "duration": 60},
]

# America/Chicago (NOLA). Fixed CST/CDT offset — we return ISO strings with the
# UTC offset baked in, so we don't need pytz/zoneinfo at query time.
# Approximation: DST-aware via zoneinfo (Python 3.9+ standard lib).
try:
    from zoneinfo import ZoneInfo
    NOLA_TZ = ZoneInfo("America/Chicago")
except Exception:  # noqa: BLE001
    NOLA_TZ = timezone(timedelta(hours=-6))


async def ensure_indexes(db) -> None:
    """Speeds up availability queries + prevents double-booking races."""
    try:
        await db.bookings.create_index("slot_start_utc")
        await db.bookings.create_index([("slot_start_utc", 1), ("status", 1)])
        await db.availability_blocks.create_index([("start_utc", 1), ("end_utc", 1)])
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Schedule indexes not created: {e}")


def _iter_slots_for_day(day: datetime):
    """Yield timezone-aware datetimes for every valid slot start on `day`."""
    for hour in range(WORK_START_HOUR, WORK_END_HOUR):
        yield day.replace(hour=hour, minute=0, second=0, microsecond=0)


def _in_working_hours(dt: datetime) -> bool:
    if dt.weekday() not in WORKING_WEEKDAYS:
        return False
    return WORK_START_HOUR <= dt.hour < WORK_END_HOUR


async def get_availability(db, days_ahead: Optional[int] = None) -> dict:
    """Return a serializable availability payload for the next N days.

    Response shape:
    {
      "generated_at": "...",
      "tz": "America/Chicago",
      "appointment_types": [...],
      "days": [
        { "date": "2026-03-15", "weekday": "Sun", "is_open": false, "slots": [] },
        { "date": "2026-03-16", "weekday": "Mon", "is_open": true,
          "slots": [
            { "iso": "2026-03-16T08:00:00-05:00", "label": "8:00 AM", "available": true },
            ...
          ]
        }
      ]
    }
    """
    horizon = days_ahead if days_ahead is not None else BOOKING_WINDOW_DAYS
    now_local = datetime.now(tz=NOLA_TZ)
    today = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    cutoff = now_local + timedelta(hours=SAME_DAY_CUTOFF_HOURS)

    # Pull already-reserved slots + blocked ranges in the window.
    window_start_utc = today.astimezone(timezone.utc)
    window_end_utc = (today + timedelta(days=horizon + 1)).astimezone(timezone.utc)

    booked_cursor = db.bookings.find(
        {
            "slot_start_utc": {"$gte": window_start_utc, "$lt": window_end_utc},
            "status": {"$ne": "cancelled"},
        },
        {"_id": 0, "slot_start_utc": 1},
    )
    booked_set = set()
    async for b in booked_cursor:
        s = b.get("slot_start_utc")
        if isinstance(s, datetime):
            # Normalize to UTC then to NOLA-local ISO for exact matching.
            local = s.astimezone(NOLA_TZ)
            booked_set.add(local.strftime("%Y-%m-%dT%H:%M"))

    block_cursor = db.availability_blocks.find(
        {
            "start_utc": {"$lt": window_end_utc},
            "end_utc":   {"$gt": window_start_utc},
        },
        {"_id": 0, "start_utc": 1, "end_utc": 1},
    )
    blocks = []
    async for bl in block_cursor:
        blocks.append((bl["start_utc"], bl["end_utc"]))

    def slot_blocked(slot_local: datetime) -> bool:
        slot_utc = slot_local.astimezone(timezone.utc)
        slot_end_utc = slot_utc + timedelta(minutes=SLOT_MINUTES)
        for start, end in blocks:
            if slot_utc < end and slot_end_utc > start:
                return True
        return False

    days_out = []
    for i in range(horizon + 1):
        day = today + timedelta(days=i)
        is_open = day.weekday() in WORKING_WEEKDAYS
        slots_out = []
        if is_open:
            for s in _iter_slots_for_day(day):
                if s < cutoff:
                    continue  # in the past / too soon for same-day
                key = s.strftime("%Y-%m-%dT%H:%M")
                is_free = key not in booked_set and not slot_blocked(s)
                slots_out.append({
                    "iso": s.isoformat(),
                    "label": s.strftime("%-I:%M %p") if hasattr(s, "strftime") else s.strftime("%I:%M %p").lstrip("0"),
                    "available": is_free,
                })
        days_out.append({
            "date": day.strftime("%Y-%m-%d"),
            "weekday": day.strftime("%a"),
            "is_open": is_open,
            "slots": slots_out,
        })

    return {
        "generated_at": now_local.isoformat(),
        "tz": "America/Chicago",
        "appointment_types": APPOINTMENT_TYPES,
        "days": days_out,
        "window_days": horizon,
    }


def parse_slot_iso(iso_str: str) -> Optional[datetime]:
    """Parse an incoming ISO slot from the frontend and validate it aligns to
    a valid slot start. Returns tz-aware datetime or None if invalid."""
    if not iso_str:
        return None
    try:
        dt = datetime.fromisoformat(iso_str)
    except Exception:  # noqa: BLE001
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=NOLA_TZ)
    dt_local = dt.astimezone(NOLA_TZ)
    # Must be on the hour + in working range + a working day
    if dt_local.minute != 0 or dt_local.second != 0:
        return None
    if not _in_working_hours(dt_local):
        return None
    return dt_local


async def is_slot_available(db, slot_local: datetime) -> bool:
    """Live check whether the requested slot is still bookable."""
    now_local = datetime.now(tz=NOLA_TZ)
    if slot_local < now_local + timedelta(hours=SAME_DAY_CUTOFF_HOURS):
        return False
    if slot_local > now_local + timedelta(days=BOOKING_WINDOW_DAYS + 1):
        return False
    slot_utc = slot_local.astimezone(timezone.utc)
    slot_end_utc = slot_utc + timedelta(minutes=SLOT_MINUTES)

    existing = await db.bookings.find_one({
        "slot_start_utc": slot_utc,
        "status": {"$ne": "cancelled"},
    })
    if existing:
        return False

    block = await db.availability_blocks.find_one({
        "start_utc": {"$lt": slot_end_utc},
        "end_utc":   {"$gt": slot_utc},
    })
    if block:
        return False
    return True
