# Seamless Bath → The Shirtless Handyman | Seamless Surfaces

## Product Overview
AI-powered web app ("The Seamless Studio") for The Shirtless Handyman — lets users upload room photos, see AI-generated seamless surface renovation designs, get cost estimates, and connect with Ryan Mena directly.

## Architecture
```
/app/backend/
  server.py         # Routes + business logic (~860 lines)
  auth.py           # JWT + httpOnly cookie auth
  prompts.py        # AI prompts, style configs, routing constants
  models/schemas.py # Pydantic models
  cost_estimator.py # Cost calculation
/app/frontend/src/
  lib/api.js        # Shared axios instance (withCredentials)
  pages/            # Page components
  components/       # Extracted sub-components
```

## Auth Architecture
- httpOnly secure cookies for token storage (not localStorage)
- Backend sets `auth_token` cookie on login (HttpOnly, Secure, SameSite=lax)
- `decode_token` reads from cookie first, falls back to Bearer header
- Logout endpoint clears cookie
- localStorage stores only "authenticated" flag for frontend UI state

## Implemented Features
- [x] Full homepage with 12 sections (hero, problem, trust, explainer, premium, handyman, how-it-works, gallery, our work, contractor partners, pricing, closing CTA)
- [x] The Seamless Studio — 3-step flow (Upload → Analysis → Results)
- [x] 42 seamless-only AI prompts (15 finish types × 14 room types)
- [x] httpOnly cookie auth for admin + contractor login
- [x] SEO: meta tags, sitemap.xml, robots.txt, JSON-LD structured data
- [x] Klaviyo integration
- [x] Portfolio page + admin upload
- [x] Lead capture with contractor routing + easter egg (ZIP 70123)

## Backlog
- [ ] P2: Email notifications for new leads
- [ ] P2: Real ZIP geocoding API
