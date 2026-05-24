// Lightweight conversion-tracking helper. Safely no-ops when GA4/Meta Pixel aren't loaded.
//
// Public API:
//   trackEvent(name, params)   — fires the event to GA4, Meta Pixel, Klaviyo (when applicable).
//   identifyLead({email, phone, name, zip_code, ...}) — tells Klaviyo who this visitor is so
//   they can be entered into a nurture flow inside Klaviyo's UI.

const FB_EVENT_MAP = {
  lead_submitted: "Lead",
  quick_lead_submitted: "Lead",
  upload_started: "InitiateCheckout",
  design_generated: "ViewContent",
  quote_requested: "Lead",
};

export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
    if (typeof window.fbq === "function") {
      const fbEvent = FB_EVENT_MAP[eventName];
      if (fbEvent) {
        window.fbq("track", fbEvent, params);
      } else {
        window.fbq("trackCustom", eventName, params);
      }
    }
    if (window.klaviyo && typeof window.klaviyo.push === "function") {
      // Klaviyo's onsite SDK signature: ['track', eventName, props]
      window.klaviyo.push(["track", eventName, params]);
    }
  } catch {
    // Tracking should never break the app.
  }
}

export function identifyLead(lead = {}) {
  try {
    if (typeof window === "undefined") return;
    const props = {
      ...(lead.email ? { $email: lead.email } : {}),
      ...(lead.phone ? { $phone_number: lead.phone } : {}),
      ...(lead.name ? { $first_name: String(lead.name).split(" ")[0] } : {}),
      ...(lead.name && lead.name.split(" ").length > 1
        ? { $last_name: lead.name.split(" ").slice(1).join(" ") }
        : {}),
      ...(lead.zip_code ? { $zip: lead.zip_code } : {}),
      ...(lead.project_type ? { project_type: lead.project_type } : {}),
      source: lead.source || "site",
    };
    if (window.klaviyo && typeof window.klaviyo.push === "function") {
      window.klaviyo.push(["identify", props]);
    }
    if (typeof window.gtag === "function" && lead.email) {
      window.gtag("set", "user_properties", { source: lead.source || "site" });
    }
  } catch {
    // Identification should never break the app.
  }
}
