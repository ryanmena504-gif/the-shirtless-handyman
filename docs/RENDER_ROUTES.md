# Render routing for www.theshirtlesshandyman.com

The static site (`the-shirtless-handyman`, srv-db3j902j9qps73ft1860) is managed
in the Render dashboard, not in `render.yaml`. Its redirect/rewrite rules live
in the dashboard only: **Render → the-shirtless-handyman → Redirects/Rewrites**.

## Why no-slash URLs need their own rules

The build writes one prerendered page per route as `build/<route>/index.html`
(see `frontend/scripts/inject-prerendered.js`). Render serves that file for
`/shop/` (trailing slash), but `/shop` is not a file, so Render falls through
to the SPA catch-all `/* → /index.html` and serves the **homepage** head tags.
Link-preview crawlers (Facebook, iMessage, Slack, X) don't run JavaScript, so a
shared `/shop` link previews as the homepage. Render also doesn't map `/shop`
to `shop.html` (e.g. `/privacy-policy` serves the homepage even though
`privacy-policy.html` exists), so flat files wouldn't help.

Render applies the first matching rule from the top and skips rules when a real
file exists at the path, so per-route rewrites placed above the catch-all fix
`/shop` without changing `/shop/` or any image/JS file.

## The rules (in this order)

Print the current list with `node frontend/scripts/render-rewrites.js`. Every
row is Action **Rewrite**; the source has no trailing slash.

| # | Source | Destination |
|---|---|---|
| 1 | `/book` | `/book/index.html` |
| 2 | `/faq` | `/faq/index.html` |
| 3 | `/shop` | `/shop/index.html` |
| 4 | `/about` | `/about/index.html` |
| 5 | `/finishes` | `/finishes/index.html` |
| 6 | `/upload` | `/upload/index.html` |
| 7 | `/portfolio` | `/portfolio/index.html` |
| 8 | `/microcement-new-orleans` | `/microcement-new-orleans/index.html` |
| 9 | `/microcement-installers-new-orleans` | `/microcement-installers-new-orleans/index.html` |
| 10 | `/microcement-metairie` | `/microcement-metairie/index.html` |
| 11 | `/tadelakt-new-orleans` | `/tadelakt-new-orleans/index.html` |
| 12 | `/rockscape-walls-new-orleans` | `/rockscape-walls-new-orleans/index.html` |
| 13 | `/pool-deck-resurfacing-new-orleans` | `/pool-deck-resurfacing-new-orleans/index.html` |
| 14 | `/blog` | `/blog/index.html` |
| 15 | `/blog/microcement-vs-tile-cost-new-orleans` | `/blog/microcement-vs-tile-cost-new-orleans/index.html` |
| 16 | `/blog/best-microcement-contractor-new-orleans` | `/blog/best-microcement-contractor-new-orleans/index.html` |
| 17 | `/blog/tadelakt-vs-microcement-bathroom` | `/blog/tadelakt-vs-microcement-bathroom/index.html` |
| 18 | `/blog/why-tile-fails-in-new-orleans-humidity` | `/blog/why-tile-fails-in-new-orleans-humidity/index.html` |
| 19 | `/blog/how-to-choose-microcement-installer-new-orleans` | `/blog/how-to-choose-microcement-installer-new-orleans/index.html` |
| 20 | `/microcement-showers-new-orleans` | `/microcement-showers-new-orleans/index.html` |
| 21 | `/bathroom-remodel-new-orleans` | `/bathroom-remodel-new-orleans/index.html` |
| 22 | `/venetian-plaster-new-orleans` | `/venetian-plaster-new-orleans/index.html` |
| 23 | `/microcement-countertops-new-orleans` | `/microcement-countertops-new-orleans/index.html` |
| 24 | `/lakeview-handyman` | `/lakeview-handyman/index.html` |
| 25 | `/uptown-handyman` | `/uptown-handyman/index.html` |
| 26 | `/mid-city-handyman` | `/mid-city-handyman/index.html` |
| 27 | `/bywater-handyman` | `/bywater-handyman/index.html` |
| 28 | `/french-quarter-handyman` | `/french-quarter-handyman/index.html` |
| 29 | `/garden-district-handyman` | `/garden-district-handyman/index.html` |
| 30 | `/*` | `/index.html` |

`/* → /index.html` is the existing SPA rule. Keep it, and keep it **last**.

When you add a route to `frontend/scripts/seo-routes.js`, add its rewrite
above `/*` too.

## Check it

```bash
cd frontend
node scripts/check-route-heads.js          # checks the live site, with and without the slash
```

Every line should say `OK`. Social apps cache previews; re-scrape a link in
Facebook's Sharing Debugger (https://developers.facebook.com/tools/debug/) to
refresh it.
