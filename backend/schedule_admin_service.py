"""
Admin schedule blocker — one-time date blocks + recurring weekly rules.

Design principles (per product spec):
  1. Separation of concerns
       - `availability_rules`  : recurring weekly rules       (weekday + optional time range)
       - `availability_blocks` : one-off date/date-range blocks
       - `bookings`            : confirmed appointments (untouched by this module)
  2. Existing confirmed bookings are NEVER auto-cancelled or modified by a new
     block. Conflicting bookings surface as warnings; the admin must set
     `acknowledge_conflicts: true` on the create/update payload to save.
  3. All computation is in America/Chicago (business tz). Storage is UTC-safe.
  4. All admin write endpoints are guarded upstream by the JWT `admin` role.

Schema — `db.availability_rules`
    {
      "id": "uuid",
      "kind": "weekly",
      "weekday": 6,                 # 0=Mon .. 6=Sun
      "full_day": true,             # if false, use time range below
      "start_time_local": "13:00",  # HH:MM 24-hr, only when full_day=false
      "end_time_local":   "17:00",
      "category": "personal",       # personal|project|vacation|unavailable|other
      "note": "Sundays off",
      "active": true,
      "created_by": "admin",
      "created_at": ISODate,
      "updated_at": ISODate,
    }

Schema — `db.availability_blocks`
    {
      "id": "uuid",
      "kind": "one_time",
      "date_local": "2026-07-22",   # YYYY-MM-DD for the affected day (single-day granularity)
      "full_day": true,             # if false, uses time range below
      "start_time_local": "13:00",
      "end_time_local":   "17:00",
      "start_utc": ISODate,         # denormalized for fast range queries
      "end_utc":   ISODate,
      "category": "vacation",
      "note": "Family trip",
      "created_by": "admin",
      "created_at": ISODate,
      "updated_at": ISODate,
    }
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import logging

try:
    from zoneinfo import ZoneInfo
    NOLA_TZ = ZoneInfo("America/Chicago")
except Exception:  # noqa: BLE001
    NOLA_TZ = timezone(timedelta(hours=-6))

logger = logging.getLogger(__name__)

CATEGORIES = {"personal", "project", "vacation", "unavailable", "other"}


# =====================================================================
# Helpers
# =====================================================================

def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _parse_hhmm(hhmm: str) -> tuple[int, int]:
    """Parse a 'HH:MM' local time string into (hour, minute). Raises ValueError."""
    if not isinstance(hhmm, str) or ":" not in hhmm:
        raise ValueError("time must be 'HH:MM'")
    h, m = hhmm.split(":", 1)
    hour, minute = int(h), int(m)
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        raise ValueError("time out of range")
    return hour, minute


def _date_range_utc(date_local: str, full_day: bool,
                    start_time_local: Optional[str],
                    end_time_local: Optional[str]) -> tuple[datetime, datetime]:
    """Compute the [start_utc, end_utc) range for a one-time block."""
    y, m, d = [int(x) for x in date_local.split("-")]
    if full_day:
        start_local = datetime(y, m, d, 0, 0, tzinfo=NOLA_TZ)
        end_local = start_local + timedelta(days=1)
    else:
        sh, sm = _parse_hhmm(start_time_local or "")
        eh, em = _parse_hhmm(end_time_local or "")
        start_local = datetime(y, m, d, sh, sm, tzinfo=NOLA_TZ)
        end_local = datetime(y, m, d, eh, em, tzinfo=NOLA_TZ)
        if end_local <= start_local:
            raise ValueError("end_time_local must be after start_time_local")
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc)


def _validate_category(category: str) -> str:
    cat = (category or "other").lower().strip()
    if cat not in CATEGORIES:
        raise ValueError(f"invalid category '{category}' — must be one of {sorted(CATEGORIES)}")
    return cat


# =====================================================================
# Recurring-rule evaluation (used by schedule_service.is_slot_available)
# =====================================================================

def _rule_matches_slot(rule: dict, slot_local: datetime, slot_end_local: datetime) -> bool:
    """Return True if `rule` (weekly weekday rule) blocks the given local slot."""
    if not rule.get("active", True):
        return False
    if rule.get("kind") != "weekly":
        return False
    if rule.get("weekday") != slot_local.weekday():
        return False
    if rule.get("full_day", False):
        return True
    # Partial-day rule → interval intersection on local time-of-day
    try:
        sh, sm = _parse_hhmm(rule.get("start_time_local", ""))
        eh, em = _parse_hhmm(rule.get("end_time_local", ""))
    except ValueError:
        return False
    rule_start = slot_local.replace(hour=sh, minute=sm, second=0, microsecond=0)
    rule_end = slot_local.replace(hour=eh, minute=em, second=0, microsecond=0)
    return slot_local < rule_end and slot_end_local > rule_start


async def fetch_active_weekly_rules(db) -> list[dict]:
    cursor = db.availability_rules.find({"active": True}, {"_id": 0})
    return await cursor.to_list(500)


async def slot_blocked_by_rules(db, slot_local: datetime, slot_minutes: int) -> bool:
    """True if a recurring rule blocks this slot."""
    rules = await fetch_active_weekly_rules(db)
    if not rules:
        return False
    slot_end_local = slot_local + timedelta(minutes=slot_minutes)
    for r in rules:
        if _rule_matches_slot(r, slot_local, slot_end_local):
            return True
    return False


async def find_recurring_rule_blocked_dates(db, days_ahead: int) -> dict[str, list[dict]]:
    """Return a map of {'YYYY-MM-DD': [rule_summary,...]} listing which rules
    affect each date in the horizon. Used by `get_availability` to zero out
    slots on recurring-blocked days efficiently."""
    rules = await fetch_active_weekly_rules(db)
    if not rules:
        return {}
    now_local = datetime.now(tz=NOLA_TZ)
    today = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    out: dict[str, list[dict]] = {}
    for i in range(days_ahead + 1):
        day = today + timedelta(days=i)
        wd = day.weekday()
        matching = [r for r in rules if r.get("weekday") == wd]
        if matching:
            out[day.strftime("%Y-%m-%d")] = matching
    return out


# =====================================================================
# CRUD — Weekly rules
# =====================================================================

async def create_rule(db, payload: dict, created_by: str) -> dict:
    weekday = int(payload["weekday"])
    if not (0 <= weekday <= 6):
        raise ValueError("weekday must be 0-6 (Mon=0)")
    full_day = bool(payload.get("full_day", False))
    start_time = payload.get("start_time_local")
    end_time = payload.get("end_time_local")
    if not full_day:
        # validate the time range
        _parse_hhmm(start_time or "")
        _parse_hhmm(end_time or "")
        sh, sm = _parse_hhmm(start_time)
        eh, em = _parse_hhmm(end_time)
        if (eh, em) <= (sh, sm):
            raise ValueError("end_time_local must be after start_time_local")
    now = _now_utc()
    doc = {
        "id": str(uuid.uuid4()),
        "kind": "weekly",
        "weekday": weekday,
        "full_day": full_day,
        "start_time_local": None if full_day else start_time,
        "end_time_local":   None if full_day else end_time,
        "category": _validate_category(payload.get("category")),
        "note": (payload.get("note") or "").strip()[:280],
        "active": True,
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    }
    await db.availability_rules.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def update_rule(db, rule_id: str, payload: dict) -> Optional[dict]:
    updates: dict = {"updated_at": _now_utc()}
    if "weekday" in payload:
        wd = int(payload["weekday"])
        if not (0 <= wd <= 6):
            raise ValueError("weekday must be 0-6")
        updates["weekday"] = wd
    if "category" in payload:
        updates["category"] = _validate_category(payload["category"])
    if "note" in payload:
        updates["note"] = (payload["note"] or "").strip()[:280]
    if "active" in payload:
        updates["active"] = bool(payload["active"])
    if "full_day" in payload:
        updates["full_day"] = bool(payload["full_day"])
    if "start_time_local" in payload:
        if payload["start_time_local"]:
            _parse_hhmm(payload["start_time_local"])
        updates["start_time_local"] = payload["start_time_local"]
    if "end_time_local" in payload:
        if payload["end_time_local"]:
            _parse_hhmm(payload["end_time_local"])
        updates["end_time_local"] = payload["end_time_local"]

    result = await db.availability_rules.find_one_and_update(
        {"id": rule_id},
        {"$set": updates},
        projection={"_id": 0},
        return_document=True,
    )
    return result


async def delete_rule(db, rule_id: str) -> bool:
    result = await db.availability_rules.delete_one({"id": rule_id})
    return result.deleted_count > 0


async def list_rules(db) -> list[dict]:
    cursor = db.availability_rules.find({}, {"_id": 0}).sort("weekday", 1)
    return await cursor.to_list(500)


# =====================================================================
# CRUD — One-time blocks
# =====================================================================

async def create_block(db, payload: dict, created_by: str) -> dict:
    date_local = payload["date_local"]
    # Validate YYYY-MM-DD
    y, m, d = [int(x) for x in date_local.split("-")]
    _ = datetime(y, m, d)  # will raise if invalid
    full_day = bool(payload.get("full_day", False))
    start_time = payload.get("start_time_local")
    end_time = payload.get("end_time_local")
    if not full_day and (not start_time or not end_time):
        raise ValueError("partial-day block requires start_time_local and end_time_local")
    start_utc, end_utc = _date_range_utc(date_local, full_day, start_time, end_time)

    now = _now_utc()
    doc = {
        "id": str(uuid.uuid4()),
        "kind": "one_time",
        "date_local": date_local,
        "full_day": full_day,
        "start_time_local": None if full_day else start_time,
        "end_time_local":   None if full_day else end_time,
        "start_utc": start_utc,
        "end_utc":   end_utc,
        "category": _validate_category(payload.get("category")),
        "note": (payload.get("note") or "").strip()[:280],
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    }
    await db.availability_blocks.insert_one(doc)
    doc.pop("_id", None)
    return _serialize_block(doc)


async def update_block(db, block_id: str, payload: dict) -> Optional[dict]:
    existing = await db.availability_blocks.find_one({"id": block_id}, {"_id": 0})
    if not existing:
        return None
    merged = {**existing, **payload}
    date_local = merged["date_local"]
    full_day = bool(merged.get("full_day", False))
    start_time = merged.get("start_time_local")
    end_time = merged.get("end_time_local")
    if not full_day and (not start_time or not end_time):
        raise ValueError("partial-day block requires start_time_local and end_time_local")
    start_utc, end_utc = _date_range_utc(date_local, full_day, start_time, end_time)

    updates = {
        "date_local": date_local,
        "full_day": full_day,
        "start_time_local": None if full_day else start_time,
        "end_time_local":   None if full_day else end_time,
        "start_utc": start_utc,
        "end_utc":   end_utc,
        "category":  _validate_category(merged.get("category")),
        "note":      (merged.get("note") or "").strip()[:280],
        "updated_at": _now_utc(),
    }
    result = await db.availability_blocks.find_one_and_update(
        {"id": block_id},
        {"$set": updates},
        projection={"_id": 0},
        return_document=True,
    )
    return _serialize_block(result) if result else None


async def delete_block(db, block_id: str) -> bool:
    result = await db.availability_blocks.delete_one({"id": block_id})
    return result.deleted_count > 0


async def list_blocks(db, include_past: bool = False) -> list[dict]:
    query = {}
    if not include_past:
        query = {"end_utc": {"$gte": _now_utc()}}
    cursor = db.availability_blocks.find(query, {"_id": 0}).sort("start_utc", 1)
    docs = await cursor.to_list(500)
    return [_serialize_block(d) for d in docs]


def _serialize_block(doc: dict) -> dict:
    """Ensure datetimes serialize cleanly to JSON."""
    if not doc:
        return doc
    for k in ("start_utc", "end_utc", "created_at", "updated_at"):
        v = doc.get(k)
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            doc[k] = v.isoformat()
    return doc


# =====================================================================
# Conflict detection
# =====================================================================

async def find_conflicting_bookings(db, start_utc: datetime, end_utc: datetime) -> list[dict]:
    """Return non-cancelled bookings that intersect the [start_utc, end_utc) range."""
    cursor = db.bookings.find(
        {
            "slot_start_utc": {"$lt": end_utc, "$ne": None},
            "status": {"$ne": "cancelled"},
        },
        {"_id": 0, "id": 1, "name": 1, "phone": 1, "email": 1, "type_label": 1,
         "appointment_type": 1,
         "slot_start_utc": 1, "slot_end_utc": 1, "status": 1},
    ).sort("slot_start_utc", 1)
    hits = []
    async for b in cursor:
        bs = b.get("slot_start_utc")
        be = b.get("slot_end_utc")
        if not isinstance(bs, datetime):
            continue
        # Normalize naive → UTC (Motor may strip tz)
        if bs.tzinfo is None:
            bs = bs.replace(tzinfo=timezone.utc)
        # Legacy bookings without slot_end_utc → assume default slot length (60 min)
        if not isinstance(be, datetime):
            be = bs + timedelta(minutes=60)
        elif be.tzinfo is None:
            be = be.replace(tzinfo=timezone.utc)
        # Interval intersection
        if bs < end_utc and be > start_utc:
            local_start = bs.astimezone(NOLA_TZ)
            hits.append({
                "id": b.get("id"),
                "name": b.get("name"),
                "phone": b.get("phone"),
                "email": b.get("email"),
                "type_label": b.get("type_label") or (b.get("appointment_type") or "Appointment").replace("_", " ").title(),
                "status": b.get("status", "confirmed"),
                "slot_start_iso": local_start.isoformat(),
                "slot_start_local_display": local_start.strftime("%a, %b %-d @ %-I:%M %p"),
            })
    return hits


async def preview_block_conflicts(db, payload: dict) -> dict:
    """Compute the UTC range of a proposed block and return conflicting bookings.
    Used by the admin UI BEFORE actually creating a block."""
    if payload.get("kind") == "weekly":
        weekday = int(payload["weekday"])
        full_day = bool(payload.get("full_day", False))
        st = payload.get("start_time_local")
        et = payload.get("end_time_local")
        # Look ahead 90 days for conflicts on this weekday
        now_local = datetime.now(tz=NOLA_TZ)
        today = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        conflicts = []
        for i in range(1, 91):
            day = today + timedelta(days=i)
            if day.weekday() != weekday:
                continue
            date_local = day.strftime("%Y-%m-%d")
            try:
                start_utc, end_utc = _date_range_utc(date_local, full_day, st, et)
            except ValueError:
                continue
            hits = await find_conflicting_bookings(db, start_utc, end_utc)
            conflicts.extend(hits)
        return {"conflicts": conflicts, "count": len(conflicts)}
    # one_time
    start_utc, end_utc = _date_range_utc(
        payload["date_local"],
        bool(payload.get("full_day", False)),
        payload.get("start_time_local"),
        payload.get("end_time_local"),
    )
    conflicts = await find_conflicting_bookings(db, start_utc, end_utc)
    return {"conflicts": conflicts, "count": len(conflicts)}


# =====================================================================
# Indexes
# =====================================================================

async def ensure_indexes(db) -> None:
    try:
        await db.availability_rules.create_index("weekday")
        await db.availability_rules.create_index("active")
        await db.availability_rules.create_index("id", unique=True)
        await db.availability_blocks.create_index("id", unique=True)
        await db.availability_blocks.create_index([("start_utc", 1), ("end_utc", 1)])
    except Exception as e:  # noqa: BLE001
        logger.warning(f"schedule_admin indexes: {e}")
