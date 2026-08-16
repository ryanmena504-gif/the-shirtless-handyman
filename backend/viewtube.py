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
    "check_me",
    "complete_step",
    "flag_wrong",
    "acknowledge_interrupt",
    "resume",
}

# Brightness below this means the bench is not visible enough to judge.
DARK_THRESHOLD = 0.12


MAX_SPEAK_CHARS = 500

COACHES = [
    {
        "id": "cole",
        "name": "Cole",
        "pronouns": "he/him",
        "voice": "male",
        "voice_source": "ai",
        "tts_voice": "onyx",
        "tts_model": "gpt-4o-mini-tts",
        "tts_instructions": (
            "You are Cole, an AI shop coach. Warm, slightly cocky, never sultry. "
            "Speak like a friend who will stop a bad cut. American English. Medium pace. "
            "No whisper. No flirt. Clear consonants."
        ),
        "tagline": "Calm, a little cocky, will not let you skip the glasses.",
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
        "tts_model": "gpt-4o-mini-tts",
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
        "blurb": "Glasses, guard, hands, line. Hard-stop only. This is the safety loop.",
        "duration": "10–15 min",
        "difficulty": "Safety",
        "requires_ppe": True,
        "category": "safety",
        "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=800&fit=crop&fm=jpg&q=80",
        "steps": [
            {
                "id": "ppe",
                "title": "Glasses on, sleeves clear",
                "coach": "I need to see glasses on your face before that trigger gets a finger. Non-negotiable.",
                "verify": "ppe",
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
        "tts_model": coach.get("tts_model", "gpt-4o-mini-tts"),
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


def _line(coach: dict, text: str) -> dict:
    return {
        "coach_id": coach["id"],
        "coach_name": coach["name"],
        "voice": coach["voice"],
        "voice_source": coach.get("voice_source", "ai"),
        "tts_voice": coach.get("tts_voice"),
        "text": text,
    }


def _interrupt(kind: str, reason: str, line: dict, resume_hint: str) -> dict:
    return {
        "id": f"int_{uuid.uuid4().hex[:10]}",
        "kind": kind,
        "reason": reason,
        "line": line,
        "resume_hint": resume_hint,
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


def _raise_interrupt(session: dict, kind: str, reason: str, text: str, resume_hint: str) -> dict:
    line = _line(session["coach"], text)
    interrupt = _interrupt(kind, reason, line, resume_hint)
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
    "ppe": "If a face is visible, are safety glasses on? If a power tool is visible, is anyone unprotected?",
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
        "- ppe_visible=false only when a face is visible and glasses are clearly absent, "
        "or a power tool is in use without glasses.\n"
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

    if session["status"] == STATUS_HARD_STOP and event_type not in {
        "acknowledge_interrupt",
        "resume",
        "confirm_safety",
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
        if project["requires_ppe"] and not session["safety_cleared"]:
            _set_line(
                session,
                "I can see the bench. Glasses on. Sleeves out of the way. Then tap I am safe.",
            )
        elif step:
            _set_line(session, f"I can see the bench. First move: {step['title']}. {step['coach']}")
        return session

    if event_type == "confirm_safety":
        if signals.get("ppe_visible") is False:
            return _raise_interrupt(
                session,
                HARD_STOP,
                "ppe_missing",
                "I can see a face and I do not see glasses. They go on before we call this safe.",
                "Glasses on, then I am safe.",
            )
        session["safety_cleared"] = True
        session["status"] = STATUS_LIVE
        if session.get("interrupt") and session["interrupt"].get("reason") == "ppe_missing":
            session["interrupt"]["acknowledged"] = True
            _clear_interrupt(session)
        if project["requires_ppe"] and step and step.get("verify") == "ppe":
            # Safety confirmation completes the PPE step.
            session["checked_current"] = True
        _set_line(session, "Glasses. Good. Now I will get picky.")
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
        }
        return _evaluate_check(session, signals)

    if event_type == "complete_step":
        return _complete_step(session, signals)

    return session


def _evaluate_check(session: dict, signals: dict) -> dict:
    project = session["project"]
    step = current_step(session)
    if not step:
        _set_line(session, "We are done. Admire it, then put the tools away.")
        return session

    if project["requires_ppe"] and not session["safety_cleared"]:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "ppe_missing",
            "Stop. I do not see glasses. Trigger stays untouched until they are on.",
            "Put glasses on, tap I am safe, then Resume.",
        )

    if signals.get("ppe_visible") is False and project["requires_ppe"]:
        session["safety_cleared"] = False
        return _raise_interrupt(
            session,
            HARD_STOP,
            "ppe_missing",
            "Glasses came off. We are frozen until they are back on.",
            "Glasses on. I am safe. Resume.",
        )

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

    if signals.get("vision_wrong") and signals.get("part_inverted") is not True and signals.get("guard_stuck") is not True:
        note = signals.get("vision_note") or "That is not the move."
        return _raise_interrupt(
            session,
            HARD_STOP,
            "vision_wrong",
            f"Hold. {note}",
            "Fix it, then Check me again.",
        )

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

    if project["requires_ppe"] and not session["safety_cleared"]:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "ppe_missing",
            "No. Safety first. Glasses, then we move.",
            "Tap I am safe, then Resume.",
        )

    if signals.get("part_inverted") is True:
        return _raise_interrupt(
            session,
            HARD_STOP,
            "part_inverted",
            "Do not call that done. The part is inverted. Flip it before the next fastener.",
            "Flip it, Check me, then Done with this step.",
        )

    if step.get("verify") in {"orientation", "ppe", "guard"} and not session.get("checked_current"):
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
    return out


def catalog() -> dict[str, Any]:
    return {
        "name": "viewTube",
        "tagline": "YouTube shows you how. viewTube watches you do it.",
        "coaches": list_coaches(),
        "projects": list_projects(),
    }
