/**
 * Prints the Render static-site rewrite rules the site needs.
 *
 * Why: Render serves build/shop/index.html for "/shop/" (trailing slash),
 * but "/shop" (no slash) is not a file, so it falls through to the SPA
 * catch-all "/*  ->  /index.html" and gets the HOMEPAGE head tags. Social
 * crawlers don't run JS, so a shared "/shop" link previews as the homepage.
 *
 * The fix is one explicit Rewrite per prerendered route in
 * Render → the-shirtless-handyman → Redirects/Rewrites.
 *
 *   Source: /shop    Destination: /shop/index.html    Action: Rewrite
 *
 * Rules are skipped when a real file exists at the path, so "/shop/" keeps
 * serving the directory index. Do not add a "/*" -> "/index.html" catch-all:
 * unknown paths must miss every rule so Render returns 404.html with status 404.
 *
 * Usage:  node scripts/render-rewrites.js          (table for the dashboard)
 *         node scripts/render-rewrites.js --json   (machine-readable)
 * Re-run it whenever a route is added to seo-routes.js and add the new rule.
 */
const { SEO_ROUTES } = require("./seo-routes");

// Real app routes that are not prerendered files. They rewrite to the SPA
// shell. Everything else must 404 (public/404.html) — do not add "/*".
const SPA_FALLBACKS = [
  "/contractors",
  "/admin",
  "/admin/*",
  "/contractor/*",
  "/share/*",
  "/analysis/*",
  "/results/*",
];

function headerRules() {
  return [
    {
      path: "/static/*",
      name: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    },
  ];
}

function rewriteRules() {
  const rules = SEO_ROUTES.filter((r) => r.path !== "/").map((r) => ({
    type: "rewrite",
    source: r.path,
    destination: `${r.path}/index.html`,
  }));
  rules.push({ type: "redirect", source: "/work", destination: "/portfolio" });
  for (const source of SPA_FALLBACKS) {
    rules.push({ type: "rewrite", source, destination: "/index.html" });
  }
  return rules;
}

module.exports = { rewriteRules, headerRules };

if (require.main === module) {
  const rules = rewriteRules();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ routes: rules, headers: headerRules() }, null, 2));
  } else {
    rules.forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. ${r.type === "redirect" ? "Redirect" : "Rewrite "}  ${r.source.padEnd(50)} -> ${r.destination}`));
    console.log("\nHeaders (Render → Headers):");
    headerRules().forEach((h) => console.log(`    ${h.path}  ${h.name}: ${h.value}`));
    console.log("\nDo NOT add /* -> /index.html. Unknown paths must fall through to 404.html.");
  }
}
