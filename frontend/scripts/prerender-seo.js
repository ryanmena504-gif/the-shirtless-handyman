/**
 * Post-build static-site-generation (SSG) for the React SPA.
 *
 * After `craco build`, this:
 *   1. Boots a tiny static server on the build/ directory.
 *   2. Launches headless Chromium via puppeteer-core (uses system Chrome,
 *      no 250MB Chromium download required).
 *   3. For every route in scripts/seo-routes.js, navigates to the route,
 *      waits for React + Helmet to render, then captures the fully-rendered
 *      HTML (DOM + meta tags + JSON-LD) and writes it to:
 *        build/<route>/index.html
 *
 * Why this matters:
 *   - Google does execute JS, but rendered SSG is still ranked higher and
 *     indexed faster than JS-rendered SPAs.
 *   - Social crawlers (Facebook/Twitter/LinkedIn/Slack/iMessage/WhatsApp)
 *     do NOT execute JS — they need real OG/Twitter tags in the first byte.
 *   - With SSG, the page is interactive almost immediately after the first
 *     paint (real text is already there, hydration adds interactivity on top).
 *
 * The React app still hydrates and runs as a normal SPA on top of the
 * pre-rendered HTML — no behavior changes for the user.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const handler = require("serve-handler");
const puppeteer = require("puppeteer-core");
const { SEO_ROUTES, SITE } = require("./seo-routes");

const BUILD_DIR = path.join(__dirname, "..", "build");
const PORT = 4477;
const ORIGIN = `http://localhost:${PORT}`;

// System Chrome / Chromium — installed in container at /usr/bin/chromium
const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  (fs.existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : "/usr/bin/chromium");

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) =>
      handler(req, res, {
        public: BUILD_DIR,
        // SPA fallback so unknown routes still serve index.html (before we overwrite per-route)
        rewrites: [{ source: "**", destination: "/index.html" }],
      }),
    );
    server.on("error", reject);
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * After Puppeteer captures the live DOM, ensure title/canonical/OG/Twitter are
 * the route's authoritative values (in case Helmet didn't dedupe in time).
 */
function reinforceHead(html, route) {
  const canonical = `${SITE}${route.path === "/" ? "" : route.path}`;
  const ogType = route.ogType || "website";
  const title = route.title;
  const desc = route.description;

  let out = html;

  // Title
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);

  // Description (replace the first one only — Helmet dedupes after mount but
  // belt-and-suspenders here for crawlers that bail before JS even parses).
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeAttr(desc)}" />`,
  );

  // Canonical
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(out)) {
    out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeAttr(canonical)}" />`);
  } else {
    out = out.replace("</head>", `    <link rel="canonical" href="${escapeAttr(canonical)}" />\n    </head>`);
  }

  // OG
  const ogPairs = [
    ["og:type", ogType],
    ["og:url", canonical],
    ["og:title", title],
    ["og:description", desc],
    ["og:image", route.ogImage],
  ];
  for (const [prop, content] of ogPairs) {
    const re = new RegExp(`<meta\\s+property=["']${prop}["'][^>]*>`, "i");
    const tag = `<meta property="${prop}" content="${escapeAttr(content)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n    </head>`);
  }

  // Twitter
  const twPairs = [
    ["twitter:title", title],
    ["twitter:description", desc],
    ["twitter:image", route.ogImage],
  ];
  for (const [name, content] of twPairs) {
    const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
    const tag = `<meta name="${name}" content="${escapeAttr(content)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n    </head>`);
  }

  // Mark the snapshot so we can detect it in debugging
  out = out.replace("</head>", `    <meta name="x-prerendered" content="1" />\n    </head>`);
  return out;
}

async function snapshotRoute(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent("Mozilla/5.0 (compatible; ShirtlessSSG/1.0; +https://theshirtlesshandyman.com)");

  // Suppress browser logs unless they're errors that crash the render.
  page.on("pageerror", (err) => console.warn(`[prerender]   pageerror at ${route.path}: ${err.message}`));

  const url = `${ORIGIN}${route.path}`;
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  } catch (e) {
    // Fall back to domcontentloaded for routes that have background polling
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  }

  // Give Helmet, framer-motion mount animations, and SeoHead's dedupe pass time to settle.
  await new Promise((r) => setTimeout(r, 1500));

  // Strip any in-flight loading spinners / framer-motion transform inline styles
  // that would freeze the snapshot mid-animation. The CSS keeps these as the
  // final state anyway after hydration.
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="generating-loader"]').forEach((el) => el.remove());
  });

  let html = await page.content();
  await page.close();
  html = reinforceHead(html, route);
  return html;
}

function writeRouteFile(route, html) {
  if (route.path === "/") {
    fs.writeFileSync(path.join(BUILD_DIR, "index.html"), html, "utf8");
    return "index.html";
  }
  const dir = path.join(BUILD_DIR, route.path.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  return path.relative(BUILD_DIR, path.join(dir, "index.html"));
}

async function main() {
  if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
    console.error(`[prerender] ERROR: build/index.html not found. Did 'craco build' run first?`);
    process.exit(1);
  }
  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`[prerender] ERROR: Chrome not found at ${CHROME_PATH}. Set PUPPETEER_EXECUTABLE_PATH.`);
    process.exit(1);
  }

  console.log(`[prerender] Booting static server at ${ORIGIN} (build dir: ${BUILD_DIR})`);
  const server = await startStaticServer();

  console.log(`[prerender] Launching Chrome at ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  console.log(`[prerender] Snapshotting ${SEO_ROUTES.length} routes...`);
  let success = 0;
  let failure = 0;
  for (const route of SEO_ROUTES) {
    const t0 = Date.now();
    try {
      const html = await snapshotRoute(browser, route);
      const out = writeRouteFile(route, html);
      const ms = Date.now() - t0;
      const sz = (html.length / 1024).toFixed(1);
      console.log(`[prerender]   ✓ ${route.path.padEnd(50)} -> ${out.padEnd(40)} ${sz} KB · ${ms} ms`);
      success++;
    } catch (e) {
      console.error(`[prerender]   ✗ ${route.path}: ${e.message}`);
      failure++;
    }
  }

  await browser.close();
  server.close();

  console.log(`[prerender] Done. ${success} snapshots written, ${failure} failures.`);
  if (failure > 0) process.exit(2);
}

main().catch((e) => {
  console.error("[prerender] Fatal:", e);
  process.exit(1);
});
