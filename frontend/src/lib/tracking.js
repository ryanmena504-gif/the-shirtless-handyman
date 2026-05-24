// Lightweight conversion-tracking helper. Safely no-ops when GA4/Meta Pixel aren't loaded.
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
    if (typeof window.fbq === "function") {
      // Map common events to FB standard equivalents where it makes sense.
      const fbMap = {
        lead_submitted: "Lead",
        quick_lead_submitted: "Lead",
        upload_started: "InitiateCheckout",
        design_generated: "ViewContent",
        quote_requested: "Lead",
      };
      const fbEvent = fbMap[eventName];
      if (fbEvent) {
        window.fbq("track", fbEvent, params);
      } else {
        window.fbq("trackCustom", eventName, params);
      }
    }
    if (window.klaviyo && typeof window.klaviyo.push === "function" && eventName.startsWith("lead")) {
      window.klaviyo.push(["track", eventName, params]);
    }
  } catch {
    // Tracking should never break the app.
  }
}
