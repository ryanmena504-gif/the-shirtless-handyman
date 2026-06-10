# SSG Prerender Snapshots

This folder contains the **body fragments** of the React app rendered for every
public route. They are committed to the repo and read at deploy time by
`frontend/scripts/inject-prerendered.js`.

## How it works

1. **Capture (manual or via GitHub Action):**
   Run `yarn prerender` locally (requires Chromium + puppeteer-core), OR push
   to `main` and the `.github/workflows/prerender.yml` Action will regenerate
   everything automatically and commit it back.

2. **Deploy:**
   When Emergent Cloud Build runs `yarn build`, the postbuild step
   (`scripts/inject-prerendered.js`) reads each `*.json` fragment here and
   injects the body content into the build's `build/<route>/index.html`,
   alongside the build's correct hashed bundle paths.

3. **Serve:**
   Static hosts (Vercel/Netlify/Cloudflare/etc.) serve `/lakeview-handyman/index.html`
   when a user (or crawler) hits `/lakeview-handyman`. Bots see fully rendered
   HTML on the first byte. Real users see the same HTML, then React's
   `createRoot` mounts and replaces it with the interactive version.

## File format

Each `*.json` file is a payload:
```json
{
  "path": "/lakeview-handyman",
  "slug": "lakeview-handyman",
  "title": "...",
  "description": "...",
  "canonical": "https://theshirtlesshandyman.com/lakeview-handyman",
  "ogType": "website",
  "ogImage": "https://...",
  "jsonLd": ["{...}", "{...}"],
  "fragment": "<section>...</section>",
  "capturedAt": "2026-06-10T11:55:00.000Z"
}
```

`_index.json` is an inventory of all routes captured (for debugging — not used at build).

## When to regenerate

- Any time you change site content (copy, add a blog post, change neighborhood pages)
- Any time you add a new route — also add it to `frontend/scripts/seo-routes.js` first

## Why not full HTML?

Earlier attempts captured the full HTML including `<script src="/static/js/bundle.js">`
references — but CRA dev server uses `bundle.js` while production builds use
hashed paths like `main.abc123.js`. The hashes never match across builds, so
the full HTML approach broke production.

By capturing only the body fragment (everything inside `<div id="root">`) we
get the SEO benefit (real text content in the static HTML) without coupling
to any specific build's hashed asset paths. The shell — and therefore the
bundle refs — always come from the freshest `yarn build`.
