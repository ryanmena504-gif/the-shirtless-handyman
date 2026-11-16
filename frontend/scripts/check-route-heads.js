/**
 * Checks that every prerendered route serves its OWN <title> and og:image,
 * both with and without a trailing slash, the way a JS-less link-preview
 * crawler sees it.
 *
 * Usage:
 *   node scripts/check-route-heads.js                       # live site
 *   BASE_URL=http://localhost:4478 node scripts/check-route-heads.js
 * Exits 1 if any route serves the wrong head.
 */
const { SEO_ROUTES, SITE } = require("./seo-routes");

const BASE = (process.env.BASE_URL || SITE).replace(/\/$/, "");

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

async function head(url) {
  const res = await fetch(url, { headers: { "User-Agent": "facebookexternalhit/1.1" }, redirect: "follow" });
  const html = await res.text();
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const og = decode((html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i) || [])[1] || "");
  return { status: res.status, title, og };
}

(async () => {
  let bad = 0;
  for (const route of SEO_ROUTES) {
    if (route.path === "/") continue;
    for (const suffix of ["", "/"]) {
      const url = `${BASE}${route.path}${suffix}`;
      const got = await head(url);
      const ok = got.status === 200 && got.title === route.title && got.og === route.ogImage;
      if (!ok) bad++;
      console.log(`${ok ? "OK  " : "FAIL"} ${String(got.status).padEnd(4)} ${(route.path + suffix).padEnd(52)} ${ok ? "" : `title="${got.title.slice(0, 50)}"`}`);
    }
  }
  console.log(bad ? `\n${bad} URL(s) serve the wrong head.` : "\nAll routes serve their own head, with and without the slash.");
  process.exit(bad ? 1 : 0);
})();
