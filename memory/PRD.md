# The Shirtless Handyman — PRD

## Problem Statement
High-converting lead-gen + SEO site for Ryan Mena's NOLA seamless-surfaces business (microcement, tadelakt, rockscape, pool deck resurfacing).

## Core Features (Implemented)
- AI Visualizer ("The Seamless Studio") — upload room → AI generates 3 budget-aware seamless-surface designs
- Lead capture (Twilio SMS + Resend email) with quick-quote form, exit-intent modal, sticky mobile CTA
- Interactive Pricing Calculator with auto-firing estimate confirmation emails
- AI Chatbot (Claude Sonnet 4.5 via Emergent LLM key) — sales-rep persona
- **Chat booking flow** (NEW, Feb 2026): inline day/time picker in chat widget → auto-texts Ryan an SMS appointment + emails customer confirmation + writes to db.bookings AND db.leads
- **3-email follow-up sequence** (NEW, Feb 2026): every lead with email gets day 1 nudge, day 3 case-study, day 5 soft-close. Background worker polls every 5 min. One-click unsubscribe via `/api/followups/unsubscribe/{token}`
- **Google Reviews widget** (NEW, Feb 2026): backend proxies Place Details API + 12h Mongo TTL cache. Place ID stored, API key pending from user — widget self-hides until key is added
- Static Site Generation (SSG) via GitHub Action — DOM fragments injected into React shell for SEO
- 13 local-SEO landing pages + 5 blog posts + JSON-LD schema (Service, Breadcrumb, FAQ, AggregateRating)

## Local-SEO Landing Pages
- /microcement-new-orleans — service-intent
- /microcement-installers-new-orleans — hiring-intent (Feb 2026)
- /microcement-metairie, /tadelakt-new-orleans, /rockscape-walls-new-orleans, /pool-deck-resurfacing-new-orleans
- Neighborhood: /lakeview-handyman, /uptown-handyman, /mid-city-handyman, /bywater-handyman, /french-quarter-handyman, /garden-district-handyman

## Blog Posts
- /blog/microcement-vs-tile-cost-new-orleans
- /blog/best-microcement-contractor-new-orleans
- /blog/tadelakt-vs-microcement-bathroom
- /blog/why-tile-fails-in-new-orleans-humidity
- /blog/how-to-choose-microcement-installer-new-orleans (NEW, Feb 2026 — companion to installer landing page)

## Backlog
- P1: Capture Google Places API key from Ryan to activate live reviews widget
- P2: Send Ryan a digest email of pending bookings each morning
- P2: Admin dashboard view of `db.bookings` (currently only viewable in mongo)

## Integrations
- Emergent LLM Key: Claude Sonnet 4.5 (chat), GPT Image 1 + Vision (Studio), Gemini Nano Banana (hero gen)
- Twilio SMS, Resend Email — user-provided keys
- Google Places API — Place ID set (`ChIJp-3zQfm5IIYR8i56wOrX3ng`), API key pending

## Architecture
- Frontend: React + Tailwind + Framer Motion + react-helmet-async
- Backend: FastAPI + MongoDB (`projects`, `leads`, `bookings`, `lead_followups`, `lead_unsubscribes`, `google_reviews_cache`, `chat_messages`)
- Background worker: `followup_service.background_worker` started in FastAPI lifespan, polls due followups every 5 min
- SSG: GitHub Action `prerender.yml` → `public/_prerendered/*.json` injected at build via `inject-prerendered.js`

## Key API Endpoints (Feb 2026)
- `POST /api/bookings` — create chat booking (also writes lead, texts Ryan, emails customer)
- `GET /api/google-reviews` — cached Place Details (12h TTL); graceful empty payload when API key not set
- `GET /api/followups/unsubscribe/{token}` — one-click unsubscribe from email sequence

## Recently Fixed
- ExitIntentModal Radix overlay pointer-event trap that blocked chat widget clicks. Replaced with plain framer-motion modal at z-[80] (under chat at z-[9990]).
