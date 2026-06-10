"""
Conversational AI for The Shirtless Handyman website.

Uses the Emergent Universal Key + emergentintegrations to power a Claude-Sonnet
chatbot that:
  - Greets the visitor
  - Asks clarifying questions about their project
  - Returns ballpark pricing inside Ryan's published ranges
  - Captures a lead (name + phone OR email) when the visitor is ready, via the
    existing /api/leads/quick pipeline (source='ai_chat')
  - Always points back to texting 504-264-4919 for direct contact

Conversation memory is keyed by session_id and stored in MongoDB so the chat
survives page refreshes.
"""
import os
import logging
from typing import Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

# Model: claude-sonnet-4-6 is the playbook-recommended Sonnet for chat. Stable, fast, friendly.
MODEL_PROVIDER = "anthropic"
MODEL_NAME = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are Ryan's friendly AI assistant for The Shirtless Handyman, a premium seamless-surface renovation business in New Orleans run by Ryan Mena. Ryan specializes in microcement, tadelakt, Venetian plaster, Roman clay, and custom rockscape walls — installed across Greater New Orleans (Metairie, Gretna, Harvey, Lakeview, Uptown, Mid-City, Marigny, Algiers, Westwego, Carrollton, French Quarter, Garden District, Bywater, Kenner).

Your job:
1. Warmly greet potential customers and figure out what they're trying to do.
2. Ask the right questions to understand their project (what room, what surface, rough square footage, timeline, neighborhood).
3. Give honest ballpark pricing using ONLY these ranges (never invent specific numbers outside them):
   - Microcement: $18–$35/sq ft installed (showers, floors, counters)
   - Tadelakt: $22–$40/sq ft (waterproof lime plaster — great for showers)
   - Venetian plaster / Roman clay: $14–$28/sq ft (walls, accent walls)
   - Custom rockscape feature walls: $800–$2,500 depending on size
   - Full microcement bathroom transformation: typically $3,500–$8,500
   - Pool deck resurfacing: $3,000–$18,000 depending on square footage
4. Highlight the key benefits when relevant: no demolition needed, no grout lines, fully waterproof, zero off-gassing, custom-tintable colors, installed over existing tile.
5. When the visitor sounds ready (asks for a quote, says "I want this", or shares contact info), encourage them to either:
   (a) Try the free design preview at /upload (The Seamless Studio — AI shows their actual room rendered in microcement/tadelakt in 60 seconds), OR
   (b) Text Ryan directly at 504-264-4919 — that's the fastest path.
6. If they share their name + phone or email in conversation, thank them warmly and tell them Ryan will text within the hour. (A backend helper will also save them to the leads inbox.)
7. Keep answers concise (3–5 sentences max), warm, and helpful. Use casual, friendly language — Ryan's brand is approachable craftsman, not corporate.
8. You are NOT Ryan himself — you're his AI assistant. If they want Ryan personally, tell them to text 504-264-4919.
9. If asked anything unrelated to home renovation or this business, politely redirect with one sentence.

Important: never quote prices outside the ranges above. Never guarantee a timeline beyond "most single-room jobs take 2–5 days." If something is outside your scope, say so and point them to Ryan."""


def make_chat(session_id: str) -> LlmChat:
    """Construct a fresh LlmChat instance bound to this session_id.

    A new instance must be created per session per the integration playbook —
    we do NOT cache LlmChat across requests. Conversation history is restored
    from MongoDB by the caller before each turn.
    """
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY is missing — set it in backend/.env")
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)
    return chat


async def replay_history(chat: LlmChat, history: list) -> None:
    """Seed the LlmChat instance with prior turns so it has full context.

    `history` is a list of {"role": "user"|"assistant", "content": str} dicts.
    The emergentintegrations LlmChat instance accumulates history internally
    on each turn — but a fresh instance starts empty, so we restore prior
    state by calling its internal message buffer if available, or by feeding
    a single condensed "context" system addition. The cleanest portable way
    is to use the instance's `_messages` list when present (library internal).
    """
    if not history:
        return
    # The library exposes get_messages() for reads. For writes, we rely on the
    # underlying message buffer attribute used by the library. Wrap in try/except
    # so a future library refactor falls back gracefully (model still works,
    # just without memory of older turns inside this process).
    try:
        existing = getattr(chat, "_messages", None)
        if existing is not None and isinstance(existing, list):
            for h in history:
                existing.append({"role": h["role"], "content": h["content"]})
    except Exception as e:
        logger.warning(f"Could not restore chat history into LlmChat instance: {e}")


# ---------------------------------------------------------------------------
# Lead extraction — heuristic detection of contact info in user messages.
# Not perfect, but catches the common patterns and routes them to /api/leads/quick.
# ---------------------------------------------------------------------------
import re

PHONE_RE = re.compile(r"(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def extract_contact(text: str) -> dict:
    """Return a dict of any contact details found in `text`."""
    out = {"phone": "", "email": ""}
    m = PHONE_RE.search(text or "")
    if m:
        out["phone"] = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    em = EMAIL_RE.search(text or "")
    if em:
        out["email"] = em.group(0)
    return out


def build_chat_message_doc(session_id: str, role: str, content: str) -> dict:
    """Shape a single chat-message record for MongoDB persistence."""
    return {
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
