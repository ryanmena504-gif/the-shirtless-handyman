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
)


def _live_session(project_id="flatpack-shelf", coach_id="cole"):
    session = create_session(coach_id, project_id)
    session = apply_event(session, "confirm_setup")
    if get_project(project_id)["requires_ppe"]:
        session = apply_event(session, "confirm_safety")
    return session


def test_catalog_has_two_coaches_and_four_projects():
    data = catalog()
    assert data["name"] == "viewTube"
    assert "watches you" in data["tagline"]
    assert {c["id"] for c in data["coaches"]} == {"cole", "avery"}
    assert len(data["projects"]) == 4
    assert get_coach("cole")["voice"] == "male"
    assert get_coach("avery")["voice"] == "female"


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


def test_ppe_project_hard_stops_before_safety_cleared():
    session = apply_event(create_session("cole", "tool-safety"), "confirm_setup")
    session = apply_event(session, "check_me")
    assert session["status"] == STATUS_HARD_STOP
    assert session["interrupt"]["kind"] == HARD_STOP
    assert session["interrupt"]["reason"] == "ppe_missing"
    assert "glasses" in session["coach_line"]["text"].lower()


def test_cannot_resume_hard_stop_without_ack():
    session = apply_event(create_session("avery", "tool-safety"), "confirm_setup")
    session = apply_event(session, "check_me")
    with pytest.raises(ValueError, match="Acknowledge"):
        apply_event(session, "resume")


def test_ack_then_resume_after_safety():
    session = apply_event(create_session("avery", "tool-safety"), "confirm_setup")
    session = apply_event(session, "check_me")
    session = apply_event(session, "acknowledge_interrupt")
    assert session["interrupt"]["acknowledged"] is True
    session = apply_event(session, "confirm_safety")
    session = apply_event(session, "resume")
    assert session["status"] == STATUS_LIVE
    assert session["interrupt"] is None
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


def test_list_helpers_do_not_leak_mutability():
    coaches = list_coaches()
    coaches[0]["name"] = "MUTATED"
    assert get_coach("cole")["name"] == "Cole"
    projects = list_projects()
    projects[0]["title"] = "MUTATED"
    assert get_project("flatpack-shelf")["title"] == "Flat-pack shelf"
