/**
 * Post-build SEO pre-render script.
 *
 * After `craco build`, this:
 *   1. Reads build/index.html (the SPA shell)
 *   2. For every route in scripts/seo-routes.js, writes a copy at:
 *        build/<route>/index.html
 *      with the route's <title>, <meta description>, canonical, OG, Twitter tags
 *      injected into the static markup.
 *
 * Why this works for SEO:
 *   - Google's crawler will execute JS and let Helmet take over, but it heavily
 *     trusts the initial HTML's <title> and <meta description>. We inject those.
 *   - Facebook / Twitter / LinkedIn / Slack / iMessage / WhatsApp crawlers DO NOT
 *     execute JS. They read OG/Twitter tags from the initial HTML only.
 *     Without this script, every social share of every URL showed the homepage
 *     preview. With it, each route gets its own rich preview.
 *
 * Static hosts (Vercel/Netlify/Cloudflare Pages/S3+CloudFront) automatically
 * serve /foo/index.html when a user hits /foo, so no extra config required.
 */

const fs = require("fs");
const path = require("path");
const { SEO_ROUTES, SITE } = require("./seo-routes");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SHELL_PATH = path.join(BUILD_DIR, "index.html");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Replace the homepage <title>, <meta name="description">, canonical and OG/Twitter
 * tags in the shell HTML with the route-specific values.
 */
function rewriteShell(shell, route) {
  const canonical = `${SITE}${route.path === "/" ? "" : route.path}`;
  const ogType = route.ogType || "website";
  const titleAttr = escapeText(route.title);
  const descAttr = escapeAttr(route.description);
  const ogImage = escapeAttr(route.ogImage);
  const canonicalEsc = escapeAttr(canonical);
  const ogTypeEsc = escapeAttr(ogType);

  let html = shell;

  // <title>
  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${titleAttr}</title>`,
  );

  // <meta name="description">
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${descAttr}" />`,
  );

  // <link rel="canonical">
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonicalEsc}" data-rh-default="true" />`,
    );
  } else {
    html = html.replace(
      "</head>",
      `    <link rel="canonical" href="${canonicalEsc}" data-rh-default="true" />\n    </head>`,
    );
  }

  // Open Graph
  const ogReplacements = [
    [/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${ogTypeEsc}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalEsc}" />`],
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${titleAttr}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${descAttr}" />`],
    [/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${ogImage}" />`],
    [/<meta\s+property=["']og:image:secure_url["'][^>]*>/i, `<meta property="og:image:secure_url" content="${ogImage}" />`],
  ];
  for (const [re, str] of ogReplacements) {
    if (re.test(html)) html = html.replace(re, str);
  }

  // Twitter
  const twReplacements = [
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${titleAttr}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${descAttr}" />`],
    [/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${ogImage}" />`],
  ];
  for (const [re, str] of twReplacements) {
    if (re.test(html)) html = html.replace(re, str);
  }

  return html;
}

function writeRouteFile(route, shell) {
  if (route.path === "/") {
    // Homepage: just rewrite the shell in place so the deployed root has correct meta.
    const out = rewriteShell(shell, route);
    fs.writeFileSync(SHELL_PATH, out, "utf8");
    return SHELL_PATH;
  }
  const dir = path.join(BUILD_DIR, route.path.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  const out = rewriteShell(shell, route);
  const outPath = path.join(dir, "index.html");
  fs.writeFileSync(outPath, out, "utf8");
  return outPath;
}

function main() {
  if (!fs.existsSync(SHELL_PATH)) {
    console.error(`[prerender-seo] ERROR: ${SHELL_PATH} not found. Did 'craco build' run first?`);
    process.exit(1);
  }
  const shell = fs.readFileSync(SHELL_PATH, "utf8");
  console.log(`[prerender-seo] Pre-rendering ${SEO_ROUTES.length} routes…`);
  let count = 0;
  for (const route of SEO_ROUTES) {
    const outPath = writeRouteFile(route, shell);
    console.log(`[prerender-seo]   ${route.path.padEnd(50)} -> ${path.relative(BUILD_DIR, outPath)}`);
    count++;
  }
  console.log(`[prerender-seo] Done. Wrote ${count} pre-rendered HTML files.`);
}

main();
