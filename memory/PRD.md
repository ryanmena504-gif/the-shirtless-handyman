# Bloodhound — PRD

## Original Problem Statement
Build a premium full-stack web application called BLOODHOUND — AI Opportunity Intelligence for contractors. Command Center that helps discover, understand, and prioritize business opportunities before competitors. Dark, high-end, Palantir/Linear aesthetic with amber/gold accents. Reads live from Airtable (two tables: `Opportunities` and `Leads`) and allows approved-field writes back.

## Architecture
- **Backend**: FastAPI at `/api`. Two independent service layers over live Airtable:
  - `services/airtable_service.py` — Opportunities table sync engine (45s TTL cache).
  - `services/leads_service.py` — Leads table for the Next Best Action panel (45s TTL cache, per-process skip/hold/approve sets).
- **Frontend**: React + Tailwind + shadcn/ui. Dark charcoal (#0B0C10) with amber (#D97706) accents. Cabinet Grotesk / IBM Plex Sans / JetBrains Mono typography.
- **Env**: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_ENABLED=true`, `AIRTABLE_OPPORTUNITIES_TABLE`, `AIRTABLE_LEADS_TABLE=Leads` — all in `/app/backend/.env`. Never shipped to browser.

## User Persona
Ryan (contractor operator) — needs to know within 30 seconds "what deserves my attention today" and "is this opportunity worth pursuing, and what should I do next".

## Implemented
### 2026-02 initial build
- Command Center: 5 headline metrics (clickable → opportunities filter), Today's Missions with mission-bucket filters, Top Opportunities ranked list, Recent Discoveries feed, Status Pipeline (9 stages).
- Opportunities page: search, filters (source, status, band, mission, project type, min score), list + card views.
- Opportunity detail: hero + primary action panel, Intelligence section, Contact, Property/Project, Relationships preview, Activity timeline.
- Today's Missions, Relationships, Intelligence, Settings pages.
- Mobile bottom nav.

### 2026-02 live Airtable + polish
- Live Airtable via `pyairtable` for Opportunities (write-allowlist enforced).
- ⌘K Command Palette for quick filtering + status updates.
- Editable Decision Panel (Status, Ryan's decision, Outcome, Next follow-up).
- Live Refresh Indicator with auto-retry + exponential backoff.
- Priority Band + Mission normalizers matching Ryan's SWITCH formula.

### 2026-02 Next Best Action (NEW)
- Hero panel on Command Center reads from the separate `Leads` table.
- Data-quality gate: leads without both `Leads Name` and `Next action` are excluded (drops skeleton rows).
- Ranking: completeness → AI enrichment → contact presence → priority → lead score → age.
- Actions: Approve & Send (writes Approval/Outreach status), Hold, Skip (session-only), Do Not Contact (with confirm), edit draft First message.
- Endpoint 404s on missing lead ids; explicit confirm required for DNC.
- All flows verified by testing agent (iteration_3.json — 11/11 backend + full frontend NBA passes).

## P1 Backlog
- **Slack alerts** for Band A opportunities (needs `integration_playbook_expert_v2` + Slack workspace + bot token).
- **Airtable webhooks** so new opportunities appear instantly instead of the 45s poll (needs `integration_playbook_expert_v2`).
- Real outbound messaging behind Approve & Send (SMS/email dispatch).
- Relationship graph MVP (nodes: past clients, subs, mutuals).
- Intelligence page: real permit-velocity chart + neighborhood heatmap.
- Notifications feed.

## P2 Backlog
- Auth (JWT or Emergent Google Auth).
- Multi-operator team workspaces.
- Dedicated Interactions/Activities table for the activity timeline.
- Refactor: dedupe airtable_service + leads_service connection code once a 3rd table is added.
- CSV export + weekly digest email.

## Known Advisories (from iteration_3 review — cosmetic, not blocking)
- `leads_service` per-process skip/hold sets diverge under multi-worker uvicorn (single-worker today).
- `do_not_contact` silently falls back to session-only if Airtable single-select lacks the option; underlying error not surfaced.
- `/api/config` still reports `backend='sample'` for opportunities even when leads are live — add an explicit `leads_backend` key.
