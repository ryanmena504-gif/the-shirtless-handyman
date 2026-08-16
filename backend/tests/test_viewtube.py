"""Unit tests for the viewTube session engine.

These do not need Mongo, a camera, or a live server — the product rules live
in backend/viewtube.py and must stay deterministic.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from viewtube import (
    HARD_STOP,
    SOFT_PAUSE,
    ASK,
    FOUND_LINE,
    INSTANT_LINES,
    LOOKING_LINE,
    LOST_LINE,
    MAX_SPEAK_CHARS,
    SAW_THAT_LINE,
    STATUS_ASK,
    STATUS_COMPLETED,
    STATUS_HARD_STOP,
    STATUS_LIVE,
    STATUS_SETUP,
    apply_event,
    catalog,
    create_session,
    get_coach,
    get_project,
    list_coaches,
    list_projects,
    prefetch_lines,
    session_public,
    speak_request,
    tts_spec,
    watch_mode,
)


def _live_session(project_id="flatpack-shelf", coach_id="cole"):
    session = create_session(coach_id, project_id)
    session = apply_event(session, "confirm_setup")
    if get_project(project_id)["requires_ppe"]:
        session = apply_event(session, "confirm_safety")
    return session


def test_catalog_has_two_coaches_and_six_projects():
    data = catalog()
    assert data["name"] == "viewTube"
    assert "watches you" in data["tagline"]
    assert {c["id"] for c in data["coaches"]} == {"cole", "avery"}
    assert len(data["projects"]) == 6
    assert {p["id"] for p in data["projects"]} >= {"flatpack-shelf", "floating-shelf", "faucet-swap", "tool-safety"}
    assert get_coach("cole")["voice"] == "male"
    assert get_coach("avery")["voice"] == "female"
    assert get_coach("cole")["voice_source"] == "ai"
    assert get_coach("avery")["voice_source"] == "ai"
    assert get_coach("cole")["tts_voice"] == "onyx"
    assert get_coach("avery")["tts_voice"] == "nova"
    assert get_coach("cole")["tts_model"] == "tts-1"
    assert "motion" in data["promise"].lower()
    assert data["sense"]["motion_shock"] == 0.11
    assert "Hold. I saw that." in data["instant_lines"]


def test_unknown_coach_or_project_raises():
    with pytest.raises(ValueError, match="Unknown coach"):
        create_session("not-a-coach", "flatpack-shelf")
    with pytest.raises(ValueError, match="Unknown project"):
        create_session("cole", "not-a-project")


def test_session_starts_in_setup_with_named_coach():
    session = create_session("avery", "paint-wall")
    assert session["status"] == STATUS_SETUP
    assert session["coach_id"] == "avery"
    assert session["step_index"] == 0
    assert session["safety_cleared"] is False
    assert "Avery" in session["coach_line"]["text"]
    assert session["id"].startswith("vt_")


def test_confirm_setup_goes_live_and_reads_first_step():
    session = apply_event(create_session("cole", "flatpack-shelf"), "confirm_setup")
    assert session["status"] == STATUS_LIVE
    assert session["setup_confirmed"] is True
    assert "Lay out every part" in session["coach_line"]["text"]


def test_ppe_is_optional_and_never_hard_stops():
    session = apply_event(create_session("cole", "tool-safety"), "confirm_setup")
    session = apply_event(session, "check_me")
    assert session["status"] != STATUS_HARD_STOP
    assert not session.get("interrupt") or session["interrupt"]["reason"] != "ppe_missing"


def test_cannot_resume_hard_stop_without_ack():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "flag_wrong")
    with pytest.raises(ValueError, match="Acknowledge"):
        apply_event(session, "resume")


def test_bypass_safety_skips_glasses_and_moves_on():
    session = apply_event(create_session("avery", "tool-safety"), "confirm_setup")
    assert session["project"]["steps"][0]["verify"] == "ppe"
    session = apply_event(session, "bypass_safety")
    assert session["safety_cleared"] is True
    assert session["safety_bypassed"] is True
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["step_index"] == 1
    assert session["project"]["steps"][session["step_index"]]["id"] == "guard"


def test_confirm_safety_does_not_reject_missing_glasses():
    session = apply_event(create_session("avery", "tool-safety"), "confirm_setup")
    session = apply_event(session, "confirm_safety", {"ppe_visible": False})
    assert session["status"] != STATUS_HARD_STOP
    assert session["safety_cleared"] is True


def test_inverted_part_is_a_hard_stop():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "check_me", {"part_inverted": True})
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "part_inverted"
    assert "backwards" in session["coach_line"]["text"].lower()


def test_too_dark_is_a_soft_pause_not_a_hard_stop():
    session = _live_session("paint-wall")
    session = apply_event(session, "check_me", {"brightness": 0.04})
    assert session["status"] != STATUS_HARD_STOP
    assert session["interrupt"]["kind"] == SOFT_PAUSE
    assert session["interrupt"]["reason"] == "too_dark"


def test_flag_wrong_always_hard_stops():
    session = _live_session("drywall-patch")
    session = apply_event(session, "flag_wrong")
    assert session["interrupt"]["kind"] == HARD_STOP
    assert session["interrupt"]["reason"] == "flag_wrong"


def test_orientation_step_requires_check_before_complete():
    session = _live_session("flatpack-shelf")
    # First step verify is parts_visible — complete is allowed after... wait,
    # layout verify is parts_visible, not orientation. Advance to side-panel.
    session = apply_event(session, "complete_step")
    assert session["step_index"] == 1
    session = apply_event(session, "complete_step")
    assert session["interrupt"]["kind"] == SOFT_PAUSE
    assert session["interrupt"]["reason"] == "unchecked_step"
    assert session["step_index"] == 1


def test_check_then_complete_advances():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "complete_step")  # layout
    session = apply_event(session, "check_me")
    assert session["checked_current"] is True
    session = apply_event(session, "complete_step")
    assert session["step_index"] == 2
    assert session["status"] == STATUS_LIVE
    assert "cam" in session["coach_line"]["text"].lower()


def test_finishing_last_step_completes_session():
    session = _live_session("paint-wall")
    for _ in get_project("paint-wall")["steps"]:
        session = apply_event(session, "check_me")
        session = apply_event(session, "complete_step")
    assert session["status"] == STATUS_COMPLETED
    assert session["completed_at"]
    assert session["step_index"] == len(get_project("paint-wall")["steps"])


def test_unknown_event_raises():
    session = create_session("cole", "paint-wall")
    with pytest.raises(ValueError, match="Unknown event"):
        apply_event(session, "dance")


def test_blocked_events_while_hard_stopped():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "flag_wrong")
    with pytest.raises(ValueError, match="stopped"):
        apply_event(session, "complete_step")


def test_hands_missing_asks_instead_of_stopping():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "complete_step")  # onto orientation step
    session = apply_event(session, "check_me", {"hands_in_frame": False})
    assert session["interrupt"]["kind"] == ASK
    assert session["interrupt"]["reason"] == "hands_missing"


def test_speak_request_is_ai_only():
    req = speak_request("cole", "  Hold. Flip that panel.  ")
    assert req["voice_source"] == "ai"
    assert req["tts_voice"] == "onyx"
    assert req["text"] == "Hold. Flip that panel."
    assert "sultry" in req["tts_instructions"]
    avery = tts_spec("avery")
    assert avery["tts_voice"] == "nova"
    assert avery["tts_model"] == "tts-1"


def test_speak_request_rejects_empty_and_unknown():
    with pytest.raises(ValueError, match="Nothing to say"):
        speak_request("cole", "   ")
    with pytest.raises(ValueError, match="Unknown coach"):
        speak_request("ryan", "Hey")
    with pytest.raises(ValueError, match="too long"):
        speak_request("avery", "x" * (MAX_SPEAK_CHARS + 1))


def test_coach_line_marks_ai_voice():
    session = create_session("avery", "paint-wall")
    assert session["coach_line"]["voice_source"] == "ai"
    assert session["coach_line"]["tts_voice"] == "nova"


def test_tts_cache_key_is_stable():
    from viewtube_tts import cache_key

    assert cache_key("cole", "Hold.") == cache_key("cole", "Hold.")
    assert cache_key("cole", "Hold.") != cache_key("avery", "Hold.")


def test_vision_unsure_asks_instead_of_green_light():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "check_me", {
        "vision_unsure": True,
        "vision_note": "I only see a knee.",
    })
    assert session["interrupt"]["kind"] == ASK
    assert session["interrupt"]["reason"] == "vision_unsure"
    assert session["checked_current"] is False
    assert "knee" in session["coach_line"]["text"].lower()


def test_vision_wrong_hard_stops_with_note():
    session = _live_session("floating-shelf")
    session = apply_event(session, "complete_step")  # onto orientation bracket
    session = apply_event(session, "check_me", {
        "vision_wrong": True,
        "vision_note": "The bracket fingers point at the floor.",
    })
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "vision_wrong"
    assert "floor" in session["coach_line"]["text"].lower()


def test_bench_not_in_frame_blocks_setup():
    session = create_session("cole", "faucet-swap")
    session = apply_event(session, "confirm_setup", {"bench_in_frame": False})
    assert session["interrupt"]["kind"] == ASK
    assert session["interrupt"]["reason"] == "bench_missing"
    assert session["setup_confirmed"] is False


def test_parse_and_merge_vision_never_invents_ok():
    from viewtube import merge_vision_signals, parse_vision_payload
    from viewtube_vision import extract_json_object

    parsed = parse_vision_payload({
        "verdict": "OK",
        "confidence": "0.4",
        "part_inverted": None,
        "note": "Too dark to judge the cam arrows " + ("x" * 200),
    })
    assert parsed["vision_verdict"] == "ok"
    assert parsed["vision_unsure"] is True
    assert "part_inverted" not in parsed
    assert len(parsed["vision_note"]) <= 140

    merged = merge_vision_signals({"brightness": 0.8}, parsed)
    assert merged["brightness"] == 0.8
    assert merged["vision_unsure"] is True

    blob = extract_json_object("Sure.\n```json\n{\"verdict\": \"unsure\", \"confidence\": 0.2, \"note\": \"face\"}\n```")
    assert blob["verdict"] == "unsure"


def test_vision_brief_names_the_step():
    from viewtube import vision_brief, vision_prompt

    session = _live_session("flatpack-shelf")
    brief = vision_brief(session)
    assert brief["verify"] == "parts_visible"
    assert "hardware" in brief["look_for"].lower()
    prompt = vision_prompt(brief)
    assert "Never invent a green light" in prompt
    assert "Flat-pack shelf" in prompt


def test_list_helpers_do_not_leak_mutability():
    coaches = list_coaches()
    coaches[0]["name"] = "MUTATED"
    assert get_coach("cole")["name"] == "Cole"
    projects = list_projects()
    projects[0]["title"] = "MUTATED"
    assert get_project("flatpack-shelf")["title"] == "Flat-pack shelf"


def test_glance_unsure_does_not_interrupt():
    session = _live_session("flatpack-shelf")
    line = session["coach_line"]["text"]
    session = apply_event(session, "glance", {
        "vision_unsure": True,
        "vision_note": "I only see a knee.",
        "vision_confidence": 0.3,
        "brightness": 0.04,
    })
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == line
    assert session["last_look"]["source"] == "glance"


def test_glance_inverted_still_stops():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "glance", {
        "part_inverted": True,
        "vision_wrong": True,
        "vision_confidence": 0.82,
        "vision_note": "The finished edge faces in.",
    })
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "part_inverted"
    assert "backwards" in session["coach_line"]["text"].lower()


def test_glance_low_confidence_danger_is_silent():
    session = _live_session("flatpack-shelf")
    line = session["coach_line"]["text"]
    session = apply_event(session, "glance", {
        "part_inverted": True,
        "vision_unsure": True,
        "vision_confidence": 0.4,
    })
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == line


def test_glance_ignores_optional_ppe_wrong():
    session = apply_event(create_session("cole", "tool-safety"), "confirm_setup")
    line = session["coach_line"]["text"]
    session = apply_event(session, "glance", {
        "vision_wrong": True,
        "vision_confidence": 0.95,
        "vision_note": "No glasses in frame.",
    })
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == line


def test_glance_while_stopped_is_noop():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "flag_wrong")
    session = apply_event(session, "glance", {
        "part_inverted": True,
        "vision_confidence": 0.99,
    })
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "flag_wrong"


def test_prefetch_lines_include_looking_and_steps():
    session = create_session("cole", "flatpack-shelf")
    lines = prefetch_lines(session)
    assert lines[0] == LOOKING_LINE
    assert SAW_THAT_LINE in lines
    assert LOST_LINE in lines
    assert session["coach_line"]["text"] in lines
    assert any("Lay out every part" in text for text in lines)
    public = session_public(session)
    assert public["prefetch_lines"][0] == LOOKING_LINE
    assert public["instant_lines"] == list(INSTANT_LINES)
    assert "prefetch_lines" not in session


def test_sense_lost_asks_and_found_resumes_without_a_tap():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "sense", {"edge": "lost", "brightness": 0.04})
    assert session["status"] == STATUS_ASK
    assert session["interrupt"]["reason"] == "camera_lost"
    assert session["interrupt"]["auto_recover"] is True
    assert session["coach_line"]["text"] == LOST_LINE
    session = apply_event(session, "sense", {"edge": "found", "brightness": 0.6})
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == FOUND_LINE


def test_sense_shock_does_not_steal_the_step_line():
    session = _live_session("flatpack-shelf")
    line = session["coach_line"]["text"]
    session = apply_event(session, "sense", {"edge": "shock", "motion": 0.2})
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == line
    assert session["last_sense"]["edge"] == "shock"


def test_sense_during_setup_does_not_block_im_set():
    session = create_session("avery", "paint-wall")
    session = apply_event(session, "sense", {"edge": "lost"})
    assert session["status"] == STATUS_SETUP
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == LOST_LINE
    session = apply_event(session, "confirm_setup")
    assert session["status"] == STATUS_LIVE


def test_sense_does_not_override_a_hard_stop():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "flag_wrong")
    session = apply_event(session, "sense", {"edge": "lost"})
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "flag_wrong"


def test_js_sense_spec_matches_backend():
    from pathlib import Path

    root = Path(__file__).resolve().parents[2]
    js = (root / "frontend/src/lib/viewtubeSense.js").read_text()
    spec = catalog()["sense"]
    assert f"dark: {spec['dark']}" in js
    assert f"motionShock: {spec['motion_shock']}" in js
    assert f"motionSettle: {spec['motion_settle']}" in js
    assert f"skinFace: {spec['skin_face']}" in js
    assert f"lostFrames: {spec['lost_frames']}" in js
    assert f"settleFrames: {spec['settle_frames']}" in js
    assert f"shockCooldownMs: {spec['shock_cooldown_ms']}" in js
    assert f"heartbeatMs: {spec['heartbeat_ms']}" in js
    assert "export function motionMatters" in js


def test_tts_disk_cache_skips_the_network(tmp_path, monkeypatch):
    import viewtube_tts as tts

    monkeypatch.setattr(tts, "_DISK", tmp_path)
    tts._CACHE.clear()
    key = tts.cache_key("cole", "Hold. I saw that.")
    (tmp_path / f"{key}.mp3").write_bytes(b"cached-mp3")
    assert tts.synthesize_sync("cole", "Hold. I saw that.") == b"cached-mp3"


def test_every_step_knows_how_closely_to_watch():
    for project in list_projects():
        for step in project["steps"]:
            assert step["watch"] in {"ambient", "placement", "danger"}
    shelf = get_project("flatpack-shelf")
    assert shelf["steps"][0]["watch"] == "ambient"
    assert shelf["steps"][1]["watch"] == "placement"
    assert get_project("tool-safety")["steps"][1]["watch"] == "danger"
    assert catalog()["watch_modes"]["placement"]


def test_ambient_settled_glance_does_not_look():
    session = _live_session("flatpack-shelf")
    assert watch_mode(session["project"]["steps"][session["step_index"]]) == "ambient"
    line = session["coach_line"]["text"]
    session = apply_event(session, "glance", {
        "look_source": "settled",
        "part_inverted": True,
        "vision_confidence": 0.92,
    })
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
    assert session["coach_line"]["text"] == line


def test_placement_settled_glance_still_stops_inverted():
    session = _live_session("flatpack-shelf")
    session = apply_event(session, "complete_step")
    assert watch_mode(session["project"]["steps"][session["step_index"]]) == "placement"
    session = apply_event(session, "glance", {
        "look_source": "settled",
        "part_inverted": True,
        "vision_confidence": 0.92,
    })
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["reason"] == "part_inverted"
