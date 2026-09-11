// QR visit tracking — if a visitor lands with utm_source=qr, remember it
// for this session and tag any lead they submit with a `_qr` suffix so
// Ryan can see in Airtable which leads came from a scanned QR code.

const QR_KEY = "tsh_qr_visit";

export function trackVisit() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source") === "qr") {
      const campaign = params.get("utm_campaign") || "generic";
      sessionStorage.setItem(QR_KEY, campaign);
    }
  } catch {
    // sessionStorage may be blocked in some browsers — silently no-op
  }
}

export function tagLeadSource(baseSource) {
  if (typeof window === "undefined") return baseSource;
  try {
    if (sessionStorage.getItem(QR_KEY)) {
      return baseSource.endsWith("_qr") ? baseSource : `${baseSource}_qr`;
    }
  } catch {
    // ignore
  }
  return baseSource;
}
