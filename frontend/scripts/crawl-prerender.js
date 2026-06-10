/**
 * One-shot crawler that pre-renders the running React SPA into static HTML.
 *
 * Why this exists:
 *   - Production Cloud Build has no Chrome, so the post-build prerender script
 *     falls back to meta-only and Google still sees an empty <div id="root">.
 *   - This script runs HERE in the preview environment (which DOES have
 *     Chromium installed at /usr/bin/chromium), hits the live preview React app,
 *     captures the fully-rendered HTML per route, and writes the files into
 *     `frontend/public/<route>/index.html`.
 *   - CRA's `yarn build` copies everything under `public/` directly into the
 *     `build/` output. So when the user redeploys, these prerendered files
 *     ship with the build and the static host serves them BEFORE the React JS
 *     bundle has a chance to render.
 *
 * Result:
 *   - Bots (Google, Bing, Facebook, Twitter, LinkedIn, Slack, iMessage) see
 *     fully-rendered HTML on first byte for every route.
 *   - Real users see the prerendered HTML, then React hydrates on top
 *     (createRoot replaces it cleanly — no hydration warnings since we use
 *     createRoot, not hydrateRoot).
 *
 * Run: `node scripts/crawl-prerender.js`
 *   - Reads target URL from $TARGET_URL or defaults to http://localhost:3000
 *   - Reads route list from scripts/seo-routes.js
 *   - Writes /app/frontend/public/<route>/index.html (and / for the homepage)
 *
 * Re-run this any time content changes substantially. The output files are
 * intended to be committed to git.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const { SEO_ROUTES, SITE } = require("./seo-routes");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const TARGET = process.env.TARGET_URL || "http://localhost:3000";
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH ||
  (fs.existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : "/usr/bin/chromium");

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Reinforce the per-route head tags after Puppeteer captures the live DOM.
 * Helmet sets them client-side, but belt-and-suspenders in case the snapshot
 * was taken before Helmet's effect ran.
 */
function reinforceHead(html, route) {
  const canonical = `${SITE}${route.path === "/" ? "" : route.path}`;
  const ogType = route.ogType || "website";
  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(route.title)}</title>`);
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
  );

  const tags = {
    'link[rel="canonical"]': `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    'meta[property="og:type"]': `<meta property="og:type" content="${escapeAttr(ogType)}" />`,
    'meta[property="og:url"]': `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    'meta[property="og:title"]': `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
    'meta[property="og:description"]': `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    'meta[property="og:image"]': `<meta property="og:image" content="${escapeAttr(route.ogImage)}" />`,
    'meta[name="twitter:title"]': `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`,
    'meta[name="twitter:description"]': `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    'meta[name="twitter:image"]': `<meta name="twitter:image" content="${escapeAttr(route.ogImage)}" />`,
  };
  for (const [selector, tag] of Object.entries(tags)) {
    const re = new RegExp(
      selector
        .replace(/\[/g, "\\s*")
        .replace(/\]/g, "[^>]*>")
        .replace(/=/g, '=["\']?')
        .replace(/"/g, '["\']?')
        .replace(/^link/, "<link\\b")
        .replace(/^meta/, "<meta\\b"),
      "i",
    );
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n    </head>`);
  }
  out = out.replace(/<meta\s+name=["']x-prerendered["'][^>]*>/i, "");
  out = out.replace("</head>", `    <meta name="x-prerendered" content="${new Date().toISOString()}" />\n    </head>`);
  return out;
}

/**
 * Strip development-server only artefacts that should not be in committed HTML.
 */
function stripDevArtifacts(html) {
  // Hot-reload error overlay iframe
  html = html.replace(/<iframe[^>]*id=["']webpack-dev-server-client-overlay["'][\s\S]*?<\/iframe>/gi, "");
  // CRA injected dev-only scripts (none expected in build, but safety)
  return html;
}

async function snapshot(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent("Mozilla/5.0 (compatible; ShirtlessSSG/1.0)");
  page.on("pageerror", (e) => console.warn(`   pageerror @ ${route.path}: ${e.message}`));

  // Block third-party tracking / popup scripts at the network level so they
  // never get a chance to inject their DOM into the snapshot. Critical: Klaviyo
  // injects a fullscreen "See Your Room Transformed" popup that would otherwise
  // be baked into the static HTML and cause production users to see the popup
  // twice (once from the snapshot, once when Klaviyo's runtime JS loads),
  // freezing the page on first visit.
  await page.setRequestInterception(true);
  const blockedHosts = [
    "klaviyo.com",
    "static.klaviyo.com",
    "static-tracking.klaviyo.com",
    "fast.a.klaviyo.com",
    "googletagmanager.com",
    "google-analytics.com",
    "doubleclick.net",
    "facebook.com",
    "facebook.net",
  ];
  page.on("request", (req) => {
    const url = req.url();
    if (blockedHosts.some((h) => url.includes(h))) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const url = `${TARGET}${route.path}`;
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 35000 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
  }
  // Give framer-motion + Helmet's dedupe effect time to settle
  await new Promise((r) => setTimeout(r, 1800));

  // Clean any in-flight loaders so they don't freeze the snapshot
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="generating-loader"]').forEach((el) => el.remove());
    // Close any sessionStorage-controlled overlays so they don't render in the snapshot
    const cs = document.querySelectorAll('[data-testid="chat-widget-panel"], [data-testid="exit-intent-modal"], [data-testid="email-capture-modal"]');
    cs.forEach((el) => el.remove());

    // CRITICAL: strip ALL Klaviyo-injected popups, forms, and surrounding wrappers.
    // Klaviyo injects modals into the live DOM ~1-3s after page load — if we don't
    // remove them before snapshotting, they get baked into the static HTML and
    // collide with the runtime Klaviyo JS (causes the production page to freeze
    // on first visit because two popups try to occupy the same root element).
    const klaviyoSelectors = [
      '[class*="klaviyo"]',
      '[class*="kl-private"]',
      '[data-testid="kl-private-form-modal-overlay"]',
      'div[class*="needsclick"]',
      '#klaviyo-pim',
      'iframe[src*="klaviyo"]',
      'iframe[data-testid*="klaviyo"]',
    ];
    document.querySelectorAll(klaviyoSelectors.join(",")).forEach((el) => el.remove());

    // Also strip the Klaviyo loader script container if present
    document.querySelectorAll('script[src*="klaviyo"]').forEach((el) => el.remove());

    // Remove any element with the inline Klaviyo signup form text we know about
    const textsToStrip = ["See Your Room Transformed", "Want Access to Exclusive Deals"];
    document.querySelectorAll("*").forEach((el) => {
      if (el.children.length === 0 && textsToStrip.some((t) => (el.textContent || "").includes(t))) {
        let p = el;
        // Walk up to the popup root and remove it
        for (let i = 0; i < 8 && p && p.parentElement; i++) {
          if (
            (p.className && /klaviyo|kl-private|needsclick/i.test(p.className)) ||
            (p.style && (p.style.position === "fixed" || parseInt(p.style.zIndex || "0", 10) > 1000))
          ) {
            p.remove();
            return;
          }
          p = p.parentElement;
        }
      }
    });
  });

  let html = await page.content();
  await page.close();
  html = stripDevArtifacts(html);
  html = reinforceHead(html, route);
  return html;
}

function writeRouteFile(route, html) {
  if (route.path === "/") {
    // Don't overwrite public/index.html — that's CRA's shell template.
    // Instead, write to public/__prerendered__/home.html for reference (homepage
    // doesn't strictly need a separate file — the SPA shell handles it).
    // Actually we DO want the homepage prerendered too, so write directly to
    // public/index.html — CRA preserves it and uses it as the shell.
    fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), html, "utf8");
    return "index.html";
  }
  const dir = path.join(PUBLIC_DIR, route.path.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "index.html");
  fs.writeFileSync(out, html, "utf8");
  return path.relative(PUBLIC_DIR, out);
}

async function main() {
  if (!fs.existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME}. Install chromium or set PUPPETEER_EXECUTABLE_PATH.`);
    process.exit(1);
  }
  console.log(`[crawl] Target: ${TARGET}`);
  console.log(`[crawl] Chrome: ${CHROME}`);
  console.log(`[crawl] Routes: ${SEO_ROUTES.length}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  let success = 0;
  let failure = 0;
  for (const route of SEO_ROUTES) {
    const t0 = Date.now();
    try {
      const html = await snapshot(browser, route);
      const out = writeRouteFile(route, html);
      const ms = Date.now() - t0;
      const kb = (html.length / 1024).toFixed(1);
      console.log(`  ✓ ${route.path.padEnd(48)} -> public/${out.padEnd(50)} ${kb} KB · ${ms} ms`);
      success++;
    } catch (e) {
      console.warn(`  ✗ ${route.path}: ${e.message}`);
      failure++;
    }
  }

  await browser.close();
  console.log(`[crawl] Done. ${success} snapshots written, ${failure} failures.`);
  if (failure > 0) process.exit(2);
}

main().catch((e) => {
  console.error("[crawl] Fatal:", e);
  process.exit(1);
});
