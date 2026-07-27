# Bloodhound — PRD

## Original Problem Statement
Build a premium full-stack web application called BLOODHOUND — AI Opportunity Intelligence for contractors. First version is the user-facing Command Center for a working backend (Airtable + Make.com + OpenAI + New Orleans permits). Read from Airtable, allow approved-field writes, and defer real Airtable connection behind a service layer while shipping with rich sample data.

## Architecture
- **Backend**: FastAPI at /api. Service layer (`services/opportunity_service.py`) with in-memory sample data today and an `AirtableOpportunityService` stub that activates when `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_OPPORTUNITIES_TABLE`, and `AIRTABLE_ENABLED=true` are set. No Airtable credentials are ever shipped to the browser.
- **Frontend**: React + Tailwind + shadcn/ui. Left sidebar (desktop) + bottom nav (mobile). Cabinet Grotesk / IBM Plex Sans / JetBrains Mono typography. Dark charcoal (#0B0C10) with amber (#D97706) accents.
- **Data model**: Full Airtable field mirror — priority score/band, daily mission, next best action, evidence, missing info, risk flags, activity timeline, etc.

## User Persona
Ryan (contractor operator) — needs to know within 30 seconds "what deserves my attention today" and "is this opportunity worth pursuing, and what should I do next".

## Implemented (2026-02 initial build)
- Command Center: 5 headline metrics (clickable → opportunities filter), Today's Missions with mission-bucket filters, Top Opportunities ranked list, Recent Discoveries feed, Status Pipeline (9 stages with counts + values).
- Opportunities page: search, filters (source, status, band, mission, project type, min score), list + card views.
- Opportunity detail: hero + primary action panel (Mark Contacted / Needs Research / Estimate Requested / Won / Lost), Intelligence section (recommendation reason, evidence summary, missing info, risk flags, 5 confidence meters), Contact, Property/Project, Relationships preview, Activity timeline.
- Today's Missions page: dispatch layout grouped by mission, Done/Snooze, sorted by priority.
- Relationships & Intelligence: designed placeholder pages.
- Settings: data source status + Airtable activation instructions + operator preferences.
- Mobile: bottom nav, responsive layouts.
- 15 rich sample opportunities across all bands/statuses/missions/sources.

## P1 Backlog
- Wire live Airtable via `pyairtable` in `AirtableOpportunityService` (env vars ready).
- Relationship graph MVP (nodes: past clients, subs, mutuals).
- Intelligence page: real permit-velocity chart + neighborhood heatmap.
- Command palette (⌘K) global search.
- Notifications feed.

## P2 Backlog
- Auth (JWT or Emergent Google Auth).
- Multi-operator team workspaces.
- Automated outreach (call/text/email dispatch).
- CSV export + weekly digest email.
