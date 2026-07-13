# The Shirtless Handyman — PRD

## Problem Statement
High-converting lead-gen + SEO site for Ryan Mena's NOLA seamless-surfaces business (microcement, tadelakt, rockscape, pool deck resurfacing).

## Core Features (Implemented)
- AI Visualizer ("The Seamless Studio") — upload room → AI-generated designs
- Lead capture (Twilio SMS + Resend email) with quick-quote form, sticky mobile CTA
- Interactive Pricing Calculator with estimate confirmation emails
- AI Chatbot (Claude Sonnet 4.5 via Emergent LLM key) — sales-rep persona
- Chat booking flow — inline day/time picker inside the chat widget
- **Self-serve /book calendar** (NEW, Feb 2026): 60-day calendar with real availability, 4 appointment types (walkthrough / phone / site prep / project start), 60-min slots, Mon–Sat 8–5 CT, server-side double-booking prevention (409 on conflict), 2h same-day cutoff
- 3-email follow-up sequence (day 1/3/5) for every lead
- Google Reviews widget (backend cache + graceful degrade — waiting on correct business Place ID)
- Promo banner (top of every homeowner page) — "Signature Offer: up to 30 sq ft of radiant heated flooring at no additional charge with every qualifying Signature Grout-Free Bathroom Transformation"
- Static Site Generation via GitHub Action
- 13 local-SEO landing pages + 5 blog posts + full JSON-LD schema

## Recent Additions (Feb 2026)
- `/microcement-installers-new-orleans` — hiring-intent landing page
- `/blog/how-to-choose-microcement-installer-new-orleans` — companion blog post
- `/book` — self-serve calendar page
- PromoBanner replacing the broken ExitIntentModal
- Chat booking flow, follow-up email sequence, Google Reviews infra
- **Feb 2026 — Premium pricing/positioning rewrite**: 3 tiers rewritten as "Starting at" copy (Essential $5,500 / Signature $15,000 / Luxury $30,000), heated flooring gift moved into a Signature-tier callout (up to 30 sq ft at no additional charge), Tadelakt priced under "same general service tiers" language, tile-overlay wording tightened ("often be installed…after the tile assembly is inspected, cleaned, prepared, and confirmed to be stable"), bargain CTAs removed sitewide ("Free Quote" → "Request a Bathroom Assessment", "See If Your Bathroom Qualifies", "Get a Seamless Transformation Quote"), TrustStrip positioning replaced with "Premium materials, disciplined preparation, and craftsmanship built for long-term value.", and JSON-LD OfferCatalog + `llms.txt` + `llms-full.txt` all updated to match.
- **Feb 2026 — JSON-LD hygiene pass**: purged 6 legacy `<script type="application/ld+json">` blocks from `frontend/public/index.html` that were duplicating React-injected schema and holding stale $2,000–$8,000 pricing + fabricated 5-star reviews (Google policy risk). React `SeoHead` is now the sole source of structured data. Verified via browser DOM: exactly one `HomeAndConstructionBusiness` node, one `WebSite` node, `hasOfferCatalog` with numeric `minPrice` of 5500/15000/30000 in USD.
- **Feb 2026 — Chatbot voice cleanup (`chat_service.py`)**: system prompt rewritten to (a) enforce first-person Ryan voice, explicitly forbidding "we / our / our team" (verified live: 0 plural hits, 3+ singular hits on probe test), (b) replace stale $18–$35/sq-ft chatter with the new 3-tier pricing structure and heated-flooring inclusion, (c) mandate premium-positioning language and the new "Request a Bathroom Assessment / See If Your Bathroom Qualifies / Get a Seamless Transformation Quote" CTAs, and (d) surface `/book` as an equal-weight booking path alongside `/upload` and 504-264-4919.
- **Feb 2026 — Sitewide first-person voice sweep + trust cleanup (P1.5 + P1.6)**: Deleted 3 fabricated homepage testimonial cards (Sarah M., Marcus & Tina D., Jason R.). Rewrote 25 "Text Ryan" CTAs, 1 "call Ryan", 1 "You're on Ryan's list.", 1 "We'll send...Ryan's honest cost range", 1 "You text Ryan, he shows up", 1 "you just found him", and 4 partner-contractor "We install/handle/work" plural voice phrases across `HomePage.js`, `Navbar.js`, `PortfolioPage.js`, `AnalysisPage.js`, `RoomAnalysis.js`, `FaqPage.js`, `AboutPage.js`, `BlogPostPage.js`, `BookPage.js`, `ResultsPage.js`, `PricingCalculator.js`, `BookingPanel.js`, `InstantQuoteForm.js`, `EmailCaptureModal.js`, `LocalServicePage.js`. Also swapped 11 `metaDescription` "Text Ryan:" → "Text me:" in `localServiceConfigs.js` (SEO preserved). Rewrote `SocialProofToast.js` — 9-name fabricated activity rotator gone, replaced with a single static truthful trust line.
- **Feb 2026 — P2 Admin Schedule Blocker**: New `/admin/schedule` UI + `schedule_admin_service.py` module. Supports full-day + partial-day one-time blocks (`availability_blocks`) and recurring weekly rules (`availability_rules`). Categories: personal / project / vacation / unavailable / other. Every admin write endpoint requires admin JWT + performs conflict pre-check against existing bookings (returns 409 with conflict list; admin must explicitly `acknowledge_conflicts: true` to save). Existing bookings NEVER modified. All computation in America/Chicago. `is_slot_available` and `get_availability` in `schedule_service.py` extended to honor both blocks and rules — so `/book`, chatbot, and direct-API bookings are all rejected server-side for blocked slots. Bookings now persist `slot_end_utc` alongside `slot_start_utc` for accurate conflict detection. 8/8 acceptance tests passed (full-day block hides date, partial-day hides only affected slots, weekly Sunday closes future Sundays, delete restores availability, existing bookings untouched, 409 conflict warning, direct-API rejection, Chicago tz served).

## Backlog
- P1: Get correct Google Business Profile Place ID from Ryan → activate reviews widget
- P1: Admin UI for Ryan to block dates on the calendar (vacation, on-site jobs)
- P2: Daily digest email to Ryan of pending bookings
- P2: Admin dashboard view of `db.bookings`
- P2: Google Calendar sync for `db.bookings`

## Integrations
- Emergent LLM Key: Claude Sonnet 4.5, GPT Image 1 + Vision, Gemini Nano Banana
- Twilio SMS, Resend Email (user keys)
- Google Places API — Place ID set (residential address — needs replacement), API key set

## Architecture
- Frontend: React + Tailwind + Framer Motion + react-helmet-async + react-router
- Backend: FastAPI + MongoDB (`projects`, `leads`, `bookings`, `lead_followups`, `lead_unsubscribes`, `google_reviews_cache`, `chat_messages`, `availability_blocks`)
- Background worker: follow-up email scheduler polls every 5 min
- Scheduling: `schedule_service.py` computes availability from static rules + `bookings` + `availability_blocks`. Uses `zoneinfo` for America/Chicago DST.
- SSG: GitHub Action prerenders → DOM fragments injected at build

## Key API Endpoints
- `GET /api/schedule/availability?days=60` — public calendar data
- `POST /api/bookings` — accepts slot_iso (canonical) or preferred_date+time (legacy chat)
- `GET /api/google-reviews` — cached Place Details
- `GET /api/followups/unsubscribe/{token}` — one-click unsubscribe
- `POST /api/leads`, `POST /api/leads/quick`, `POST /api/projects/upload`, `POST /api/chat`

## Tests
- `/app/backend/tests/test_scheduling.py` — 13 pytest cases covering availability + booking flow + validation. All passing.
