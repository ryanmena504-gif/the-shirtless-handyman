# The Shirtless Handyman — PRD

## Original Problem
A web app where a homeowner uploads room photos and instantly sees their space rendered in **seamless surfaces** (microcement, tadelakt, marmorino, rockscape — NEVER tiles or grout). The app routes the lead to local specialty contractors and powers The Shirtless Handyman's New Orleans operation.

## Product Pillars
1. **3-Step AI Visualizer ("The Seamless Studio")**
   - Upload page: 1–3 room photos, 15 room types (incl. "Feature Wall / Rockscape"), budget, ZIP.
   - Analysis page: detected conditions, seamless recommendations, cost ranges.
   - Results page: 3 budget-aware AI designs (microcement / rockscape / tadelakt — zero grout/tiles), interactive Material Explorer, PDF export, contractor lead map.
2. **Contractor / Lead Routing** — specialty routing, lead capture.
3. **Admin & Portfolio** — leads, contractors, before/after portfolio CRUD.

## Architecture
- **Frontend:** React + Tailwind + shadcn/ui, Context API auth, axios with `withCredentials`.
- **Backend:** FastAPI + Motor (MongoDB), background `ThreadPoolExecutor` for AI; `litellm.image_edit` (`openai/gpt-image-1`) + `litellm.completion` (gpt-4o vision) via Emergent LLM Key proxy.
- **Auth:** httpOnly cookie sessions (Admin + Contractors). NO localStorage tokens.

## Key Data Models
- `projects`: `{id, project_type, zip_code, budget, original_image, additional_images, status, designs[], analysis, cost_estimate, error, error_detail, created_at}`
- `contractors`, `leads`, `portfolio`, `shares`

## Key Endpoints
- `POST /api/projects/upload`
- `POST /api/projects/{id}/generate`
- `GET  /api/projects/{id}` (polling)
- `GET  /api/contractors/search?zip_code=&project_type=`
- `POST /api/contractors/login`, `POST /api/admin/login`, `POST /api/auth/logout`
- `GET  /api/health/ai` — diagnostic: verifies EMERGENT_LLM_KEY + image_edit pipeline.

## What's Implemented (chronological)
- Core 3-step visualizer + AI prompts + cost estimator.
- Multi-image upload, primary-photo selector, specific contractor highlighting.
- Portfolio CRUD + Admin tab.
- 42 AI prompts overhauled — strict "Seamless Surfaces only" (microcement, rockscape, tadelakt, etc.); tiles/grout forbidden.
- Backend modularized: `prompts.py`, `models/schemas.py`, `auth.py`, `cost_estimator.py`.
- httpOnly cookie auth migration (replaced localStorage).
- Full rebrand to "The Shirtless Handyman" / "The Seamless Studio".
- SEO package: `sitemap.xml`, `robots.txt`, JSON-LD, Klaviyo, phone/email metadata.
- "Feature Wall / Rockscape" top-level room.

### 2026-05-23 — Image Generation Error Diagnostics
- `_do_generation` now classifies failures (auth, rate limit, timeout, budget, content policy, network) and stores a friendly `error` + technical `error_detail` on the project doc.
- Frontend ResultsPage shows the real backend error message and exposes a collapsible "Show technical details" panel so live failures are diagnosable.
- Retrying via `/generate` clears stale `error`/`error_detail`.
- New `GET /api/health/ai` diagnostic endpoint pings `litellm.image_edit` end-to-end so we can verify the deployed env without uploading a photo.
- Verified preview env: full flow generates 3 designs in ~40s; `/api/health/ai → ok:true`.

## Backlog
- **P0** Confirm fix on deployed site shandyman.com: user must redeploy and re-run the generator (or hit `/api/health/ai` directly). The actual deployed error will now appear in the UI.
- **P2** Email notifications for new leads.
- **P2** Real ZIP geocoding API (replace static `ZIP_COORDINATES`).
- **Optimization** N+1 query in admin leads endpoint (lines 673–676 in server.py) — batch contractor lookups.

## Project Health
- Preview: ✅ All flows working.
- Production (shandyman.com): ⚠️ Pending redeploy with the new diagnostics. The real error will be visible on retry.

## Mocked
- ZIP geocoding uses an internal coordinate map (`ZIP_COORDINATES`).
