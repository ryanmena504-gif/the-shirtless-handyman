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
- Promo banner (top of every homeowner page) — "FREE radiant heat with any flooring package"
- Static Site Generation via GitHub Action
- 13 local-SEO landing pages + 5 blog posts + full JSON-LD schema

## Recent Additions (Feb 2026)
- `/microcement-installers-new-orleans` — hiring-intent landing page
- `/blog/how-to-choose-microcement-installer-new-orleans` — companion blog post
- `/book` — self-serve calendar page
- PromoBanner replacing the broken ExitIntentModal
- Chat booking flow, follow-up email sequence, Google Reviews infra

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
