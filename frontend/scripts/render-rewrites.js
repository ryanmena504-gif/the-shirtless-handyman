/**
 * Prints the Render static-site rewrite rules the site needs.
 *
 * Why: Render serves build/shop/index.html for "/shop/" (trailing slash),
 * but "/shop" (no slash) is not a file, so it falls through to the SPA
 * catch-all "/*  ->  /index.html" and gets the HOMEPAGE head tags. Social
 * crawlers don't run JS, so a shared "/shop" link previews as the homepage.
 *
 * The fix is one explicit Rewrite per prerendered route, placed ABOVE the
 * catch-all in Render → the-shirtless-handyman → Redirects/Rewrites:
 *
 *   Source: /shop    Destination: /shop/index.html    Action: Rewrite
 *
 * Render applies the first matching rule from the top, so these must sit
 * above "/*". Rules are skipped when a real file exists at the path, so
 * "/shop/" keeps serving the directory index as it does today.
 *
 * Usage:  node scripts/render-rewrites.js          (table for the dashboard)
 *         node scripts/render-rewrites.js --json   (machine-readable)
 * Re-run it whenever a route is added to seo-routes.js and add the new rule.
 */
const { SEO_ROUTES } = require("./seo-routes");

function rewriteRules() {
  const rules = SEO_ROUTES.filter((r) => r.path !== "/").map((r) => ({
    type: "rewrite",
    source: r.path,
    destination: `${r.path}/index.html`,
  }));
  // SPA catch-all stays last.
  rules.push({ type: "rewrite", source: "/*", destination: "/index.html" });
  return rules;
}

module.exports = { rewriteRules };

if (require.main === module) {
  const rules = rewriteRules();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(rules, null, 2));
  } else {
    rules.forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. Rewrite  ${r.source.padEnd(50)} -> ${r.destination}`));
  }
}
