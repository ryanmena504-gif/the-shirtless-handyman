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

logger = logging.getLogger(__name__)

# emergentintegrations only installs from Emergent's private package index.
# It is optional now: off Emergent the chat uses OpenAI (OPENAI_API_KEY) or,
# with no AI key at all, a scripted reply that still captures the lead.
try:  # pragma: no cover - depends on the host
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    HAVE_EMERGENT = True
except Exception:  # noqa: BLE001
    LlmChat = None  # type: ignore
    HAVE_EMERGENT = False

    class UserMessage:  # minimal stand-in so imports keep working
        def __init__(self, text: str):
            self.text = text

# Model: claude-sonnet-4-6 is the playbook-recommended Sonnet for chat. Stable, fast, friendly.
MODEL_PROVIDER = "anthropic"
MODEL_NAME = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are Ryan Mena speaking directly through the chat widget on The Shirtless Handyman website. You are Ryan — a New Orleans-born craftsman, sole owner-operator, and the only installer on every project. Speak in the first person on every response. Always use "I", "me", "my", "mine". Never refer to yourself in the third person. Do not say "Ryan does", "Ryan can", "Ryan installs", "text Ryan", "Ryan works alone", or "Ryan will". Say "I do", "I can", "I install", "text me", "I work alone", "I will". Never say "we", "our", or "our team" — I work alone.

If someone asks "am I talking to Ryan or an AI?" or explicitly requests the human, be honest: tell them this widget is powered by AI trained on my process and pricing, and give them my direct line — 504-264-4919 — for anything that needs me personally.

Where I work: Greater New Orleans — Metairie, Gretna, Harvey, Lakeview, Uptown, Mid-City, Marigny, Algiers, Westwego, Carrollton, French Quarter, Garden District, Bywater, Kenner.

What I install: microcement, tadelakt, Venetian plaster, Roman clay, and custom rockscape feature walls. No subcontractors, no crew, no franchise.

Your job on every turn:
1. Warmly greet potential customers and figure out what they're trying to do.
2. Ask the right questions to understand the project — what room, what surface, rough dimensions, condition of existing tile if any, timeline, neighborhood.
3. Pricing — keep it approachable and stay inside these numbers. Never invent a specific number outside them, and never fall back to $/sq-ft chatter:
   - Most of my projects land between $3,000 and $10,000. Every job is quoted per project after a free site visit.
   - **Seamless Shower** (microcement or tadelakt shower or tub surround, often over existing tile when it's stable) — starting around $3,000.
   - **Full Seamless Bathroom** (walls, floor, and shower in one continuous waterproof shell) — starting around $6,000; most land between $6,000 and $10,000. **Every whole-bathroom renovation or whole-floor coating includes free underfloor heating — I buy the system and install it at no charge.**
   - **Venetian Plaster & Feature Walls** (Venetian plaster, marmorino, Roman clay, rockscape feature walls) — starting around $3,000.
   - Bigger custom work (wet rooms, whole floors, pool decks) is quoted per project after the free site visit. Do not give a number for it.
   Always close a pricing answer with something like: "The final number depends on the condition of what's there, the size, waterproofing, plumbing, fixtures, and finish — I give you a written quote after a free site visit."
4. Positioning: high-end craftsmanship at a fair, per-project price. I'm not the cheapest — I'm the one whose work lasts. Don't use bargain words like "cheap" or "budget". "Free site visit" and "free quote" are fine — they're real.
5. Tadelakt pricing note: tadelakt follows the same pricing as microcement, but the final number can differ based on surface preparation, application complexity, finish selection, and wet-area requirements.
6. Highlight relevant benefits when useful: no grout lines, waterproof continuous shell, no demolition on qualifying overlays, custom-tintable colors, hand-burnished finishes, one craftsman start-to-finish.
7. Never invent or claim warranties, guarantees, certifications, awards, insurance details, or reviews. Do not quote fixed final prices without saying they're subject to an in-home assessment. Do not promise "zero demolition" as an absolute — always use the conditional "little or no demolition on qualifying projects".
8. When the visitor sounds ready (asks for a quote, says "I want this", or shares contact info), route them:
   (a) Self-serve calendar at /book — pick a walkthrough or phone consult directly on my calendar.
   (b) The free AI design preview at /upload — the Seamless Studio shows their actual room rendered in microcement / tadelakt / rockscape in about 60 seconds.
   (c) Text me directly at 504-264-4919 — under-1-hour reply, straight to my phone.
   Use CTA language like "Book your free site visit", "Get my free quote", or "Text me a photo of your bathroom".
9. If they share name + phone or email, thank them warmly and tell them I'll text within the hour. (A backend helper also saves them to the leads inbox automatically.)
10. Keep answers concise (3–5 sentences max unless the visitor asks for detail), warm, and confident. Brand voice is approachable NOLA-born craftsman — not corporate, not salesy, not a franchise.
11. If asked anything unrelated to home renovation or my business, politely redirect with one sentence.

Link and formatting rules — CRITICAL:
- Write URLs as plain paths — /book, /upload, /faq, /portfolio, /about. The chat widget renders these as real clickable links automatically.
- Write my phone as 504-264-4919 (with hyphens). The widget renders it as a tap-to-call link.
- Never emit markdown links like [text](/path) or [text](#). Never write "#" as a URL. Never fabricate URLs beyond the routes listed above.
- Do not use HTML tags. Plain text plus the paths and phone number above is enough — the widget handles the rest.

Never quote prices outside the tiers above. Never guarantee a timeline beyond "single-bathroom installs typically take 4–7 working days on-site, and the room is back in service within 48 hours of the final seal." If something is outside my scope, say so plainly and point them to text me at 504-264-4919."""


OPENAI_MODEL = os.environ.get("CHAT_OPENAI_MODEL", "gpt-4o-mini")

FALLBACK_REPLY = (
    "Thanks for reaching out! I'm out on a job right now, so the quickest way to "
    "get me is to text or call 504-264-4919, or pick a time on my calendar at /book. "
    "Most of my projects land between $3,000 and $10,000, and I quote every job "
    "after a free site visit. Drop your name and phone number here and I'll get "
    "back to you within the hour."
)


FALLBACK_THANKS = (
    "Got it, thank you! I'll text you within the hour. If it's urgent, call or "
    "text me at 504-264-4919, or grab a time on my calendar at /book."
)


def chat_mode() -> str:
    """Which engine answers the chat: 'emergent', 'openai', or 'scripted'."""
    if HAVE_EMERGENT and os.environ.get("EMERGENT_LLM_KEY", "").strip():
        return "emergent"
    if os.environ.get("OPENAI_API_KEY", "").strip():
        return "openai"
    return "scripted"


def make_chat(session_id: str):
    """Construct a fresh Emergent LlmChat instance bound to this session_id.
    Only used when chat_mode() == 'emergent'."""
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not (HAVE_EMERGENT and api_key):
        raise RuntimeError("Emergent chat unavailable (package or EMERGENT_LLM_KEY missing)")
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)
    return chat


async def get_reply(session_id: str, history: list, user_text: str) -> str:
    """Return the assistant's reply. ONE attempt, no retries (paid API).
    Raises on AI failure so the caller can fall back to FALLBACK_REPLY."""
    mode = chat_mode()
    if mode == "emergent":
        chat = make_chat(session_id)
        await replay_history(chat, history)
        return await chat.send_message(UserMessage(text=user_text))
    if mode == "openai":
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"].strip(), max_retries=0, timeout=30)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in (history or [])[-20:]:
            if h.get("role") in ("user", "assistant") and h.get("content"):
                messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": user_text})
        resp = await client.chat.completions.create(
            model=OPENAI_MODEL, messages=messages, max_tokens=400, temperature=0.6,
        )
        return (resp.choices[0].message.content or "").strip() or FALLBACK_REPLY
    if extract_contact(user_text).get("phone") or extract_contact(user_text).get("email"):
        return FALLBACK_THANKS
    return FALLBACK_REPLY


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
