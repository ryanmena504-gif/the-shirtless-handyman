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
- Iteration 6 (2026-05-24): Initial lead-gen layer — 7/7 backend tests passed.
- **Iteration 7 (2026-05-24): P1 + P2 wave — 9/9 backend tests passed, frontend LeadsInbox + regression on all lead-gen widgets verified. Two design issues found and immediately resolved:**
  - Klaviyo signup overlay was leaking onto operator routes → fixed via `body[data-scope=operator]` CSS gate.
  - ExitIntentModal could stack on top of an open Klaviyo form → ExitIntentModal now checks for an active Klaviyo dialog before opening.
- `/api/health/ai` returns `ok:true`.
- `/api/leads/quick` validation passes (400 on empty, 200 on valid).
- `/api/contractors/search?zip_code=89109` resolved Las Vegas via zippopotam.us (real API) and cached in `zip_cache` Mongo collection.

### 2026-05-24 (P1 + P2 wave)
- **P1.1** `send_homeowner_autoreply` — friendly SMS auto-reply to the homeowner the second they submit ("Hey {first_name}, Ryan got your quote request, I'll text you personally within the hour. Reply STOP to opt out."). Wired into `notify_new_lead` alongside email + SMS-to-Ryan. Graceful skip when Twilio creds are missing.
- **P1.2** Mobile-first contractor `LeadsInbox` component — sticky search bar, 4 status filter pills (All/New/Contacted/Closed) with live counts, lead cards with one-tap Call/Text/Email actions and inline status-update buttons. Backed by new `PATCH /api/leads/{lead_id}/status` endpoint (admin can update any, contractor only their service-ZIP/assigned leads).
- **P1.3** Klaviyo nurture wiring — `identifyLead()` helper in `lib/tracking.js` pushes `$email`, `$phone_number`, `$first_name`, `$last_name`, `$zip`, `project_type`, `source` to Klaviyo onsite SDK on every lead submission. Klaviyo signup overlay is gated to homeowner routes only.
- **P2.1** Real ZIP geocoding — `get_zip_coords_async` falls through static map → MongoDB `zip_cache` → zippopotam.us free API (no key) → static fallback. Caches lat/lng/city/state/cached_at.
- **P2.2** Admin leads N+1 fix — batch-fetch contractor names in a single `$in` query.
- **P2.3** `MaterialsListPDF.generatePDF()` complexity-36 split into 6 focused render helpers (`renderPdfHeader`, `renderProjectDetails`, `renderMaterialsTable`, `computeZoneCost`, `renderContractorSection`, `renderQuoteSection`, `renderFooter`). Behavior unchanged, code now testable section-by-section.

### 2026-05-25 — iPhone HEIC fix
- `backend/image_utils.py` — pillow-heif normalization. Decodes HEIC/HEIF/PNG/WebP/JPEG → EXIF rotated → resized to 1536px max → JPEG q85. Wired into `/api/projects/upload` and `/api/admin/portfolio`.
- Fixes the `litellm.BadRequestError: invalid_image_file` that killed every iPhone-originated generation.
- Regression tests at `backend/tests/test_image_normalization.py` (4/4 pass).

### 2026-05-26 — SEO Wave
- **Social-share previews**: `og:image` + `twitter:image` (1200×630), width/height/secure_url/alt. Rich preview now generates on iMessage/Facebook/Slack.
- **AggregateRating + 3 inline Reviews schema** — backs the "4.9★" claim with the on-page testimonials. Unlocks ⭐ star ratings in Google search results.
- **FAQPage schema (7 Q&A)** — homepage. Eligible for FAQ rich-snippet expansion.
- **HowTo schema** — 4-step process is now indexable.
- **Individual Service schemas** — microcement / tadelakt / venetian plaster / rockscape / pool-deck each their own entity with priceRange + areaServed.
- **Image alt text** upgraded on homepage hero, rockscape image, 4 gallery thumbnails — location + brand for image-search SEO.
- **NEW `/microcement-new-orleans`** local landing page — own Helmet meta, BreadcrumbList, route-specific Service entity, local FAQ (4 NOLA-targeted Q&A), 14 service-area neighborhood tags. sitemap.xml priority 0.9.
- **`SeoHead` component + `react-helmet-async`** — per-route title/description/canonical/og/JSON-LD with post-mount dedupe so each route sends exactly **one** canonical/description/og:title to crawlers.

### 2026-05-26 — SEO Wave 2: Local pages × 4 + Blog
- **Reusable `LocalServicePage` template** (`/app/frontend/src/components/LocalServicePage.js`) — single configurable component that powers all NOLA local-SEO landing pages. Renders hero + benefits + service-areas + Studio + where-it-shines + visible FAQ + final CTA, with per-page Service + BreadcrumbList + FAQ schema. Refactored existing `/microcement-new-orleans` to use it.
- **`localServiceConfigs.js`** — config-driven copy/data for **5 NOLA landing pages**: `/microcement-new-orleans`, `/microcement-metairie`, `/tadelakt-new-orleans`, `/rockscape-walls-new-orleans`, `/pool-deck-resurfacing-new-orleans`. Each one has unique NOLA-native copy, its own price range, its own benefits, its own FAQ — all separately rankable for long-tail queries.
- **`LocalServiceRoute.js`** — single React component routed at each explicit URL; reads pathname → looks up config → renders LocalServicePage. Falls back to HomePage if slug unknown.
- **Blog infrastructure**: `/blog` index + `/blog/:slug` posts with Blog + BlogPosting + BreadcrumbList schema, InstantQuoteForm at end of every post, related-posts strip. 4 NOLA-targeted posts (microcement vs tile cost, how to choose a contractor, tadelakt vs microcement, why tile fails in NOLA humidity).
- **Navbar** — added "Journal" link in desktop + mobile menus.
- **sitemap.xml** — all 5 local pages + blog index + 4 blog post URLs.
- **LeadGenWidgets** — extended to include `/blog`, all 5 local pages, and `/blog/*` so instant-quote/sticky-CTA/exit-intent appear on every homeowner page.
- Verified live on preview: all 5 local pages + blog index + sample blog post each render with unique title/H1/canonical and 7 JSON-LD blocks.

### 2026-05-31 — Positioning Reset
Ryan's feedback: the site read like an AI room-visualizer SaaS, not like a craftsman who installs surfaces. Fixed:
- **New homepage hero** — eyebrow `MICROCEMENT & SEAMLESS SURFACE SPECIALIST · NEW ORLEANS, LA`. H1 `Seamless renovations, built by hand in New Orleans.` Personal paragraph: "I'm Ryan Mena. I install microcement, tadelakt, and custom rockscape walls in NOLA homes…"
- **CTA priority flipped**: primary = "Get a Free Quote" (lead capture); secondary = "See Your Space — Try The Studio" (demo). The Studio is now a feature, not the brand.
- **New "What I Install" section** on homepage — 4 service tiles (Microcement/Tadelakt/Rockscape/Pool Decks) with price ranges, each linking to its dedicated local landing page.
- **New "Meet Ryan" section** on homepage — portrait + "I used to install tile. I stopped." story + CTAs to /about and SMS.
- **New `/about` page** — full Person-schema'd personal story, 4 values (one craftsman / treats your house like his / NOLA-born / real materials), dedicated lead capture.
- **Navbar** — "About Ryan" link added (desktop + mobile).
- **HomePage** — added SeoHead so homepage now sends route-specific title/description/canonical instead of relying on static index.html (eliminates last duplicate-canonical risk).
- sitemap.xml + LeadGenWidgets updated.

### 2026-06-08 — SEO Audit Wave 3 (Crawler-readability)
- **`robots.txt` expanded** — explicit allow rules for Googlebot, Googlebot-Image, Bingbot, Slurp (Yahoo), DuckDuckBot, YandexBot, Baiduspider, Applebot. Explicit allow for social crawlers (Twitterbot, facebookexternalhit, LinkedInBot, Slackbot, WhatsApp). Disallow for known content-scraping bots (SemrushBot, AhrefsBot, MJ12bot, DotBot) to reduce bandwidth waste.
- **`BlogIndexPage` ItemList JSON-LD** — adds Schema.org ItemList alongside the existing Blog schema so Google understands post ordering and surfaces them as a list in SERP.
- **`SeoHead` rel="prev"/"next"`** — `SeoHead` now accepts `prev` and `next` props, BlogIndexPage emits them computed from `POSTS_PER_PAGE=12`. Future-proof for paginated archive growth.
- **Static SEO pre-rendering** — new `frontend/scripts/seo-routes.js` + `frontend/scripts/prerender-seo.js`. After `craco build`, a post-build step writes a route-specific `build/<route>/index.html` for every URL in the site. Search engines and JS-less social crawlers (Facebook, Twitter, LinkedIn, Slack, iMessage, WhatsApp) see correct meta per URL.
- Build script: `yarn build` → `craco build && node scripts/prerender-seo.js`.

### 2026-06-08 — Enhancement Wave (post-SEO)
- **Studio share cards** — new `components/ShareCard.js`. Renders a 1080×1350 Instagram-portrait card (after image + small before thumb + brand + CTA) directly in the DOM at 32% display scale; exports the full-resolution PNG using `html-to-image`. Uses Web Share API + Files on mobile (drops straight into Instagram/Messages), falls back to a download on desktop. Mounted in `pages/ResultsPage.js` in a new dark "Show it off" section that hosts both the new generator and the existing public share link.
- **Studio email-gate** — new `components/EmailCaptureModal.js`. Fires 18 s after the AI designs render (timer-gated, sessionStorage-guarded). Asks for first name + email only, posts to `/api/leads/quick` with `source='studio_email_gate'`. Skipped if the user has already submitted any lead during this session (flag set by InstantQuoteForm + LeadCaptureModal).
- **Backend `/api/leads/quick` permissive validation** — `QuickLead.phone` is now optional; endpoint accepts `name + (phone OR email)`. Catches Studio email-gate leads cleanly. Manual validation returns 400 when both are empty.
- **6 neighborhood handyman micro-pages** — `/lakeview-handyman`, `/uptown-handyman`, `/mid-city-handyman`, `/bywater-handyman`, `/french-quarter-handyman`, `/garden-district-handyman`. Each is a fully unique config in `lib/localServiceConfigs.js` with neighborhood-native copy (Lakeview = post-Katrina rebuilds; Uptown = historic plaster; Mid-City = raised cottages; Bywater = STR-friendly turnaround; French Quarter = VCC + courtyard access; Garden District = high-end finish + designer specs). Each renders 7 JSON-LD blocks. Wired into `App.js` routes, `LeadGenWidgets` route list, `sitemap.xml`, and `scripts/seo-routes.js`.
- All three enhancements verified end-to-end by `testing_agent_v3_fork` iteration_8: 7/7 backend pytest pass, 10/10 frontend acceptance criteria pass.

## Verification Status
1. **Paste Resend API key** into `RESEND_API_KEY` on production. Get one free at https://resend.com → Dashboard → API Keys. Email will then go live.
2. **Paste Twilio credentials** into `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. Sign up at https://twilio.com, get a $1/mo phone number, copy the SID + token. SMS will then go live.
3. **(Optional)** Paste GA4 measurement ID (G-XXXXXXXXXX) and Meta Pixel ID into the placeholders in `frontend/public/index.html` for analytics + retargeting.
4. **Redeploy** to push the lead-gen layer to theshirtlesshandyman.com.

## Backlog
- **P2** Real ZIP geocoding API (currently mocked).
- **Optimization** Batch the N+1 contractor query in admin leads endpoint.
- **Backlog** Code-review refactor suggestions deferred (HomePage/ResultsPage component splits, MaterialsListPDF helper extraction).
