# The Shirtless Handyman — PRD

## Problem Statement
High-converting lead-gen + SEO site for Ryan Mena's NOLA seamless-surfaces business (microcement, tadelakt, rockscape, pool deck resurfacing).

## Core Features (Implemented)
- AI Visualizer ("The Seamless Studio") — upload room → AI generates 3 budget-aware seamless-surface designs
- Lead capture (Twilio SMS + Resend email) with quick-quote form, exit-intent modal, sticky mobile CTA
- Interactive Pricing Calculator with auto-firing estimate confirmation emails
- AI Chatbot (Claude Sonnet 4.5 via Emergent LLM key) — sales-rep persona
- Static Site Generation (SSG) via GitHub Action — DOM fragments injected into React shell for SEO
- 12 local-SEO landing pages + 4 blog posts + JSON-LD schema (Service, Breadcrumb, FAQ, AggregateRating)

## Local-SEO Landing Pages
- /microcement-new-orleans — service-intent
- /microcement-installers-new-orleans — hiring-intent (NEW, Feb 2026)
- /microcement-metairie, /tadelakt-new-orleans, /rockscape-walls-new-orleans, /pool-deck-resurfacing-new-orleans
- Neighborhood: /lakeview-handyman, /uptown-handyman, /mid-city-handyman, /bywater-handyman, /french-quarter-handyman, /garden-district-handyman

## Backlog (P1/P2)
- P1: Booking flow in chat widget (collect day/time → auto-text Ryan a confirmed appointment)
- P1: Live Google Reviews widget on every page (needs GBP Place ID from user)
- P2: Email follow-up sequence (3 emails over 5 days) for Studio users to recover cold leads

## Integrations
- Emergent LLM Key: Claude Sonnet 4.5 (chat), GPT Image 1 + Vision (Studio), Gemini Nano Banana (hero gen)
- Twilio SMS, Resend Email — user-provided keys

## Architecture
- Frontend: React + Tailwind + Framer Motion + react-helmet-async
- Backend: FastAPI + MongoDB (`projects`, `leads` collections)
- SSG: GitHub Action `prerender.yml` → `public/_prerendered/*.json` injected at build via `inject-prerendered.js`
