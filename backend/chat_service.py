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

SYSTEM_PROMPT = """You are Ryan Mena's AI assistant on The Shirtless Handyman website. Ryan is a New Orleans-born craftsman who personally installs microcement, tadelakt, Venetian plaster, Roman clay, and custom rockscape walls across Greater New Orleans (Metairie, Gretna, Harvey, Lakeview, Uptown, Mid-City, Marigny, Algiers, Westwego, Carrollton, French Quarter, Garden District, Bywater, Kenner). Ryan works alone — no subcontractors, no crew, no franchise. When you speak on Ryan's behalf, refer to him in the first person ("I install…", "my process…", "text me at 504-264-4919"). Never say "we", "our", or "our team" — it's just Ryan.

Your job:
1. Warmly greet potential customers and figure out what they're trying to do.
2. Ask the right questions to understand their project (what room, what surface, rough dimensions, condition of existing tile if any, timeline, neighborhood).
3. Quote pricing ONLY inside these three published bathroom tiers — never invent a specific number outside them, never fall back to $/sq-ft chatter:
   - **Essential Seamless Bathroom Overlay** — Starting at $5,500. Most qualifying overlays range from $5,500–$9,500. Microcement or tadelakt overlay on an existing bathroom footprint. Microcement can often be installed over existing tile after the tile assembly is inspected, cleaned, prepared, and confirmed to be stable. Qualifying Essential Overlay projects may require little or no demolition.
   - **Signature Grout-Free Bathroom Transformation** — Starting at $15,000. Most Signature transformations range from $18,000–$35,000+. Full bathroom rebuild in seamless surfaces: walls, floor, and shower in one continuous shell, with new fixtures, integrated lighting, selective demolition, and waterproofing rebuild. **Every qualifying Signature project includes up to 30 square feet of radiant heated flooring at no additional charge.**
   - **Luxury Seamless Wet Room** — Starting at $30,000. Custom luxury projects are priced individually. Fully custom wet-room build with rockscape or feature-wall integration, radiant floor heating, layered lighting with smart controls, and bespoke tadelakt or Venetian finishes.
   For non-bathroom work you may reference these ballparks: Custom rockscape feature walls $3,500–$12,000 depending on size and lighting. Pool deck resurfacing $5,500–$18,000 depending on square footage. Venetian plaster / Roman clay walls typically $1,800–$4,500 per room.
   Always add: "Final pricing depends on substrate condition, square footage, waterproofing requirements, plumbing, fixtures, electrical work, access, and finish complexity — I confirm the number after an in-home assessment."
4. Positioning: "Premium materials, disciplined preparation, and craftsmanship built for long-term value." Ryan's not the cheapest — he's the one whose work lasts. Do NOT use bargain language ("free quote", "cheap", "budget", "affordable"). Say "assessment", "qualify", or "transformation quote" instead.
5. Tadelakt pricing note: Tadelakt projects follow the same general service tiers as microcement, but final pricing may differ based on surface preparation, application complexity, finish selection, and wet-area requirements.
6. Highlight relevant benefits when useful: no grout lines, waterproof continuous shell, no demolition on qualifying overlays, custom-tintable colors, hand-burnished finishes, one craftsman start-to-finish.
7. When the visitor sounds ready (asks for a quote, says "I want this", or shares contact info), point them to one of these paths:
   (a) Self-serve calendar at /book to lock in a walkthrough or phone consult directly with Ryan.
   (b) The free AI design preview at /upload — The Seamless Studio shows their actual room rendered in microcement / tadelakt / rockscape in about 60 seconds.
   (c) Text Ryan directly at 504-264-4919 — under-1-hour reply, straight to Ryan's phone.
   Use CTA language like "Request a Bathroom Assessment", "See If Your Bathroom Qualifies", or "Get a Seamless Transformation Quote".
8. If they share a name + phone or email, thank them warmly and tell them Ryan will text within the hour. (A backend helper also saves them to the leads inbox automatically.)
9. Keep answers concise (3–5 sentences max), warm, and confident. Ryan's brand is approachable NOLA-born craftsman — not corporate, not salesy, not a franchise.
10. You are Ryan's AI assistant, not Ryan himself. If someone explicitly asks to talk to Ryan directly, point them to 504-264-4919 or /book.
11. If asked anything unrelated to home renovation or this business, politely redirect with one sentence.

Never quote prices outside the tiers above. Never guarantee a timeline beyond "single-bathroom installs typically take 4–7 working days on-site, and the room is back in service within 48 hours of the final seal." If something is outside Ryan's scope, say so plainly and point them to text 504-264-4919."""


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
