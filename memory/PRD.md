# The Shirtless Handyman — PRD

## Original Problem
A web app where a homeowner uploads room photos and instantly sees their space rendered in **seamless surfaces** (microcement, tadelakt, marmorino, rockscape — NEVER tiles or grout). The app routes the lead to local specialty contractors and powers The Shirtless Handyman's New Orleans operation.

## Product Pillars
1. **3-Step AI Visualizer ("The Seamless Studio")** — Upload, Analysis, Results pages.
2. **Lead-Gen Engine** — instant quote form, exit-intent capture, sticky mobile CTA, social-proof toast, Results-page "Build This" CTA, real-time email + SMS notifications to Ryan.
3. **Contractor / Lead Routing** — specialty routing, lead capture, source tracking.
4. **Admin & Portfolio** — leads, contractors, before/after portfolio CRUD.

## Architecture
- **Frontend:** React + Tailwind + shadcn/ui, Context API auth, axios with `withCredentials`. Conversion tracking via `lib/tracking.js` (GA4 + Meta Pixel + Klaviyo).
- **Backend:** FastAPI + Motor (MongoDB). `litellm.image_edit` + vision via Emergent LLM Key. Resend (email) + Twilio (SMS) for lead notifications, both with graceful fallback.
- **Auth:** httpOnly cookie sessions.

## Key Data Models
- `projects`, `contractors`, `portfolio`, `shares`
- `leads`: `{id, name, phone, email, zip_code, project_type, project_description, selected_design_style, room_photo, project_id, contractor_id, source, status, created_at}`
  - **NEW** `source` field tags origin: `quote_form`, `hero_form`, `exit_intent_modal`, etc.

## Key Endpoints
- `POST /api/projects/upload`, `POST /api/projects/{id}/generate`, `GET /api/projects/{id}`
- `GET /api/contractors/search`, `POST /api/contractors/login`, `POST /api/admin/login`, `POST /api/auth/logout`
- `POST /api/leads` (full form, fires notifications)
- **NEW** `POST /api/leads/quick` (name+phone only — for hero/exit-intent/sticky CTA)
- `GET /api/health/ai` (diagnostic)
- `POST /api/seed` (now correctly wired — was a latent bug)

## Notification Pipeline (NEW — 2026-05-24)
On every `/api/leads` or `/api/leads/quick` POST, backend fires `asyncio.create_task(notify_new_lead(lead))`:
1. **Email** via Resend → `LEAD_NOTIFICATION_EMAIL` (ryanmena@theshirtlesshandyman.com). HTML template with click-to-call, click-to-text, lead context.
2. **SMS** via Twilio → `LEAD_NOTIFICATION_PHONE` (+15042644919). 160-char alert.
3. Both gracefully skip with a warning log if credentials are missing — lead is still saved.

Env vars (currently empty pending user setup):
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (defaults to `onboarding@resend.dev`)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

## What's Implemented (chronological)
- (Sessions 1–3) Core 3-step visualizer, multi-image upload, contractor routing, portfolio, httpOnly cookie auth, full rebrand to "The Shirtless Handyman", SEO package, 42 seamless-only AI prompts.
- (2026-05-23) Image generation error diagnostics: `_friendly_generation_error`, `/api/health/ai`, frontend "Show technical details" toggle.
- (2026-05-23) Code-quality cleanup: ruff + react-hooks lint clean, refactored `_friendly_generation_error` to data-driven, added logout-failure logging.

### 2026-05-24 — Lead-Gen Engine
- `notifications.py` — Resend email + Twilio SMS with non-blocking `asyncio.to_thread` and graceful no-op on missing credentials.
- `POST /api/leads/quick` — lightweight name+phone capture endpoint with 400 validation.
- `POST /api/leads` — now sets `source='quote_form'` and triggers notifications.
- Hero `InstantQuoteForm` — single-row name+phone+CTA component beneath the main hero CTAs.
- `TrustStrip` — 5 trust signals (Licensed & Insured · 4.9★ · Born in NOLA · Avg response under 1 hr · 200+ NOLA Homes) immediately below the hero.
- `StickyMobileCTA` — bottom-fixed Call · Text · See My Room bar (mobile only).
- `ExitIntentModal` — 12s-idle + mouse-leave-top trigger, sessionStorage-gated, embeds `InstantQuoteForm`.
- `SocialProofToast` — rotating "{Name} in {NOLA area} just {action}" bottom-left desktop toast (6s appear, 14s rotate, dismissible).
- `LeadGenWidgets` — global mount gate, excluded from admin/contractor routes.
- Results page "Build This — Free Quote" prominent CTA card above the design grid.
- GA4 + Meta Pixel placeholders in `index.html` (env-driven; replace `REPLACE_WITH_GA4_ID` / `REPLACE_WITH_META_PIXEL_ID` or set `window.__GA4_ID` / `window.__META_PIXEL_ID`).
- `trackEvent()` helper wired into `LeadCaptureModal`, `InstantQuoteForm` — fires `lead_submitted` / `quick_lead_submitted` events to GA4, Meta Pixel (mapped to standard `Lead` event), and Klaviyo.
- Fixed pre-existing latent bug: `@api_router.post("/seed")` was decorating the wrong function — moved to a dedicated `seed_endpoint`.

## Verification Status
- Iteration 6 (2026-05-24): All 7 backend tests passed; every frontend lead-gen widget verified on desktop + mobile. Zero critical / integration / UI bugs. Minor cosmetic findings resolved.
- `/api/health/ai` returns `ok:true`.
- `/api/leads/quick` validation passes (400 on empty, 200 on valid).

## Pending — User Action Required (Production)
1. **Paste Resend API key** into `RESEND_API_KEY` on production. Get one free at https://resend.com → Dashboard → API Keys. Email will then go live.
2. **Paste Twilio credentials** into `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. Sign up at https://twilio.com, get a $1/mo phone number, copy the SID + token. SMS will then go live.
3. **(Optional)** Paste GA4 measurement ID (G-XXXXXXXXXX) and Meta Pixel ID into the placeholders in `frontend/public/index.html` for analytics + retargeting.
4. **Redeploy** to push the lead-gen layer to theshirtlesshandyman.com.

## Backlog
- **P2** Real ZIP geocoding API (currently mocked).
- **Optimization** Batch the N+1 contractor query in admin leads endpoint.
- **Backlog** Code-review refactor suggestions deferred (HomePage/ResultsPage component splits, MaterialsListPDF helper extraction).
