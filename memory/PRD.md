# AI Renovation Visualizer - PRD

## Original Problem Statement
Build a web app called "AI Renovation Visualizer" that helps homeowners upload a photo of a room, see AI-generated renovation redesigns, estimate renovation cost based on location, and connect with nearby contractors.

## Architecture
- **Frontend**: React + Tailwind + Shadcn UI + Leaflet + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **AI**: OpenAI GPT Image 1 via Emergent LLM key (emergentintegrations library)
- **Auth**: JWT-based for contractors
- **Maps**: Leaflet/OpenStreetMap

## User Personas
1. **Homeowners**: Want to visualize renovations before committing, get cost estimates, and find contractors
2. **Contractors**: Want to receive leads, manage their profile, and connect with homeowners

## Core Requirements
- Room photo upload with ZIP code and project type selection
- AI-generated 3 renovation styles per project
- Cost estimation based on project type + regional factors
- Contractor map showing nearby professionals
- Lead capture form for quote requests
- Contractor registration, login, profile management, lead viewing

## What's Been Implemented (March 14, 2026)
- [x] Home page with hero, how-it-works, categories, CTA sections
- [x] Upload page with drag-drop photo, ZIP code, project type selector
- [x] Results page with 3 AI-generated designs, cost estimate, contractor map
- [x] Contractor login & registration with JWT auth
- [x] Contractor dashboard with profile editing & leads viewing
- [x] Lead capture modal with form submission
- [x] Leaflet contractor map with custom markers
- [x] 5 sample contractors seeded across US cities
- [x] Cost estimation algorithm with regional multipliers
- [x] Full design system (Fraunces + DM Sans, Deep Jungle Green + Terracotta)

## Test Results
- Backend: 100% (11/11 tests passed)
- Frontend: 95% (all flows working)

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (High)
- Contractor photo upload for portfolio
- Before/After slider component for design comparison

### P2 (Medium)
- Admin panel for managing all contractors and leads
- Email notifications for new leads
- Contractor reviews and ratings system
- Multi-image upload support

### Next Tasks
- Add contractor portfolio photo upload
- Implement email notifications (SendGrid/Resend) for new leads
- Add real ZIP code geocoding API for accurate distance calculations
- Build admin dashboard for platform management
