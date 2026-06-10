/**
 * Postbuild SSG injector — runs INSIDE Emergent Cloud Build (no Chrome required).
 *
 * Reads pre-captured body fragments from `public/_prerendered/*.json`
 * (committed to the repo) and merges them into the freshly built
 * `build/index.html` shell — which has the CURRENT build's hashed bundle paths.
 *
 * Pipeline:
 *   1. `craco build` produces `build/index.html` with hashed JS/CSS refs.
 *   2. This script reads each `_prerendered/<slug>.json`, takes the body
 *      fragment, swaps it inside `<div id="root">…</div>` of the build shell,
 *      rewrites <title> / <meta description> / canonical / OG / Twitter to the
 *      route's authoritative values, and inserts the route's JSON-LD blocks.
 *   3. Writes `build/<route>/index.html` for every snapshot.
 *
 * Why this never breaks production:
 *   - Bundle paths come from the live build's shell — they always match.
 *   - Body fragment is plain HTML, build-agnostic.
 *   - React's createRoot cleanly replaces the prerendered content on mount.
 *
 * The script also strips itself / fails open if no fragments exist — the SPA
 * still ships fine, just without the SSG bonus.
 */

const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SHELL_PATH = path.join(BUILD_DIR, "index.html");
const FRAGMENTS_DIR = path.join(BUILD_DIR, "_prerendered");

function escapeAttr(v) {
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Swap the empty <div id="root"></div> in the shell with one containing the
 * route's prerendered body fragment.
 */
function injectRootContent(shell, fragment) {
  // Use a non-greedy match. CRA emits <div id="root"></div>; we tolerate
  // whitespace and either single or double quotes.
  const re = /<div\s+id=["']root["']\s*>[\s\S]*?<\/div>/i;
  if (!re.test(shell)) {
    return shell; // shell doesn't have the expected root — bail out
  }
  return shell.replace(re, `<div id="root">${fragment}</div>`);
}

/**
 * Replace per-route head tags. Helmet will take over after hydration; this is
 * for the first byte that crawlers (including JS-less social ones) see.
 */
function rewriteHead(shell, payload) {
  let out = shell;
  const canonical = payload.canonical;
  const ogType = payload.ogType || "website";

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(payload.title)}</title>`);
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeAttr(payload.description)}" />`,
  );

  const tags = [
    ['<link\\s+rel=["\']canonical["\'][^>]*>', `<link rel="canonical" href="${escapeAttr(canonical)}" />`],
    ['<meta\\s+property=["\']og:type["\'][^>]*>', `<meta property="og:type" content="${escapeAttr(ogType)}" />`],
    ['<meta\\s+property=["\']og:url["\'][^>]*>', `<meta property="og:url" content="${escapeAttr(canonical)}" />`],
    ['<meta\\s+property=["\']og:title["\'][^>]*>', `<meta property="og:title" content="${escapeAttr(payload.title)}" />`],
    ['<meta\\s+property=["\']og:description["\'][^>]*>', `<meta property="og:description" content="${escapeAttr(payload.description)}" />`],
    ['<meta\\s+property=["\']og:image["\'][^>]*>', `<meta property="og:image" content="${escapeAttr(payload.ogImage)}" />`],
    ['<meta\\s+name=["\']twitter:title["\'][^>]*>', `<meta name="twitter:title" content="${escapeAttr(payload.title)}" />`],
    ['<meta\\s+name=["\']twitter:description["\'][^>]*>', `<meta name="twitter:description" content="${escapeAttr(payload.description)}" />`],
    ['<meta\\s+name=["\']twitter:image["\'][^>]*>', `<meta name="twitter:image" content="${escapeAttr(payload.ogImage)}" />`],
  ];
  for (const [pattern, tag] of tags) {
    const re = new RegExp(pattern, "i");
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n  </head>`);
  }

  // Insert JSON-LD blocks just before </head> (Helmet will re-render duplicates
  // after hydration; harmless — Google reads the first set fine).
  if (payload.jsonLd && payload.jsonLd.length > 0) {
    const blocks = payload.jsonLd.map((j) => `<script type="application/ld+json">${j}</script>`).join("\n    ");
    out = out.replace("</head>", `    ${blocks}\n  </head>`);
  }

  out = out.replace("</head>", `    <meta name="x-prerendered" content="${new Date().toISOString()}" />\n  </head>`);
  return out;
}

function writeRouteFile(routePath, html) {
  if (routePath === "/") {
    fs.writeFileSync(SHELL_PATH, html, "utf8");
    return "index.html";
  }
  const dir = path.join(BUILD_DIR, routePath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "index.html");
  fs.writeFileSync(out, html, "utf8");
  return path.relative(BUILD_DIR, out);
}

function main() {
  if (!fs.existsSync(SHELL_PATH)) {
    console.warn("[inject-prerendered] build/index.html not found — skipping.");
    return;
  }
  // CRA copies public/* into build/* during build, so _prerendered/ is now at build/_prerendered/
  if (!fs.existsSync(FRAGMENTS_DIR)) {
    console.warn(`[inject-prerendered] No fragments dir at ${FRAGMENTS_DIR} — skipping (SPA-only ship).`);
    return;
  }

  const shell = fs.readFileSync(SHELL_PATH, "utf8");
  const files = fs.readdirSync(FRAGMENTS_DIR).filter((f) => f.endsWith(".json") && f !== "_index.json");

  console.log(`[inject-prerendered] Injecting ${files.length} fragments into the build shell`);
  let count = 0;
  for (const file of files) {
    try {
      const payload = JSON.parse(fs.readFileSync(path.join(FRAGMENTS_DIR, file), "utf8"));
      if (!payload.fragment || !payload.path) {
        console.warn(`  ! ${file}: missing fragment or path, skipping`);
        continue;
      }
      let html = injectRootContent(shell, payload.fragment);
      html = rewriteHead(html, payload);
      const out = writeRouteFile(payload.path, html);
      console.log(`  ✓ ${payload.path.padEnd(48)} -> ${out}`);
      count++;
    } catch (e) {
      console.warn(`  ✗ ${file}: ${e.message}`);
    }
  }
  console.log(`[inject-prerendered] Done. ${count} per-route HTML files written.`);

  // Clean up: remove the _prerendered directory from the deployed build to keep it small
  try {
    fs.rmSync(FRAGMENTS_DIR, { recursive: true, force: true });
  } catch {
    /* not fatal */
  }
}

try {
  main();
} catch (e) {
  console.warn(`[inject-prerendered] Failed (non-fatal): ${e.message}`);
  // Never block the deploy. SPA still ships.
  process.exit(0);
}
