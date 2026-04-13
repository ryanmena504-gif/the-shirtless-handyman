# Seamless Bath - AI Renovation Visualizer

## Product Overview
AI-powered web app that lets homeowners upload room photos, get AI-generated renovation designs using **seamless continuous surfaces only** (no tiles, no grout), cost estimates, and connect with local contractors.

## Brand Philosophy
Seamless Bath specializes in continuous surface finishes. ALL AI-generated designs use ONLY:
- **Micro Quartz** — waterproof, for showers/pool/wet zones
- **Microcement** — smooth continuous walls and floors
- **Microterrazzo** — decorative aggregate surfaces for walking areas
- **Venetian Plaster** — luminous polished wall finishes
- **Lime Wash** — soft organic textured walls
- **Rockscape Accent Walls** — sculpted foam blocks with microaggregate finish creating realistic stone face walls
- **Seamless Epoxy** — garage and industrial flooring
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
- [x] **ALL 42 style prompts (14 rooms x 3 styles) use seamless surfaces only**
- [x] SEAMLESS_RULE enforced in every AI prompt (no tiles/grout/pavers)
- [x] Rockscape accent walls featured across room types
- [x] Micro quartz for wet zones, microterrazzo for walking areas
- [x] Budget-aware AI design generation (4 tiers)
- [x] Strict room layout preservation in AI prompts
- [x] Before/After sliders for each design
- [x] Interactive Material Explorer
- [x] PDF Materials List export
- [x] Project Analysis page with seamless-surface-specific recommendations
- [x] Specialty-based contractor lead routing
- [x] Suggested Contractor highlight card on Results page
- [x] Easter egg: ZIP 70123 -> "The Shirtless Handyman" (Ryan Mena)
- [x] Portfolio page (/portfolio) for real before/after job photos
- [x] Admin portfolio upload (before/after pairs)
- [x] Admin dashboard with leads, contractors, portfolio tabs
- [x] Contractor registration/login/dashboard
- [x] Lead capture modal
- [x] Share designs with voting
- [x] "Seamless Bath" branding + "Our Work" nav link

## Key Data Models
- `projects`: id, zip_code, project_type, budget, original_image, additional_images[], status, designs[], cost_estimate, analysis
- `contractors`: id, company_name, specialties[], service_zip_codes[], rating
- `leads`: id, name, phone, email, zip_code, contractor_id, project_id, status
- `portfolio`: id, title, description, room_type, before_image, after_image
- `shares`: id, project_id, designs[], original_image

## Backlog
- [ ] P1: Refactor server.py into modular files
- [ ] P2: Contractor portfolio photo upload
- [ ] P2: Email notifications for new leads
- [ ] P2: Real ZIP geocoding API
- [ ] P2: Deeper handyman branding integration
