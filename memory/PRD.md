# Seamless Bath - AI Renovation Visualizer

## Product Overview
AI-powered web app that lets homeowners upload room photos, get AI-generated renovation designs, cost estimates, and connect with local contractors.

## Core User Flow
1. **Upload Page** - Upload 1-3 room photos (select primary for AI edit), pick room type (14 options), set budget, enter ZIP
2. **Analysis Page** - AI-detected conditions, recommended improvements, cost ranges  
3. **Results Page** - 3 AI-generated designs with before/after sliders, Material Explorer, PDF export, suggested contractor highlight, contractor map

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI, Leaflet maps
- **Backend:** FastAPI, Motor (MongoDB async), background threads for AI tasks
- **AI:** OpenAI GPT Image 1 (image editing), GPT-4o (vision analysis) via Emergent LLM Key
- **Database:** MongoDB

## Implemented Features (as of 2026-04-13)
- [x] 3-step UI flow: Upload → Analysis → Results
- [x] Multi-image upload (1-3 photos, primary selection)
- [x] 14 room type visual cards with tailored AI prompts
- [x] Budget-aware AI design generation (4 tiers)
- [x] Strict room layout preservation in AI prompts
- [x] 3 distinct AI renovation styles per room type
- [x] Before/After sliders for each design
- [x] Interactive Material Explorer (clickable zones)
- [x] PDF Materials List export
- [x] Project Analysis intermediate page with conditions/improvements/costs
- [x] Specialty-based contractor lead routing
- [x] Suggested Contractor highlight card on Results page
- [x] Easter egg: ZIP 70123 → "The Shirtless Handyman" (Ryan Mena)
- [x] Portfolio page (/portfolio) for real before/after job photos
- [x] Admin portfolio upload (before/after pairs with title/description/room type)
- [x] Admin dashboard with stats, leads, contractors, portfolio tabs
- [x] Contractor registration/login/dashboard
- [x] Lead capture modal with room photo + design style context
- [x] Share designs with voting
- [x] "Seamless Bath" branding throughout
- [x] "Our Work" nav link + "See Our Work" homepage section

## Key Data Models
- `projects`: id, zip_code, project_type, budget, original_image, additional_images[], status, designs[], cost_estimate, analysis
- `contractors`: id, company_name, specialties[], service_zip_codes[], rating, phone, email
- `leads`: id, name, phone, email, zip_code, contractor_id, project_id, status
- `portfolio`: id, title, description, room_type, before_image, after_image
- `shares`: id, project_id, designs[], original_image

## API Endpoints
- POST /api/projects/upload (multi-image)
- POST /api/projects/{id}/generate
- GET /api/projects/{id}
- GET /api/contractors/search?zip_code=&project_type=
- POST /api/leads
- GET /api/portfolio (public)
- POST /api/admin/portfolio (upload)
- DELETE /api/admin/portfolio/{id}
- GET /api/admin/stats
- GET /api/admin/leads
- GET /api/admin/contractors

## Backlog
- [ ] P1: Refactor server.py into modular files (routes/, models/, services/)
- [ ] P2: Contractor portfolio photo upload (from contractor dashboard)
- [ ] P2: Email notifications for new leads (SendGrid/Resend)
- [ ] P2: Real ZIP code geocoding API for accurate distance calculations
- [ ] P2: Integrate handyman business branding more deeply with Seamless Bath
