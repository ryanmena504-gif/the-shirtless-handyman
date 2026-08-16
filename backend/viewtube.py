"""viewTube — live camera DIY coach.

Catalog, coaches, and the session state machine live here so they can be
unit-tested without Mongo or a camera. Persistence is the server's job.

Product rules (from the market brief):
- Structured projects only. No open-world "watch anything."
- Hard stop only on high-confidence, high-harm or clearly-wrong events.
- Soft pause when the camera cannot see enough to judge.
- If unsure, ask. Never invent a green light.
- Coach persona is charming and gendered. Safety layer is not.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Optional
import uuid


HARD_STOP = "hard_stop"
SOFT_PAUSE = "soft_pause"
ASK = "ask"

STATUS_SETUP = "setup"
STATUS_LIVE = "live"
STATUS_HARD_STOP = "hard_stop"
STATUS_SOFT_PAUSE = "soft_pause"
STATUS_ASK = "ask"
STATUS_COMPLETED = "completed"

VALID_EVENTS = {
    "start",
    "confirm_setup",
    "confirm_safety",
    "bypass_safety",
    "check_me",
    "glance",
    "sense",
    "complete_step",
    "flag_wrong",
    "acknowledge_interrupt",
    "resume",
}

# Brightness below this means the bench is not visible enough to judge.
DARK_THRESHOLD = 0.12

# Background glances only freeze the session when the model is this sure.
GLANCE_MIN_CONFIDENCE = 0.7

# Instant lines — prefetched, cached, spoken from the phone. No cloud wait.
LOOKING_LINE = "Looking."
SAW_THAT_LINE = "Hold. I saw that."
LOST_LINE = "I lost the bench. Tip the phone down."
FOUND_LINE = "Got you. Keep going."
FACE_LINE = "I see you, not the work. Point me at the bench."

INSTANT_LINES = (
    LOOKING_LINE,
    SAW_THAT_LINE,
    LOST_LINE,
    FOUND_LINE,
    FACE_LINE,
)

# On-device nervous system. Keep in sync with frontend/src/lib/viewtubeSense.js
SENSE_SPEC = {
    "width": 96,
    "height": 54,
    "sample_ms": 120,
    "dark": 0.12,
    "motion_stir": 0.045,
    "motion_shock": 0.11,
    "motion_settle": 0.028,
    "skin_face": 0.22,
    "lost_frames": 8,
    "settle_frames": 6,
    "shock_cooldown_ms": 8000,
    "heartbeat_ms": 15000,
}

CAMERA_SENSE_REASONS = {"camera_lost", "face_not_bench"}

# Fast live path. gpt-4o-mini-tts sounds nicer and costs a spinner.
LIVE_TTS_MODEL = "tts-1"

MAX_SPEAK_CHARS = 500

COACHES = [
    {
        "id": "cole",
        "name": "Cole",
        "pronouns": "he/him",
        "voice": "male",
        "voice_source": "ai",
        "tts_voice": "onyx",
        "tts_model": LIVE_TTS_MODEL,
        "tts_instructions": (
            "You are Cole, an AI shop coach. Warm, slightly cocky, never sultry. "
            "Speak like a friend who will stop a bad cut. American English. Medium pace. "
            "No whisper. No flirt. Clear consonants."
        ),
        "tagline": "Calm, a little cocky, stops you when the part is backwards.",
        "bio": "AI shop teacher. Talks like a friend. Stops you like a foreman.",
        "style": "warm-direct",
        "portrait": None,
    },
    {
        "id": "avery",
        "name": "Avery",
        "pronouns": "she/her",
        "voice": "female",
        "voice_source": "ai",
        "tts_voice": "nova",
        "tts_model": LIVE_TTS_MODEL,
        "tts_instructions": (
            "You are Avery, an AI finish-carpenter coach. Sharp, encouraging, never sultry. "
            "Speak like someone who has seen every board go on backwards. American English. "
            "Medium pace. No whisper. No flirt. Clear consonants."
        ),
        "tagline": "Sharp, encouraging, catches the board before it goes on backwards.",
        "bio": "AI finish carpenter who got tired of people learning the hard way on YouTube.",
        "style": "warm-direct",
        "portrait": None,
    },
]


PROJECTS = [
    {
        "id": "flatpack-shelf",
        "title": "Flat-pack shelf",
        "blurb": "The IKEA-class build. Parts, orientation, cam locks — we watch the bench.",
        "duration": "25–40 min",
        "difficulty": "Beginner",
        "requires_ppe": False,
        "category": "assembly",
        "image": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "layout",
                "title": "Lay out every part",
                "coach": "Dump the bag. I want every panel, every cam lock, every leftover screw on the floor where I can see them.",
                "verify": "parts_visible",
            },
            {
                "id": "side-panel",
                "title": "Stand the first side panel",
                "coach": "The factory holes face in. If the finished edge is on the inside, you have it backwards.",
                "verify": "orientation",
            },
            {
                "id": "cams",
                "title": "Seat the cam locks",
                "coach": "Arrow on the cam points at the hole it came from. Tighten until it bites, not until it screams.",
                "verify": "orientation",
            },
            {
                "id": "square",
                "title": "Square it before the back",
                "coach": "Measure the diagonals. If they don't match, do not nail the backer. We'll fix the rack first.",
                "verify": "square",
            },
        ],
    },
    {
        "id": "drywall-patch",
        "title": "Drywall patch",
        "blurb": "Cut, back, tape, mud. We stop you if the patch is proud or the tape is dry.",
        "duration": "45–70 min",
        "difficulty": "Beginner",
        "requires_ppe": False,
        "category": "repair",
        "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "cut",
                "title": "Cut a clean rectangle",
                "coach": "Square the hole. Ragged edges are why patches telegraph through paint.",
                "verify": "cut_square",
            },
            {
                "id": "backing",
                "title": "Add backing",
                "coach": "A scrap stick behind the hole. Two screws. The patch needs something to hold besides hope.",
                "verify": "backing",
            },
            {
                "id": "tape-mud",
                "title": "Tape, then a thin first coat",
                "coach": "Mud under the tape, not just over it. If it looks puffy, scrape it back now.",
                "verify": "proud",
            },
        ],
    },
    {
        "id": "paint-wall",
        "title": "Paint a wall",
        "blurb": "Cut, roll, keep a wet edge. We catch holidays and the second-coat itch.",
        "duration": "60–90 min",
        "difficulty": "Beginner",
        "requires_ppe": False,
        "category": "finish",
        "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "prep",
                "title": "Prep and tape",
                "coach": "Fill the nail pops. Dust the wall. Tape the trim. Paint does not hide a dirty wall.",
                "verify": "prep",
            },
            {
                "id": "cut-in",
                "title": "Cut in the edges",
                "coach": "A two-inch brush, loaded but not dripping. Work a small section so the roll can catch a wet edge.",
                "verify": "cut_in",
            },
            {
                "id": "roll",
                "title": "Roll in a W, then fill",
                "coach": "Don't go back over paint that's already tacky. That's how you get lap marks.",
                "verify": "coverage",
            },
        ],
    },
    {
        "id": "tool-safety",
        "title": "Circular saw basics",
        "blurb": "Guard, hands, line. Glasses if you have them — we will not freeze you over PPE.",
        "duration": "10–15 min",
        "difficulty": "Safety",
        "requires_ppe": True,
        "category": "safety",
        "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "ppe",
                "title": "Optional: glasses",
                "coach": "If you have glasses, throw them on. If you don't, skip this — I am not the shop-class hall monitor.",
                "verify": "ppe",
                "optional": True,
            },
            {
                "id": "guard",
                "title": "Check the blade guard",
                "coach": "The guard should spring shut on its own. If it sticks, we are done. No cut.",
                "verify": "guard",
            },
            {
                "id": "stance",
                "title": "Stance and line",
                "coach": "Both hands on the saw. Waste side of the line. Cord behind you, not under the shoe.",
                "verify": "stance",
            },
        ],
    },
    {
        "id": "floating-shelf",
        "title": "Floating shelf",
        "blurb": "Level, anchors, hidden bracket. We stop you if the bracket is crooked.",
        "duration": "20–35 min",
        "difficulty": "Beginner",
        "requires_ppe": False,
        "category": "install",
        "image": "https://images.unsplash.com/photo-1595428774223-ef33410519d0?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "level",
                "title": "Level the line",
                "coach": "Pencil line first. If the bubble is off, the shelf will mock you every time you walk by.",
                "verify": "level",
            },
            {
                "id": "bracket",
                "title": "Mount the hidden bracket",
                "coach": "The long fingers point up into the shelf, not down at the floor. Two fasteners minimum.",
                "verify": "orientation",
            },
            {
                "id": "seat",
                "title": "Slide the shelf on",
                "coach": "It should seat flush to the wall. If you see a gap at one end, the bracket is racked. Pull it and reset.",
                "verify": "flush",
            },
        ],
    },
    {
        "id": "faucet-swap",
        "title": "Bathroom faucet swap",
        "blurb": "Shutoff, swap, snug. We stop you if the supply lines are crossed or the body is backwards.",
        "duration": "30–50 min",
        "difficulty": "Beginner",
        "requires_ppe": False,
        "category": "repair",
        "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "shutoff",
                "title": "Shut the valves",
                "coach": "Both stops under the sink, then open the old faucet to bleed pressure. Wet hands are how this job gets ugly.",
                "verify": "shutoff",
            },
            {
                "id": "set-body",
                "title": "Set the new body",
                "coach": "Hot on the left as you face it. If the spout aims at the wall, you have it backwards.",
                "verify": "orientation",
            },
            {
                "id": "lines",
                "title": "Hook the supply lines",
                "coach": "Hot to hot, cold to cold. Hand tight plus a quarter turn. Do not crank until the nut rounds.",
                "verify": "lines",
            },
        ],
    },
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_coach(coach_id: str) -> Optional[dict]:
    return next((deepcopy(c) for c in COACHES if c["id"] == coach_id), None)


def get_project(project_id: str) -> Optional[dict]:
    return next((deepcopy(p) for p in PROJECTS if p["id"] == project_id), None)


def list_coaches() -> list[dict]:
    return deepcopy(COACHES)


def list_projects() -> list[dict]:
    return deepcopy(PROJECTS)


def public_project(project: dict) -> dict:
    """Catalog card — steps stay, used by both API and session payloads."""
    return deepcopy(project)


def tts_spec(coach_id: str) -> dict:
    """AI voice contract for a coach. No human recordings."""
    coach = get_coach(coach_id)
    if not coach:
        raise ValueError("Unknown coach")
    return {
        "coach_id": coach["id"],
        "coach_name": coach["name"],
        "voice_source": "ai",
        "tts_voice": coach["tts_voice"],
        "tts_model": coach.get("tts_model", LIVE_TTS_MODEL),
        "tts_instructions": coach["tts_instructions"],
    }


def speak_request(coach_id: str, text: str) -> dict:
    """Validate a line before it hits the TTS provider."""
    cleaned = (text or "").strip()
    if not cleaned:
        raise ValueError("Nothing to say")
    if len(cleaned) > MAX_SPEAK_CHARS:
        raise ValueError("Line too long")
    spec = tts_spec(coach_id)
    spec["text"] = cleaned
    return spec


def prefetch_lines(session: dict) -> list[str]:
    """Known lines we can synthesize before they are spoken. Cache beats a spinner.

    Keep this short. Prefetching the whole project saturates TTS and delays the
    first line — the opposite of feeling live.
    """
    coach = session.get("coach") or {}
    name = coach.get("name") or "Coach"
    texts: list[str] = []
    seen: set[str] = set()

    def add(text: str) -> None:
        cleaned = (text or "").strip()
        if not cleaned or cleaned in seen or len(cleaned) > MAX_SPEAK_CHARS:
            return
        seen.add(cleaned)
        texts.append(cleaned)

    for line in INSTANT_LINES:
        add(line)
    add((session.get("coach_line") or {}).get("text") or "")
    add(
        f"I'm {name}. Prop the phone so I can see the bench — not your face. "
        "When the work is in frame, tap I'm set."
    )
    steps = (session.get("project") or {}).get("steps") or []
    idx = max(0, int(session.get("step_index") or 0))
    for step in steps[idx : idx + 3]:
        title = step.get("title") or ""
        coach_text = step.get("coach") or ""
        add(coach_text)
        add(f"You're set. First move: {title}. {coach_text}")
        add(f"You're set. {coach_text} Skip if that is not you — I will not freeze the session over it.")
        add(f"Next: {title}. {coach_text}")
        add(f"Good. Back to it — {title}. {coach_text}")
    add("That piece is backwards. Do not drive another fastener. Flip it.")
    add("The guard is not snapping shut. Unplug it. We are not cutting on a sticky guard.")
    add("Hold. Do not take the next bite. Show me what you just did — slowly.")
    add("Got it. I will not freeze you over glasses. Let's work.")
    return texts


def _line(coach: dict, text: str) -> dict:
    return {
        "coach_id": coach["id"],
        "coach_name": coach["name"],
        "voice": coach["voice"],
        "voice_source": coach.get("voice_source", "ai"),
        "tts_voice": coach.get("tts_voice"),
        "text": text,
    }


def _interrupt(kind: str, reason: str, line: dict, resume_hint: str, bypassable: bool = False) -> dict:
    return {
        "id": f"int_{uuid.uuid4().hex[:10]}",
        "kind": kind,
        "reason": reason,
        "line": line,
        "resume_hint": resume_hint,
        "bypassable": bypassable,
        "at": _now(),
    }


def create_session(coach_id: str, project_id: str) -> dict:
    coach = get_coach(coach_id)
    project = get_project(project_id)
    if not coach:
        raise ValueError("Unknown coach")
    if not project:
        raise ValueError("Unknown project")

    greeting = (
        f"I'm {coach['name']}. Prop the phone so I can see the bench — not your face. "
        "When the work is in frame, tap I'm set."
    )
    return {
        "id": f"vt_{uuid.uuid4().hex[:16]}",
        "coach_id": coach["id"],
        "project_id": project["id"],
        "status": STATUS_SETUP,
        "step_index": 0,
        "safety_cleared": False,
        "safety_bypassed": False,
        "setup_confirmed": False,
        "checked_current": False,
        "coach_line": _line(coach, greeting),
        "interrupt": None,
        "interrupts": [],
        "created_at": _now(),
        "updated_at": _now(),
        "completed_at": None,
        "coach": coach,
        "project": public_project(project),
        "last_look": None,
        "last_sense": None,
    }


def current_step(session: dict) -> Optional[dict]:
    steps = session["project"]["steps"]
    idx = session["step_index"]
    if 0 <= idx < len(steps):
        return steps[idx]
    return None


def _set_line(session: dict, text: str) -> None:
    session["coach_line"] = _line(session["coach"], text)
    session["updated_at"] = _now()


def _raise_interrupt(session: dict, kind: str, reason: str, text: str, resume_hint: str, bypassable: bool = False) -> dict:
    line = _line(session["coach"], text)
    interrupt = _interrupt(kind, reason, line, resume_hint, bypassable=bypassable)
    session["interrupt"] = interrupt
    session["interrupts"].append(interrupt)
    session["coach_line"] = line
    session["updated_at"] = _now()
    if kind == HARD_STOP:
        session["status"] = STATUS_HARD_STOP
    elif kind == SOFT_PAUSE:
        session["status"] = STATUS_SOFT_PAUSE
    else:
        session["status"] = STATUS_ASK
    return session


def _clear_interrupt(session: dict) -> None:
    session["interrupt"] = None
    session["updated_at"] = _now()


LOOK_FOR = {
    "parts_visible": "Are panels, hardware bags, and fasteners laid out and visible on the bench or floor?",
    "orientation": "Is any panel, cam, bracket, shelf hardware, or faucet body backwards or upside down?",
    "square": "Does the frame look racked or diamond-shaped instead of square?",
    "cut_square": "Is the drywall cut a clean rectangle, or are the edges ragged?",
    "backing": "Is there a backing stick visible behind the hole?",
    "proud": "Is the mud or patch puffed proud of the wall?",
    "prep": "Is the wall taped and reasonably clean of dust and junk?",
    "cut_in": "Is there a cut-in band along the edges, or is paint dripping?",
    "coverage": "Are there obvious holidays, missed patches, or lap marks?",
    "ppe": "Ignore missing safety glasses. Do not fail a step because someone is not wearing PPE. Real DIYers often work without glasses.",
    "guard": "Is a circular-saw blade guard stuck open?",
    "stance": "Are both hands on the saw, and is the cord out from under the shoe?",
    "level": "Is a level on the wall, and does the bubble look off-center?",
    "flush": "Does the shelf sit with a visible gap at one end?",
    "shutoff": "Are under-sink stops visible, and do they look closed?",
    "lines": "Do the supply lines look crossed, kinked, or disconnected?",
}

VISION_BOOLS = (
    "part_inverted",
    "ppe_visible",
    "hands_in_frame",
    "guard_stuck",
    "bench_in_frame",
)

VISION_LOOK_EVENTS = {"check_me", "glance"}

LOW_CONFIDENCE = 0.55


def vision_brief(session: dict) -> dict:
    """What the model should look for on this still. No green light implied."""
    step = current_step(session) or {}
    verify = step.get("verify", "")
    project = session["project"]
    return {
        "project_id": project["id"],
        "project_title": project["title"],
        "step_id": step.get("id"),
        "step_title": step.get("title"),
        "verify": verify,
        "look_for": step.get("look_for") or LOOK_FOR.get(verify) or step.get("coach", ""),
        "requires_ppe": bool(project.get("requires_ppe")),
        "coach_name": session["coach"]["name"],
    }


def parse_vision_payload(raw: Any) -> dict:
    """Normalize a model JSON blob into signals the state machine understands."""
    if not isinstance(raw, dict):
        raise ValueError("Vision payload must be an object")
    verdict = str(raw.get("verdict") or "unsure").strip().lower()
    if verdict not in {"ok", "wrong", "unsure"}:
        verdict = "unsure"
    try:
        confidence = float(raw.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))
    note = str(raw.get("note") or "").strip()[:140]
    out = {
        "vision_verdict": verdict,
        "vision_confidence": confidence,
        "vision_note": note,
        "vision_unsure": verdict == "unsure" or confidence < LOW_CONFIDENCE,
        "vision_wrong": verdict == "wrong",
    }
    for key in VISION_BOOLS:
        if key not in raw or raw[key] is None:
            continue
        out[key] = bool(raw[key])
    return out


def merge_vision_signals(client_signals: Optional[dict], vision: Optional[dict]) -> dict:
    """Client brightness wins. Vision fills the rest. Never invent a green light."""
    merged = dict(client_signals or {})
    merged.pop("frame", None)
    if not vision:
        return merged
    for key, value in vision.items():
        if key == "brightness":
            continue
        merged[key] = value
    return merged


def vision_prompt(brief: dict) -> str:
    return (
        "You are a conservative DIY inspector looking at one still from a phone camera.\n"
        f"Project: {brief.get('project_title')}\n"
        f"Current step: {brief.get('step_title')}\n"
        f"Verify type: {brief.get('verify')}\n"
        f"Look for: {brief.get('look_for')}\n"
        f"PPE required: {brief.get('requires_ppe')}\n\n"
        "Return ONLY JSON with this shape:\n"
        '{"verdict":"ok|wrong|unsure","confidence":0.0,'
        '"part_inverted":null,"ppe_visible":null,"hands_in_frame":null,'
        '"guard_stuck":null,"bench_in_frame":null,"note":"one short sentence"}\n\n'
        "Rules:\n"
        "- If you cannot see clearly, verdict is unsure. Never invent a green light.\n"
        "- part_inverted=true only when a part is clearly backwards or upside down.\n"
        "- Never fail or mark wrong because safety glasses are missing. That is optional.\n"
        "- Keep note under 140 characters. No flirt. No filler."
    )


def apply_event(session: dict, event_type: str, signals: Optional[dict] = None) -> dict:
    """Advance or halt a session. Returns the same dict, mutated."""
    if event_type not in VALID_EVENTS:
        raise ValueError(f"Unknown event: {event_type}")

    signals = signals or {}
    session = deepcopy(session)
    project = session["project"]
    coach = session["coach"]
    step = current_step(session)

    if event_type == "start":
        _set_line(
            session,
            session["coach_line"]["text"]
            if session["status"] == STATUS_SETUP
            else f"{coach['name']} is on. Show me the work.",
        )
        return session

    if event_type == "acknowledge_interrupt":
        if not session.get("interrupt"):
            raise ValueError("Nothing to acknowledge")
        session["interrupt"]["acknowledged"] = True
        session["updated_at"] = _now()
        return session

    if event_type == "resume":
        interrupt = session.get("interrupt")
        if interrupt and not interrupt.get("acknowledged") and interrupt["kind"] == HARD_STOP:
            raise ValueError("Acknowledge the stop before we keep going")
        _clear_interrupt(session)
        if session["status"] in (STATUS_HARD_STOP, STATUS_SOFT_PAUSE, STATUS_ASK):
            session["status"] = STATUS_LIVE if session.get("setup_confirmed") else STATUS_SETUP
        if step:
            _set_line(session, f"Good. Back to it — {step['title']}. {step['coach']}")
        return session

    if event_type == "glance":
        return _apply_glance(session, signals)

    if event_type == "sense":
        return _apply_sense(session, signals)

    if session["status"] == STATUS_HARD_STOP and event_type not in {
        "acknowledge_interrupt",
        "resume",
        "confirm_safety",
        "bypass_safety",
        "glance",
        "sense",
    }:
        raise ValueError("Session is stopped. Acknowledge, then resume.")

    if event_type == "confirm_setup":
        if signals.get("bench_in_frame") is False:
            return _raise_interrupt(
                session,
                ASK,
                "bench_missing",
                "I see you, not the work. Tip the phone down so the bench fills the frame.",
                "When the parts are in view, tap I'm set again.",
            )
        session["setup_confirmed"] = True
        session["status"] = STATUS_LIVE
        if step and step.get("optional"):
            _set_line(
                session,
                f"You're set. {step['coach']} Skip if that is not you — I will not freeze the session over it.",
            )
        elif step:
            _set_line(session, f"You're set. First move: {step['title']}. {step['coach']}")
        return session

    if event_type in {"confirm_safety", "bypass_safety"}:
        skipped = event_type == "bypass_safety"
        session["safety_cleared"] = True
        session["safety_bypassed"] = skipped or session.get("safety_bypassed", False)
        session["status"] = STATUS_LIVE
        if session.get("interrupt") and session["interrupt"].get("bypassable"):
            session["interrupt"]["acknowledged"] = True
            _clear_interrupt(session)
        elif session.get("interrupt") and session["interrupt"].get("reason") == "ppe_missing":
            session["interrupt"]["acknowledged"] = True
            _clear_interrupt(session)
        if step and (step.get("verify") == "ppe" or step.get("optional")):
            session["checked_current"] = True
            return _complete_step(session, signals)
        _set_line(
            session,
            "Got it. I will not freeze you over glasses. Let's work."
            if skipped
            else "Glasses. Good. Now the actual work.",
        )
        return session

    if event_type == "flag_wrong":
        return _raise_interrupt(
            session,
            HARD_STOP,
            "flag_wrong",
            "Hold. Do not take the next bite. Show me what you just did — slowly.",
            "Fix the last move, then tap I hear you and Resume.",
        )

    brightness = signals.get("brightness")
    if brightness is not None and brightness < DARK_THRESHOLD:
        return _raise_interrupt(
            session,
            SOFT_PAUSE,
            "too_dark",
            "I lost the bench. More light, or tip the phone down. I will not guess in the dark.",
            "When the work is lit, tap Resume.",
        )

    if event_type == "check_me":
        session["last_look"] = {
            "at": _now(),
            "verdict": signals.get("vision_verdict"),
            "confidence": signals.get("vision_confidence"),
            "note": signals.get("vision_note") or "",
            "source": "check_me",
        }
        return _evaluate_check(session, signals)

    if event_type == "complete_step":
        return _complete_step(session, signals)

    return session


def _apply_sense(session: dict, signals: dict) -> dict:
    """Phone-side edges. No JPEG. Instant. Auto-recovers when the bench returns."""
    edge = str(signals.get("edge") or "").strip().lower()
    session["last_sense"] = {
        "at": _now(),
        "edge": edge,
        "brightness": signals.get("brightness"),
        "motion": signals.get("motion"),
        "skin": signals.get("skin"),
        "face": signals.get("face"),
    }
    session["updated_at"] = _now()

    if session["status"] in {STATUS_HARD_STOP, STATUS_COMPLETED}:
        return session

    if session["status"] == STATUS_SETUP:
        if edge in {"lost", "face"}:
            _set_line(session, LOST_LINE if edge == "lost" else FACE_LINE)
        elif edge == "found":
            name = session["coach"]["name"]
            _set_line(
                session,
                f"I'm {name}. Prop the phone so I can see the bench — not your face. "
                "When the work is in frame, tap I'm set.",
            )
        return session

    if edge == "lost":
        if session.get("interrupt") and session["interrupt"].get("reason") == "camera_lost":
            return session
        interrupt = _raise_interrupt(
            session,
            ASK,
            "camera_lost",
            LOST_LINE,
            "When the bench is back, I pick up. No tap needed.",
        )
        interrupt["interrupt"]["auto_recover"] = True
        return interrupt

    if edge == "face":
        if session.get("interrupt") and session["interrupt"].get("reason") == "face_not_bench":
            return session
        interrupt = _raise_interrupt(
            session,
            ASK,
            "face_not_bench",
            FACE_LINE,
            "Point me at the work. I keep going when I see the bench.",
        )
        interrupt["interrupt"]["auto_recover"] = True
        return interrupt

    if edge in {"found", "settled"}:
        interrupt = session.get("interrupt")
        if interrupt and interrupt.get("reason") in CAMERA_SENSE_REASONS:
            _clear_interrupt(session)
            session["status"] = STATUS_LIVE if session.get("setup_confirmed") else STATUS_SETUP
            _set_line(session, FOUND_LINE)
        return session

    # shock is local voice + a later settled glance. Do not steal the step line.
    return session


def _glance_confidence_ok(signals: dict) -> bool:
    """Glances stay quiet unless the look is clearly sure."""
    if signals.get("vision_unsure"):
        return False
    conf = signals.get("vision_confidence")
    if conf is None:
        return True
    try:
        return float(conf) >= GLANCE_MIN_CONFIDENCE
    except (TypeError, ValueError):
        return False


def _apply_glance(session: dict, signals: dict) -> dict:
    """Background look. Silent unless a high-confidence hard stop. Never nag."""
    if session["status"] != STATUS_LIVE or session.get("interrupt"):
        return session

    session["last_look"] = {
        "at": _now(),
        "verdict": signals.get("vision_verdict"),
        "confidence": signals.get("vision_confidence"),
        "note": signals.get("vision_note") or "",
        "source": signals.get("look_source") or "glance",
    }
    session["updated_at"] = _now()

    # Dark, unsure, missing glasses — ignore. A glance that nags feels like a spinner.
    if not _glance_confidence_ok(signals):
        return session

    step = current_step(session)
    if step and (step.get("optional") or step.get("verify") == "ppe"):
        return session

    if signals.get("part_inverted") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "part_inverted",
            "That piece is backwards. Do not drive another fastener. Flip it.",
            "Flip the part, tap I hear you, then Resume.",
        )

    if signals.get("guard_stuck") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "guard_stuck",
            "The guard is not snapping shut. Unplug it. We are not cutting on a sticky guard.",
            "Fix or swap the saw. Then Resume.",
        )

    if signals.get("vision_wrong"):
        note = signals.get("vision_note") or "That is not the move."
        return _raise_interrupt(
            session,
            HARD_STOP,
            "vision_wrong",
            f"Hold. {note}",
            "Fix it, then Check me again.",
        )

    return session


def _evaluate_check(session: dict, signals: dict) -> dict:
    project = session["project"]
    step = current_step(session)
    if not step:
        _set_line(session, "We are done. Admire it, then put the tools away.")
        return session

    if signals.get("part_inverted") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "part_inverted",
            "That piece is backwards. Do not drive another fastener. Flip it.",
            "Flip the part, tap I hear you, then Resume.",
        )

    if signals.get("guard_stuck") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "guard_stuck",
            "The guard is not snapping shut. Unplug it. We are not cutting on a sticky guard.",
            "Fix or swap the saw. Then Resume.",
        )

    if signals.get("hands_in_frame") is False and step.get("verify") in {"orientation", "cams", "stance"}:
        return _raise_interrupt(
            session,
            ASK,
            "hands_missing",
            "I need your hands and the part in the same frame. Scoot the phone.",
            "Get both in frame, then Check me again.",
        )

    if signals.get("vision_wrong") and step.get("optional"):
        session["checked_current"] = True
        session["status"] = STATUS_LIVE
        _set_line(session, "That check is optional. Skip it if you want — I will not freeze you over glasses.")
        return session

    if signals.get("vision_wrong") and signals.get("part_inverted") is not True and signals.get("guard_stuck") is not True:
        note = signals.get("vision_note") or "That is not the move."
        return _raise_interrupt(
            session,
            HARD_STOP,
            "vision_wrong",
            f"Hold. {note}",
            "Fix it, then Check me again.",
        )

    if signals.get("vision_unsure") and step.get("optional"):
        session["checked_current"] = True
        session["status"] = STATUS_LIVE
        _set_line(session, "I cannot see glasses and that is fine. Skip or move on.")
        return session

    if signals.get("vision_unsure"):
        note = signals.get("vision_note") or "I cannot tell from this angle."
        return _raise_interrupt(
            session,
            ASK,
            "vision_unsure",
            f"{note} Show me closer. I will not guess a green light.",
            "Move the phone, then Check me again.",
        )

    session["checked_current"] = True
    session["status"] = STATUS_LIVE
    note = signals.get("vision_note")
    if note:
        _set_line(session, f"That looks right. {note} {step['title']} is good. Keep going — or tap Done with this step.")
    else:
        _set_line(session, f"That looks right. {step['title']} is good. Keep going — or tap Done with this step.")
    return session


def _complete_step(session: dict, signals: dict) -> dict:
    project = session["project"]
    step = current_step(session)
    if not step:
        session["status"] = STATUS_COMPLETED
        session["completed_at"] = _now()
        _set_line(session, "That's a wrap. You did it without me having to yell twice.")
        return session

    if signals.get("part_inverted") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "part_inverted",
            "Do not call that done. The part is inverted. Flip it before the next fastener.",
            "Flip it, Check me, then Done with this step.",
        )

    if step.get("verify") in {"orientation", "guard"} and not session.get("checked_current") and not step.get("optional"):
        return _raise_interrupt(
            session,
            SOFT_PAUSE,
            "unchecked_step",
            "Let me look first. Tap Check me before you call the step done.",
            "Check me, then mark the step done.",
        )

    steps = session["project"]["steps"]
    session["step_index"] += 1
    session["checked_current"] = False
    session["updated_at"] = _now()

    if session["step_index"] >= len(steps):
        session["status"] = STATUS_COMPLETED
        session["completed_at"] = _now()
        _set_line(session, "Clean finish. That is how you do it when someone is actually watching.")
        return session

    nxt = current_step(session)
    session["status"] = STATUS_LIVE
    _set_line(session, f"Next: {nxt['title']}. {nxt['coach']}")
    return session


def session_public(session: dict) -> dict:
    """API-safe snapshot."""
    out = deepcopy(session)
    out.pop("_id", None)
    out["prefetch_lines"] = prefetch_lines(out)
    out["instant_lines"] = list(INSTANT_LINES)
    out["sense"] = dict(SENSE_SPEC)
    return out


def catalog() -> dict[str, Any]:
    return {
        "name": "viewTube",
        "tagline": "YouTube shows you how. viewTube watches you do it.",
        "promise": "The phone watches motion. The cloud only looks when something changes.",
        "sense": dict(SENSE_SPEC),
        "instant_lines": list(INSTANT_LINES),
        "coaches": list_coaches(),
        "projects": list_projects(),
    }
