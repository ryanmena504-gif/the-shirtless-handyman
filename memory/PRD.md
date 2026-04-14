# Seamless Bath - AI Renovation Visualizer

## Product Overview
AI-powered web app that lets homeowners upload room photos, get AI-generated renovation designs using **seamless continuous surfaces only**, cost estimates, and connect with local contractors.

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI, Leaflet maps
- **Backend:** FastAPI, Motor (MongoDB async), background threads for AI tasks
- **AI:** OpenAI GPT Image 1 + GPT-4o via Emergent LLM Key
- **Database:** MongoDB

## Architecture (Refactored)
```
/app/backend/
  server.py          # Routes + business logic (~900 lines, down from 1170)
  prompts.py         # All AI prompts, style configs, routing constants
  models/schemas.py  # Pydantic models
  auth.py            # JWT auth helpers
  cost_estimator.py  # Cost calculation
/app/frontend/src/
  pages/             # Page components (AdminPage, UploadPage, ResultsPage, etc.)
  components/        # Extracted sub-components:
    AdminLeadsList.js, AdminContractorsList.js, AdminPortfolioTab.js,
    CostEstimate.js, BeforeAfterSlider.js, ContractorMap.js, etc.
```

## Implemented Features
- [x] 3-step flow: Upload (1-3 photos) -> Analysis -> Results
- [x] 42 seamless-only AI prompts (15 finish types across 14 room types)
- [x] Budget-aware designs, before/after sliders, Material Explorer, PDF export
- [x] Suggested contractor highlight + easter egg (ZIP 70123)
- [x] Portfolio page + admin upload
- [x] Code quality: hook deps, stable keys, refactored Python functions, modular architecture

## Backlog
- [ ] P2: httpOnly cookie auth migration
- [ ] P2: Contractor portfolio upload from dashboard
- [ ] P2: Email notifications for new leads
- [ ] P2: Real ZIP geocoding API
