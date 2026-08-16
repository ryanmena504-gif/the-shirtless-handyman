"""Look at a still of the bench. Conservative. Never invent a green light."""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Optional

from viewtube import parse_vision_payload, vision_brief, vision_prompt

logger = logging.getLogger(__name__)

MAX_FRAME_CHARS = 1_800_000


def extract_json_object(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text or "")
    if not match:
        raise ValueError("Vision reply had no JSON")
    return json.loads(match.group())


def validate_frame(frame: Optional[str]) -> Optional[str]:
    if not frame:
        return None
    if not isinstance(frame, str):
        raise ValueError("Frame must be a data URL")
    cleaned = frame.strip()
    if not cleaned.startswith("data:image/"):
        raise ValueError("Frame must be a data URL")
    if len(cleaned) > MAX_FRAME_CHARS:
        raise ValueError("Frame is too large")
    return cleaned


def look_at_frame_sync(session: dict, frame: str, frame_ref: Optional[str] = None) -> dict:
    """Call the vision model. Raises on config/provider failure."""
    api_key = os.environ.get("EMERGENT_LLM_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("No AI key configured for vision")

    import litellm

    kwargs = {"api_key": api_key}
    if os.environ.get("EMERGENT_LLM_KEY"):
        try:
            from emergentintegrations.llm.utils import get_integration_proxy_url

            kwargs["api_base"] = get_integration_proxy_url() + "/llm"
        except Exception as exc:  # pragma: no cover - env-specific
            logger.warning("Emergent proxy unavailable (%s)", exc)

    brief = vision_brief(session)
    prompt = vision_prompt(brief)
    content: list = [{"type": "text", "text": prompt}]
    if frame_ref:
        content.extend(
            [
                {"type": "text", "text": "Image 1 is the reference — the right way."},
                {"type": "image_url", "image_url": {"url": frame_ref}},
                {"type": "text", "text": "Image 2 is now."},
                {"type": "image_url", "image_url": {"url": frame}},
            ]
        )
    else:
        content.append({"type": "image_url", "image_url": {"url": frame}})
    response = litellm.completion(
        model="openai/gpt-4o",
        messages=[{"role": "user", "content": content}],
        max_tokens=300,
        timeout=35,
        **kwargs,
    )
    raw_text = response.choices[0].message.content or ""
    payload = extract_json_object(raw_text)
    parsed = parse_vision_payload(payload)
    parsed["raw_note"] = parsed.get("vision_note")
    return parsed
