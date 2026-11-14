/**
 * One place that decides where the website's API lives.
 *
 * Set REACT_APP_BACKEND_URL on the Render static site (no trailing slash,
 * no /api) to override. The default is Ryan's own Render web service.
 * The old Emergent preview server (design-reveal.preview.emergentagent.com)
 * is gone and returns 404 — do not point back at it.
 */
export const DEFAULT_BACKEND_URL = "https://theshirtlesshandyman-api.onrender.com";

export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");

export const API = `${BACKEND_URL}/api`;

/**
 * Wake the API up. A free Render instance sleeps after ~15 idle minutes and
 * takes up to a minute to start, so the site pings /api/health on page load.
 * By the time a visitor fills out a form, the server is awake. Fire-and-forget.
 */
let warmed = false;
export function warmUpApi() {
  if (warmed || typeof fetch === "undefined") return;
  warmed = true;
  try {
    fetch(`${API}/health`, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
  } catch (_) {
    /* ignore */
  }
}
