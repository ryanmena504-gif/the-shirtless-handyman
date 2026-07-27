"""
Live Airtable-backed opportunity service.

Design principles:
- Schema is fetched from Airtable at init using `schema.bases:read` — no field is
  guessed. The `KNOWN_FIELD_MAP` (Airtable field name -> internal snake_case key)
  is filtered against the base's real schema and only surviving mappings are used.
- Writes are strictly whitelisted (`EDITABLE_FIELDS`). Formula/rollup/lookup
  fields are automatically excluded even if listed.
- Activity timeline is synthesised from the record's real timestamps
  (`created_time`, `permit_filing_date`, and current `status`). No fabricated
  history. A dedicated interactions table can be plugged in later without
  changing the read contract.
- A tiny TTL cache keeps the dashboard fast and stays under Airtable's ~5 rps
  per-base rate limit.
"""
from __future__ import annotations

import logging
import os
import threading
import time
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pyairtable import Api

log = logging.getLogger("bloodhound.airtable")


# =============================================================================
# CENTRAL FIELD MAP — exact mirror of the Bloodhound Airtable base schema.
# Rule: never rename, delete, or recreate Airtable fields; only map.
# Airtable field name (exact, case-sensitive) -> internal snake_case key.
# =============================================================================
LIVE_FIELDS: Dict[str, str] = {
    "Opportunity id": "opportunity_id",
    "Opportunity name": "name",
    "Created Time": "created_time",
    "Source": "source",
    "Signal type": "signal_type",
    "Project address": "project_address",
    "Project type": "project_type",
    "Permit number": "permit_number",
    "Estimated value": "estimated_value",
    "Decision maker": "decision_maker",
    "Phone": "phone",
    "Opportunity fit": "opportunity_fit",
    "Momentum": "momentum",
    "Reachability": "reachability",
    "Evidence confidence": "evidence_confidence",
    "Contact confidence": "contact_confidence",
    "Recommended action": "recommended_action",
    "Recommended action code": "recommended_action_code",
    "Evidence summary": "evidence_summary",
    "Status": "status",
    "Last reviewed": "last_reviewed",
    "Ryans decision": "ryans_decision",
    "Outcome": "outcome",
    "Recommendation reason": "recommendation_reason",
    "Missing information": "missing_information",
    "Risk flags": "risk_flags",
    "Next best action": "next_best_action",
    "Bloodhound priority score": "priority_score",
    "Priority band": "priority_band",
    "Next follow up": "next_follow_up",
    "Daily mission": "daily_mission",
    "Daily mission code": "daily_mission_code",
}

# Fields the app knows about but which are NOT in the base yet.
# They render as "Not available yet" — we never invent values or create fields.
PENDING_FIELDS: Dict[str, str] = {
    "Email": "email",
    "Company": "company",
    "Applicant": "applicant",
    "Contractor": "contractor",
    "Owner": "owner",
    "Permit source": "permit_source",
    "Permit filing date": "permit_filing_date",
    "Permit description": "permit_description",
    "Construction value": "construction_value",
}

KNOWN_FIELD_MAP: Dict[str, str] = {**LIVE_FIELDS, **PENDING_FIELDS}

# Fields we will read but NEVER write. These are formulas, auto-numbers, or
# system-managed timestamps. Enforced in addition to the schema's own type check.
EXPLICIT_READONLY: set = {
    "Opportunity id",
    "Created Time",
    "Recommended action",
    "Bloodhound priority score",
    "Priority band",
    "Daily mission",
    "Last reviewed",
}

# Only these Airtable field names may ever be written from the app.
EDITABLE_FIELDS = {
    "Status",
    "Ryans decision",
    "Outcome",
    "Next follow up",
}

# Airtable field types that are ALWAYS read-only regardless of allowlist.
READONLY_FIELD_TYPES = {
    "formula",
    "rollup",
    "count",
    "lookup",
    "createdTime",
    "createdBy",
    "lastModifiedTime",
    "lastModifiedBy",
    "autoNumber",
    "button",
    "externalSyncSource",
}

# Statuses considered "closed" for pipeline/summary calcs.
CLOSED_STATUSES = {"Won", "Lost", "Disqualified"}

PIPELINE_STATUSES = [
    "New",
    "Needs research",
    "Ready",
    "Conversation started",
    "Estimate requested",
    "Estimate sent",
    "Won",
    "Lost",
    "Disqualified",
]

ACTIONABLE_MISSIONS = [
    "Call Today",
    "Send Text",
    "Send Email",
    "Research First",
    "Visit Property",
    "Prepare Estimate",
    "Ask for Referral",
    "Follow Up",
    "Wait",
]


def _to_list(value: Any) -> List[Any]:
    """Coerce Airtable multi-select / string values to a list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        # comma-separated fallback
        parts = [p.strip() for p in value.split(",") if p.strip()]
        return parts
    return [value]


def _first(value: Any) -> Optional[Any]:
    if isinstance(value, list):
        return value[0] if value else None
    return value


def _normalize_priority_band(v: Any) -> Optional[str]:
    """Map any Airtable formula output to A/B/C/D bands for UI coloring."""
    if v is None or v == "":
        return None
    s = str(v).lower()
    # Order matters: check specific first.
    if "medium-high" in s or "medium high" in s:
        return "B"
    if "high" in s:
        return "A"
    if "medium" in s:
        return "C"
    if "low" in s:
        return "D"
    if "a" == s.strip() or " a " in f" {s} ":
        return "A"
    if "b" == s.strip():
        return "B"
    if "c" == s.strip():
        return "C"
    if "d" == s.strip():
        return "D"
    return None


_MISSION_KEYWORDS = [
    ("Call Today", ("call today", "call now", "call the")),
    ("Send Text", ("text", "sms")),
    ("Send Email", ("email",)),
    ("Research First", ("research",)),
    ("Visit Property", ("visit", "site visit", "walk")),
    ("Prepare Estimate", ("estimate", "quote", "bid")),
    ("Ask for Referral", ("referral", "intro", "introduction")),
    ("Follow Up", ("follow up", "follow-up", "check in", "check-in")),
    ("Wait", ("wait", "not assigned", "unassigned", "hold", "monitor")),
]


def _normalize_daily_mission(v: Any) -> str:
    """Map any Airtable formula output to one of the 9 mission buckets."""
    if v is None or v == "":
        return "Wait"
    s = str(v).lower()
    for bucket, keywords in _MISSION_KEYWORDS:
        if any(k in s for k in keywords):
            return bucket
    return "Wait"


def _strip_emoji_prefix(v: Any) -> Any:
    """For display, strip a leading emoji+space if present."""
    if not isinstance(v, str):
        return v
    parts = v.split(" ", 1)
    if len(parts) == 2 and not parts[0].isascii():
        return parts[1].strip()
    return v


class AirtableOpportunityService:
    backend_name = "airtable"

    def __init__(self, api_key: str, base_id: str, table_name: str, cache_ttl: float = 45.0):
        self._api = Api(api_key)
        self._base_id = base_id
        self._table_name = table_name
        self._table = self._api.table(base_id, table_name)
        self._cache_ttl = cache_ttl
        self._lock = threading.Lock()
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_refresh: float = 0.0
        self._readonly_field_names: set = set()
        self._field_map: Dict[str, str] = {}  # airtable name -> snake_case
        self._reverse_map: Dict[str, str] = {}  # snake_case -> airtable name
        self._load_schema()

    # ---------- schema ----------
    def _load_schema(self) -> None:
        """Fetch base schema and build a mapping restricted to real fields."""
        try:
            base = self._api.base(self._base_id)
            schema = base.schema()
            table = next(
                (t for t in schema.tables if t.name == self._table_name or t.id == self._table_name),
                None,
            )
            if table is None:
                raise RuntimeError(
                    f"Airtable table '{self._table_name}' not found in base '{self._base_id}'"
                )

            available = {}
            for f in table.fields:
                available[f.name] = f
                if getattr(f, "type", None) in READONLY_FIELD_TYPES:
                    self._readonly_field_names.add(f.name)

            # The user has explicitly requested certain formula/system fields
            # be treated as read-only even if the schema type didn't flag them.
            for name in EXPLICIT_READONLY:
                if name in available:
                    self._readonly_field_names.add(name)

            self._field_map = {
                airtable_name: snake
                for airtable_name, snake in KNOWN_FIELD_MAP.items()
                if airtable_name in available
            }
            self._reverse_map = {v: k for k, v in self._field_map.items()}

            missing = sorted(set(KNOWN_FIELD_MAP) - set(self._field_map))
            if missing:
                log.info("Airtable: %d expected fields not present in schema (will render as 'Not available yet'): %s",
                         len(missing), ", ".join(missing))
            log.info("Airtable: schema loaded — %d fields mapped, %d read-only",
                     len(self._field_map), len(self._readonly_field_names))
        except Exception as e:
            log.exception("Airtable: failed to load schema")
            raise

    def schema_report(self) -> Dict[str, Any]:
        return {
            "base_id": self._base_id,
            "table_name": self._table_name,
            "mapped_fields": [
                {"airtable": at, "internal": sn, "readonly": at in self._readonly_field_names}
                for at, sn in sorted(self._field_map.items())
            ],
            "unmapped_expected": sorted(
                set(KNOWN_FIELD_MAP) - set(self._field_map)
            ),
            "editable_allowlist": sorted(
                f for f in EDITABLE_FIELDS
                if f in self._field_map and f not in self._readonly_field_names
            ),
        }

    # ---------- record transform ----------
    def _record_to_opportunity(self, record: Dict[str, Any]) -> Dict[str, Any]:
        fields = record.get("fields", {}) or {}
        opp: Dict[str, Any] = {
            "id": record.get("id"),
        }
        for at_name, snake in self._field_map.items():
            opp[snake] = fields.get(at_name)

        # created_time: prefer explicit field, fall back to Airtable metadata.
        opp["created_time"] = opp.get("created_time") or record.get("createdTime")

        # Coerce list-typed fields
        opp["missing_information"] = _to_list(opp.get("missing_information"))
        opp["risk_flags"] = _to_list(opp.get("risk_flags"))

        # Some fields may come back as arrays from linked-record / rollup formulas
        for k in ("daily_mission", "recommended_action", "priority_band",
                  "status", "source", "signal_type", "project_type"):
            if isinstance(opp.get(k), list):
                opp[k] = _first(opp[k])

        # Preserve the raw formula outputs (may include emoji labels) and
        # provide UI-normalised values.
        opp["priority_band_raw"] = opp.get("priority_band")
        opp["priority_band"] = _normalize_priority_band(opp["priority_band_raw"])

        opp["daily_mission_raw"] = opp.get("daily_mission")
        opp["daily_mission"] = _normalize_daily_mission(opp["daily_mission_raw"])

        # Also strip a leading emoji from status so pipeline stages match.
        if isinstance(opp.get("status"), str):
            opp["status_raw"] = opp["status"]
            opp["status"] = _strip_emoji_prefix(opp["status"])

        # Ensure numeric types where sensible
        for k in ("priority_score", "estimated_value", "construction_value"):
            v = opp.get(k)
            if isinstance(v, list):
                v = _first(v)
            try:
                opp[k] = float(v) if v not in (None, "", []) else None
                if opp[k] is not None and opp[k].is_integer():
                    opp[k] = int(opp[k])
            except (TypeError, ValueError):
                opp[k] = None

        # Ensure every downstream key exists so the frontend never crashes on
        # missing schema fields.
        for snake in set(KNOWN_FIELD_MAP.values()):
            opp.setdefault(snake, None)

        # Synthetic activity timeline (real timestamps only, no invented events)
        opp["activity_timeline"] = self._synthesize_activity(opp)
        return opp

    def _synthesize_activity(self, opp: Dict[str, Any]) -> List[Dict[str, Any]]:
        timeline: List[Dict[str, Any]] = []
        if opp.get("created_time"):
            src = opp.get("source") or "signal"
            timeline.append({
                "type": "discovered",
                "note": f"Discovered via {src}",
                "timestamp": opp["created_time"],
            })
        pfd = opp.get("permit_filing_date")
        if pfd:
            timeline.append({
                "type": "analysis",
                "note": f"Permit filed on {pfd}",
                "timestamp": f"{pfd}T00:00:00Z" if len(str(pfd)) == 10 else pfd,
            })
        if opp.get("status") and opp["status"] != "New":
            timeline.append({
                "type": "status_change",
                "note": f"Current status: {opp['status']}",
                "timestamp": opp.get("created_time"),
            })
        # newest first
        timeline.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
        return timeline

    # ---------- cache ----------
    def _refresh_cache(self, force: bool = False) -> None:
        now = time.time()
        if not force and (now - self._last_refresh) < self._cache_ttl and self._cache:
            return
        try:
            records = self._table.all()
        except Exception:
            log.exception("Airtable: list failed")
            raise
        new_cache: Dict[str, Dict[str, Any]] = {}
        for r in records:
            dto = self._record_to_opportunity(r)
            rid = dto.get("id")
            if rid:
                new_cache[rid] = dto
        with self._lock:
            self._cache = new_cache
            self._last_refresh = time.time()

    def _all_cached(self) -> List[Dict[str, Any]]:
        self._refresh_cache()
        with self._lock:
            return [deepcopy(v) for v in self._cache.values()]

    # ---------- reads ----------
    def count(self) -> int:
        return len(self._all_cached())

    def all(self) -> List[Dict[str, Any]]:
        return self._all_cached()

    def get(self, opp_id: str) -> Optional[Dict[str, Any]]:
        self._refresh_cache()
        with self._lock:
            cached = self._cache.get(opp_id)
            if cached:
                return deepcopy(cached)
        # not in cache, try single-record fetch
        try:
            rec = self._table.get(opp_id)
        except Exception:
            return None
        if not rec:
            return None
        dto = self._record_to_opportunity(rec)
        with self._lock:
            self._cache[dto["id"]] = dto
        return deepcopy(dto)

    def list(self, source=None, status=None, priority_band=None,
             daily_mission=None, project_type=None, min_score=None,
             q=None) -> List[Dict[str, Any]]:
        results = self._all_cached()
        if source:
            results = [o for o in results if o.get("source") == source]
        if status:
            results = [o for o in results if o.get("status") == status]
        if priority_band:
            results = [o for o in results if o.get("priority_band") == priority_band]
        if daily_mission:
            results = [o for o in results if o.get("daily_mission") == daily_mission]
        if project_type:
            results = [o for o in results if o.get("project_type") == project_type]
        if min_score is not None:
            results = [o for o in results if (o.get("priority_score") or 0) >= float(min_score)]
        if q:
            ql = q.lower()
            def match(o):
                blob = " ".join([
                    str(o.get("name", "")),
                    str(o.get("opportunity_id", "")),
                    str(o.get("project_address", "")),
                    str(o.get("decision_maker", "")),
                    str(o.get("permit_number", "")),
                    str(o.get("project_type", "")),
                ]).lower()
                return ql in blob
            results = [o for o in results if match(o)]
        results.sort(key=lambda o: o.get("priority_score") or 0, reverse=True)
        return results

    def top(self, limit: int = 10) -> List[Dict[str, Any]]:
        active = [o for o in self._all_cached() if o.get("status") not in CLOSED_STATUSES]
        active.sort(key=lambda o: o.get("priority_score") or 0, reverse=True)
        return active[:limit]

    def recent(self, limit: int = 10) -> List[Dict[str, Any]]:
        items = self._all_cached()
        items.sort(key=lambda o: o.get("created_time") or "", reverse=True)
        return items[:limit]

    def summary(self) -> Dict[str, Any]:
        all_ops = self._all_cached()
        active = [o for o in all_ops if o.get("status") not in CLOSED_STATUSES]
        immediate = [o for o in active if o.get("daily_mission") in
                     ("Call Today", "Send Text", "Visit Property")]
        ready = [o for o in active if o.get("status") == "Ready"]
        needs_research = [o for o in active
                          if o.get("status") == "Needs research"
                          or o.get("daily_mission") == "Research First"]
        new_ops = [o for o in all_ops if o.get("status") == "New"]
        pipeline_value = sum([(o.get("estimated_value") or 0) for o in active])
        return {
            "new_opportunities": len(new_ops),
            "immediate_action": len(immediate),
            "ready_to_contact": len(ready),
            "needs_research": len(needs_research),
            "total_pipeline_value": pipeline_value,
            "active_count": len(active),
            "total_count": len(all_ops),
        }

    def group_by_mission(self) -> Dict[str, List[Dict[str, Any]]]:
        groups: Dict[str, List[Dict[str, Any]]] = {m: [] for m in ACTIONABLE_MISSIONS}
        for o in self._all_cached():
            if o.get("status") in CLOSED_STATUSES:
                continue
            mission = o.get("daily_mission")
            if mission in groups:
                groups[mission].append(o)
        for m in groups:
            groups[m].sort(key=lambda o: o.get("priority_score") or 0, reverse=True)
        return groups

    def pipeline_counts(self) -> List[Dict[str, Any]]:
        counts = {s: 0 for s in PIPELINE_STATUSES}
        values = {s: 0.0 for s in PIPELINE_STATUSES}
        for o in self._all_cached():
            s = o.get("status")
            if s in counts:
                counts[s] += 1
                values[s] += (o.get("estimated_value") or 0)
        return [
            {"status": s, "count": counts[s], "value": values[s]}
            for s in PIPELINE_STATUSES
        ]

    # ---------- writes (whitelist) ----------
    def _writable_airtable_fields(self, updates_by_snake: Dict[str, Any]) -> Dict[str, Any]:
        """Filter snake_case updates down to Airtable fields we're allowed to write."""
        allowed: Dict[str, Any] = {}
        rejected: List[str] = []
        for snake, val in updates_by_snake.items():
            at_name = self._reverse_map.get(snake)
            if not at_name:
                rejected.append(snake)
                continue
            if at_name not in EDITABLE_FIELDS:
                rejected.append(snake)
                continue
            if at_name in self._readonly_field_names:
                rejected.append(snake)
                continue
            allowed[at_name] = val
        if rejected:
            log.info("Airtable: ignoring non-editable fields: %s", rejected)
        return allowed

    def update_fields(self, opp_id: str, updates_by_snake: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        allowed = self._writable_airtable_fields(updates_by_snake)
        if not allowed:
            return self.get(opp_id)
        try:
            self._table.update(opp_id, allowed)
        except Exception:
            log.exception("Airtable: update failed for %s", opp_id)
            raise
        # Force cache refresh so subsequent reads pick up formula recomputation.
        self._refresh_cache(force=True)
        return self.get(opp_id)

    def update_status(self, opp_id: str, status: str) -> Optional[Dict[str, Any]]:
        return self.update_fields(opp_id, {"status": status})

    def update_mission(self, opp_id: str, mission: str) -> Optional[Dict[str, Any]]:
        # Daily Mission is a formula field in the base — writes are rejected.
        # Kept for API compatibility; the value is stored as a request-time
        # override on the cached record only, never persisted.
        with self._lock:
            cached = self._cache.get(opp_id)
            if cached:
                cached["daily_mission"] = mission
                return deepcopy(cached)
        return self.get(opp_id)

    def add_activity(self, opp_id: str, type_: str, note: Optional[str]) -> Optional[Dict[str, Any]]:
        # No Interactions table yet — record in-memory only so the UI stays live.
        with self._lock:
            cached = self._cache.get(opp_id)
            if not cached:
                return None
            timeline = cached.setdefault("activity_timeline", [])
            timeline.insert(0, {
                "type": type_,
                "note": note or "",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            return deepcopy(cached)


def build_airtable_service_from_env() -> Optional[AirtableOpportunityService]:
    api_key = os.environ.get("AIRTABLE_API_KEY")
    base_id = os.environ.get("AIRTABLE_BASE_ID")
    table = os.environ.get("AIRTABLE_OPPORTUNITIES_TABLE")
    enabled = os.environ.get("AIRTABLE_ENABLED", "").lower() == "true"
    if not (enabled and api_key and base_id and table):
        return None
    try:
        return AirtableOpportunityService(api_key, base_id, table)
    except Exception:
        log.exception("Airtable: initialization failed — falling back to sample data")
        return None
