# Seamless Bath - AI Renovation Visualizer

## Product Overview
AI-powered web app that lets homeowners upload room photos, get AI-generated renovation designs using **seamless continuous surfaces only** (no tiles, no grout), cost estimates, and connect with local contractors.

## Brand Philosophy
Seamless Bath specializes in continuous surface finishes. ALL AI-generated designs use ONLY:
- **Micro Quartz** — waterproof, for showers/pool/wet zones
- **Microcement** — smooth continuous walls and floors
- **Microterrazzo** — decorative aggregate surfaces for walking areas
- **Venetian Plaster (Stucco Veneziano)** — luminous polished wall finishes
- **Marmorino** — marble-dust lime plaster, translucent stone-like depth
- **Stucco Lustro** — mirror-like high-gloss burnished lime plaster
- **Grassello di Calce** — ultra-smooth luminous lime putty
- **Tadelakt** — Moroccan waterproof soap-burnished lime plaster
- **Roman Clay** — matte, earthy, organic handcrafted texture
- **Lime Wash** — soft mottled organic finish
- **Beton Cire** — polished cement/concrete effect finish
- **Cocciopesto** — ancient Roman terracotta-lime waterproof surface
- **Seamless Epoxy** — garage and industrial flooring
- **Solid Surface (Corian-type)** — non-porous seamless countertops
- **Rockscape** — sculpted foam blocks with microaggregate finish creating realistic stone face walls
- **NEVER tiles, grout, pavers, brick, ceramic, porcelain, or mosaic**

## Core User Flow
1. **Upload Page** - Upload 1-3 room photos (select primary for AI edit), pick room type (14 options), set budget, enter ZIP
2. **Analysis Page** - AI-detected conditions, recommended improvements, cost ranges  
3. **Results Page** - 3 AI-generated seamless surface designs with before/after sliders, Material Explorer, PDF export, suggested contractor highlight, contractor map

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI, Leaflet maps
- **Backend:** FastAPI, Motor (MongoDB async), background threads for AI tasks
- **AI:** OpenAI GPT Image 1 (image editing), GPT-4o (vision analysis) via Emergent LLM Key
- **Database:** MongoDB

## Implemented Features
- [x] 3-step UI flow: Upload -> Analysis -> Results
- [x] Multi-image upload (1-3 photos, primary selection)
- [x] 14 room type visual cards
- [x] **ALL 42 style prompts use seamless surfaces only — 15 finish types distributed**
- [x] SEAMLESS_RULE enforced in every AI prompt
- [x] Full finish variety: tadelakt, roman clay, marmorino, stucco lustro, grassello, beton cire, cocciopesto, venetian plaster, lime wash, microcement, micro quartz, microterrazzo, epoxy, solid surface, rockscape
- [x] Budget-aware AI design generation (4 tiers)
- [x] Strict room layout preservation in AI prompts
- [x] Before/After sliders, Material Explorer, PDF export
- [x] Project Analysis page with seamless-surface-specific recommendations
- [x] Contractor routing, suggested contractor highlight, easter egg (ZIP 70123)
- [x] Portfolio page (/portfolio) + admin upload
- [x] Admin dashboard, contractor login, lead capture, share/vote

## Backlog
- [ ] P1: Refactor server.py into modular files
- [ ] P2: Contractor portfolio photo upload
- [ ] P2: Email notifications for new leads
- [ ] P2: Real ZIP geocoding API
