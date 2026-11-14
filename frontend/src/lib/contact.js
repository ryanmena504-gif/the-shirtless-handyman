/**
 * Single source of truth for how visitors reach Ryan.
 * Change a number, email, hours, or the offer here and every CTA follows.
 */
export const PHONE_DISPLAY = "504-264-4919";
export const PHONE_E164 = "+15042644919";
export const TEL_LINK = "tel:+15042644919";
export const EMAIL = "ryan@theshirtlesshandyman.com";
export const HOURS_LABEL = "Mon–Sat, 9am–5pm";
export const SERVICE_AREA_LABEL = "New Orleans metro + the Northshore";

export const HEATED_FLOORS_OFFER_SHORT = "Free heated floors with any full bathroom or whole-floor coating";
export const HEATED_FLOORS_OFFER_LONG =
  "Book a whole-bathroom renovation or a whole-floor coating and I buy and install the underfloor heating system for free.";

/** Build an sms: link with a prefilled message (works on iOS + Android). */
export const smsLink = (body = "Hey Ryan, I'm interested in a seamless surface project.") =>
  `sms:+15042644919?&body=${encodeURIComponent(body)}`;

export const mailtoLink = (subject, body) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Project types shown in the quick quote form (value is sent as project_type). */
export const PROJECT_TYPES = [
  "Seamless shower",
  "Full bathroom transformation",
  "Floor coating",
  "Venetian plaster / walls",
  "Countertops / vanity",
  "Something else",
];

/**
 * Scroll to the nearest quote form on the current page. Returns false if the
 * page has none (callers then navigate to "/#quote").
 */
export const scrollToQuoteForm = () => {
  if (typeof document === "undefined") return false;
  const el = document.getElementById("quote") || document.querySelector("[data-quote-form]");
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => el.querySelector("input")?.focus({ preventScroll: true }), 450);
  return true;
};
