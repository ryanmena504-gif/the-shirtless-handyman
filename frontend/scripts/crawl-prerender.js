/**
 * Body-fragment crawler for SSG.
 *
 * Captures the INNER HTML of <div id="root"> for every route (the rendered React
 * component tree) WITHOUT any script tags, bundle references, or shell markup.
 * The output fragments are completely independent of any specific build hash.
 *
 * Output: public/_prerendered/<slug>.json containing {fragment, headOverrides}.
 *
 * These fragments are then injected into the production `build/index.html`
 * shell at Cloud Build time by `scripts/inject-prerendered.js` — that script
 * runs WITHOUT Chrome, just doing string manipulation, so it works inside
 * Emergent's Cloud Build environment.
 *
 * Run: `node scripts/crawl-prerender.js` (requires puppeteer-core + system Chrome).
 * Or via GitHub Action: `.github/workflows/prerender.yml`.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const { SEO_ROUTES, SITE } = require("./seo-routes");

const OUT_DIR = path.join(__dirname, "..", "public", "_prerendered");
const TARGET = process.env.TARGET_URL || "http://localhost:3000";
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  (fs.existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : "/usr/bin/chromium");

const BLOCKED_HOSTS = [
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

function slugFor(routePath) {
  return routePath === "/" ? "home" : routePath.replace(/^\//, "").replace(/\//g, "__");
}

async function snapshot(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent("Mozilla/5.0 (compatible; ShirtlessSSG/1.0)");
  page.on("pageerror", (e) => console.warn(`   pageerror @ ${route.path}: ${e.message}`));

  // Block third-party popup scripts (Klaviyo, analytics) at the network level.
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (BLOCKED_HOSTS.some((h) => req.url().includes(h))) {
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
  await new Promise((r) => setTimeout(r, 1800));

  // Clean any in-flight loaders/overlays so they don't get baked in
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="generating-loader"]').forEach((el) => el.remove());
    document.querySelectorAll('[data-testid="chat-widget-panel"], [data-testid="exit-intent-modal"], [data-testid="email-capture-modal"]').forEach((el) => el.remove());
    document.querySelectorAll('[class*="klaviyo"], [class*="kl-private"], [class*="needsclick"]').forEach((el) => el.remove());
  });

  // Extract ONLY the inner HTML of <div id="root"> — pure body content, no shell, no scripts.
  const fragment = await page.evaluate(() => {
    const root = document.getElementById("root");
    return root ? root.innerHTML : "";
  });

  // Extract any JSON-LD blocks placed in <head> by Helmet — we want these too.
  const jsonLdBlocks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || "");
  });

  await page.close();
  return { fragment, jsonLdBlocks };
}

async function main() {
  if (!fs.existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME}. Install chromium or set PUPPETEER_EXECUTABLE_PATH.`);
    process.exit(1);
  }
  console.log(`[crawl] Target:  ${TARGET}`);
  console.log(`[crawl] Chrome:  ${CHROME}`);
  console.log(`[crawl] Output:  ${OUT_DIR}`);
  console.log(`[crawl] Routes:  ${SEO_ROUTES.length}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  let success = 0;
  let failure = 0;

  // Build an index of all snapshots so the injector knows what's available
  const indexEntries = [];

  for (const route of SEO_ROUTES) {
    const t0 = Date.now();
    try {
      const { fragment, jsonLdBlocks } = await snapshot(browser, route);
      const slug = slugFor(route.path);
      const canonical = `${SITE}${route.path === "/" ? "" : route.path}`;
      const payload = {
        path: route.path,
        slug,
        title: route.title,
        description: route.description,
        canonical,
        ogType: route.ogType || "website",
        ogImage: route.ogImage,
        jsonLd: jsonLdBlocks,
        fragment,
        capturedAt: new Date().toISOString(),
      };
      const outFile = path.join(OUT_DIR, `${slug}.json`);
      fs.writeFileSync(outFile, JSON.stringify(payload), "utf8");
      indexEntries.push({ path: route.path, slug, size: fragment.length });
      const ms = Date.now() - t0;
      const kb = (fragment.length / 1024).toFixed(1);
      console.log(`  ✓ ${route.path.padEnd(48)} -> ${slug}.json   ${kb} KB · ${ms} ms · ${jsonLdBlocks.length} JSON-LD`);
      success++;
    } catch (e) {
      console.warn(`  ✗ ${route.path}: ${e.message}`);
      failure++;
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "_index.json"), JSON.stringify({ routes: indexEntries, generatedAt: new Date().toISOString() }, null, 2));

  await browser.close();
  console.log(`[crawl] Done. ${success} fragments written, ${failure} failures.`);
  if (failure > 0) process.exit(2);
}

main().catch((e) => {
  console.error("[crawl] Fatal:", e);
  process.exit(1);
});
