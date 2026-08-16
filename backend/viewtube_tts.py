"""AI text-to-speech for viewTube coaches.

Cole and Avery are synthetic. Nothing is recorded by a person.
Uses the same EMERGENT_LLM_KEY / OpenAI path as the rest of the app.
"""
from __future__ import annotations

import hashlib
import logging
import os
from typing import Optional

from viewtube import speak_request

logger = logging.getLogger(__name__)

_CACHE: dict[str, bytes] = {}
_CACHE_MAX = 64


def cache_key(coach_id: str, text: str) -> str:
    return hashlib.sha256(f"{coach_id}|{text.strip()}".encode("utf-8")).hexdigest()


def _openai_client():
    emergent = os.environ.get("EMERGENT_LLM_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    api_key = emergent or openai_key
    if not api_key:
        raise RuntimeError("No AI key configured for TTS")

    from openai import OpenAI

    kwargs = {"api_key": api_key}
    if emergent:
        try:
            from emergentintegrations.llm.utils import get_integration_proxy_url

            kwargs["base_url"] = get_integration_proxy_url() + "/llm"
        except Exception as exc:  # pragma: no cover - env-specific
            logger.warning("Emergent proxy unavailable (%s); using default OpenAI host", exc)
    return OpenAI(**kwargs)


def _audio_bytes(response) -> bytes:
    if hasattr(response, "content") and response.content:
        return response.content
    if hasattr(response, "read"):
        return response.read()
    raise RuntimeError("TTS response had no audio")


def synthesize_sync(coach_id: str, text: str) -> bytes:
    req = speak_request(coach_id, text)
    key = cache_key(req["coach_id"], req["text"])
    cached = _CACHE.get(key)
    if cached:
        return cached

    client = _openai_client()
    audio: Optional[bytes] = None
    try:
        response = client.audio.speech.create(
            model=req["tts_model"],
            voice=req["tts_voice"],
            input=req["text"],
            instructions=req["tts_instructions"],
            response_format="mp3",
        )
        audio = _audio_bytes(response)
    except Exception as exc:
        logger.warning("Steerable TTS failed (%s); falling back to tts-1", exc)
        response = client.audio.speech.create(
            model="tts-1",
            voice=req["tts_voice"],
            input=req["text"],
            response_format="mp3",
        )
        audio = _audio_bytes(response)

    if not audio:
        raise RuntimeError("AI voice returned empty audio")

    if len(_CACHE) >= _CACHE_MAX:
        _CACHE.pop(next(iter(_CACHE)))
    _CACHE[key] = audio
    return audio
