# Test Credentials

## Admin Panel
- URL: `/admin`
- Password: `renovate2024admin`

## Admin Schedule Blocker
- URL: `/admin/schedule` (same admin password)
- Timezone: America/Chicago
- Endpoints:
  - `GET/POST/PATCH/DELETE /api/admin/schedule/blocks`
  - `GET/POST/PATCH/DELETE /api/admin/schedule/rules`
  - `POST /api/admin/schedule/blocks/preview-conflicts`
- Public availability: `GET /api/schedule/availability?days=30`
- Direct-API bookings for blocked slots are rejected server-side (verified).

## Contractor Login
- URL: /contractor/login
- Email: `contact@crescentcityreno.com`
- Password: `password123`

## Seed Contractors
- Seamless Bathrooms LLC: `info@seamlessbathrooms.com` / `password123`
- Crescent City General: `info@crescentcityreno.com` / `password123`
- NOLA Epoxy Pros: `info@nolaepoxypros.com` / `password123`
- Big Easy Landscaping: `info@bigeasylandscaping.com` / `password123`
- Garden District Pool: `info@gardendistrict.com` / `password123`
- Bayou Remodeling: `info@bayouremodelingco.com` / `password123`

## Easter Egg
- ZIP code `70123` triggers "The Shirtless Handyman" (Ryan Mena) as suggested contractor
