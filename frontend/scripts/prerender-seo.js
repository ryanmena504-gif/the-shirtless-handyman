/**
 * Post-build SEO pre-render — adaptive: tries full SSG via headless Chrome,
 * falls back to meta-injection-only when Chrome isn't available in the build
 * environment.
 *
 * Pipeline (called after `craco build`):
 *   1. Read build/index.html (the SPA shell).
 *   2. If SKIP_PRERENDER=1 → exit early (escape hatch for any deploy issue).
 *   3. Try full SSG mode:
 *        - Boot a tiny static server on build/
 *        - Launch headless Chromium via puppeteer-core (system Chrome)
 *        - For every route in scripts/seo-routes.js, visit it, wait for
 *          React + Helmet to render, capture the live DOM, write to
 *          build/<route>/index.html
 *   4. If Chrome / puppeteer is unavailable, the launch fails, or the build
 *      environment is constrained — fall back to META MODE:
 *        - For every route, rewrite the shell's <title>, <meta description>,
 *          canonical, OG and Twitter tags to the route-specific values and
 *          write build/<route>/index.html.
 *
 * Either way, the deploy never hangs and every route always gets its own HTML
 * file with at minimum correct meta tags for crawlers.
 */

const fs = require("fs");
const path = require("path");
const { SEO_ROUTES, SITE } = require("./seo-routes");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SHELL_PATH = path.join(BUILD_DIR, "index.html");
const PORT = 4477;
const ORIGIN = `http://localhost:${PORT}`;

// Possible Chrome locations on the typical Linux build host
const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Meta-mode: rewrite the shell HTML with route-specific title/description/
 * canonical/OG/Twitter tags. This is what every crawler sees in the first
 * byte regardless of whether Chrome was available.
 */
function rewriteShell(shell, route) {
  const canonical = `${SITE}${route.path === "/" ? "" : route.path}`;
  const ogType = route.ogType || "website";
  const titleAttr = escapeText(route.title);
  const descAttr = escapeAttr(route.description);
  const ogImage = escapeAttr(route.ogImage);
  const canonicalEsc = escapeAttr(canonical);

  let html = shell;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleAttr}</title>`);
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${descAttr}" />`,
  );

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonicalEsc}" />`,
    );
  } else {
    html = html.replace("</head>", `    <link rel="canonical" href="${canonicalEsc}" />\n    </head>`);
  }

  const ogPairs = [
    ["og:type", ogType],
    ["og:url", canonical],
    ["og:title", route.title],
    ["og:description", route.description],
    ["og:image", route.ogImage],
    ["og:image:secure_url", route.ogImage],
  ];
  for (const [prop, content] of ogPairs) {
    const re = new RegExp(`<meta\\s+property=["']${prop}["'][^>]*>`, "i");
    const tag = `<meta property="${prop}" content="${escapeAttr(content)}" />`;
    html = re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n    </head>`);
  }
  const twPairs = [
    ["twitter:title", route.title],
    ["twitter:description", route.description],
    ["twitter:image", route.ogImage],
  ];
  for (const [name, content] of twPairs) {
    const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
    const tag = `<meta name="${name}" content="${escapeAttr(content)}" />`;
    html = re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n    </head>`);
  }

  return html;
}

function writeRouteFile(route, html) {
  if (route.path === "/") {
    fs.writeFileSync(SHELL_PATH, html, "utf8");
    return "index.html";
  }
  const dir = path.join(BUILD_DIR, route.path.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "index.html");
  fs.writeFileSync(out, html, "utf8");
  return path.relative(BUILD_DIR, out);
}

async function runMetaMode() {
  console.log(`[prerender] META MODE — injecting per-route meta tags into ${SEO_ROUTES.length} routes`);
  const shell = fs.readFileSync(SHELL_PATH, "utf8");
  let count = 0;
  for (const route of SEO_ROUTES) {
    const html = rewriteShell(shell, route);
    const out = writeRouteFile(route, html);
    console.log(`[prerender]   ${route.path.padEnd(45)} -> ${out}`);
    count++;
  }
  console.log(`[prerender] META MODE done. ${count} files written.`);
}

async function runSsgMode(chromePath) {
  // Lazy-require Puppeteer + serve-handler only when we're actually going to use them.
  // If either is missing the require() will throw and we'll fall back to meta mode.
  const puppeteer = require("puppeteer-core");
  const handler = require("serve-handler");
  const http = require("http");

  console.log(`[prerender] SSG MODE — Chrome at ${chromePath}, ${SEO_ROUTES.length} routes`);

  const server = await new Promise((resolve, reject) => {
    const s = http.createServer((req, res) =>
      handler(req, res, {
        public: BUILD_DIR,
        rewrites: [{ source: "**", destination: "/index.html" }],
      }),
    );
    s.on("error", reject);
    s.listen(PORT, "127.0.0.1", () => resolve(s));
  });

  // Hard cap so a runaway Chrome can never freeze deploy
  const browserLaunchTimeoutMs = 30000;
  const browser = await Promise.race([
    puppeteer.launch({
      executablePath: chromePath,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Chrome launch timeout")), browserLaunchTimeoutMs)),
  ]);

  let success = 0;
  let failure = 0;
  for (const route of SEO_ROUTES) {
    const t0 = Date.now();
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent("Mozilla/5.0 (compatible; ShirtlessSSG/1.0)");
      await page.goto(`${ORIGIN}${route.path}`, { waitUntil: "networkidle0", timeout: 25000 }).catch(async () => {
        // Fallback for routes with background polling
        await page.goto(`${ORIGIN}${route.path}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      });
      await new Promise((r) => setTimeout(r, 1200));
      await page.evaluate(() => {
        document.querySelectorAll('[data-testid="generating-loader"]').forEach((el) => el.remove());
      });
      let html = await page.content();
      await page.close();
      // Reinforce critical head tags with route's authoritative values
      html = rewriteShell(html, route);
      const out = writeRouteFile(route, html);
      const ms = Date.now() - t0;
      console.log(`[prerender]   ✓ ${route.path.padEnd(45)} -> ${out} · ${ms} ms`);
      success++;
    } catch (e) {
      console.warn(`[prerender]   ✗ ${route.path}: ${e.message} (falling back to meta-only for this route)`);
      // Fall back per-route so one broken route doesn't kill the rest
      const shell = fs.readFileSync(SHELL_PATH, "utf8");
      writeRouteFile(route, rewriteShell(shell, route));
      failure++;
    }
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log(`[prerender] SSG MODE done. ${success} snapshots, ${failure} fallbacks.`);
}

async function main() {
  if (process.env.SKIP_PRERENDER === "1") {
    console.log("[prerender] SKIP_PRERENDER=1 — skipping. The SPA will serve as-is.");
    return;
  }

  if (!fs.existsSync(SHELL_PATH)) {
    console.error(`[prerender] ERROR: build/index.html not found. Did 'craco build' run first?`);
    process.exit(1);
  }

  const chromePath = findChrome();

  // No Chrome → meta mode (always safe, never hangs).
  if (!chromePath) {
    console.log("[prerender] Chrome not found in build environment — using META MODE.");
    await runMetaMode();
    return;
  }

  // Try SSG. If anything in the pipeline blows up (puppeteer missing, launch
  // hangs, network refuses), catch the error and fall back to meta mode.
  try {
    await runSsgMode(chromePath);
  } catch (e) {
    console.warn(`[prerender] SSG mode failed (${e.message}). Falling back to META MODE.`);
    try {
      await runMetaMode();
    } catch (metaErr) {
      console.error(`[prerender] Meta fallback also failed: ${metaErr.message}`);
      // Don't fail the deploy — the homepage shell is still served as-is.
      process.exit(0);
    }
  }
}

// Global safety net: never let prerender hang the deploy longer than 5 minutes.
const HARD_TIMEOUT_MS = 5 * 60 * 1000;
const hardTimer = setTimeout(() => {
  console.error(`[prerender] HARD TIMEOUT after ${HARD_TIMEOUT_MS / 1000}s — aborting and accepting current state.`);
  process.exit(0);
}, HARD_TIMEOUT_MS);
hardTimer.unref();

main()
  .catch((e) => {
    console.warn(`[prerender] Unhandled error: ${e.message} — deploy will continue with whatever was written.`);
    process.exit(0);
  })
  .finally(() => clearTimeout(hardTimer));
