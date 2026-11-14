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

/**
 * Pricing copy. Ryan prices every job per project after a free site visit;
 * most projects land between $3k and $10k. "Starting around" numbers stay
 * inside that range on purpose. Change them here and the homepage follows.
 */
export const PRICING_HEADLINE = "Most projects land between $3,000 and $10,000.";
export const PRICING_SUBHEAD = "Every job is quoted per project after a free site visit, so you know the number before anything starts.";
export const PRICE_SHOWER = "Starting around $3,000";
export const PRICE_FULL_BATH = "Starting around $6,000";
export const PRICE_FULL_BATH_RANGE = "Most full bathrooms land between $6,000 and $10,000.";
export const PRICE_WALLS = "Starting around $3,000";
export const PRICING_SUMMARY =
  "Most of my projects land between $3,000 and $10,000, and every job is quoted per project after a free site visit. Seamless showers start around $3,000. Full seamless bathrooms (walls, floor, and shower in one continuous shell) start around $6,000 and include free underfloor heating — I buy the system and install it at no charge. Venetian plaster and feature walls start around $3,000. The final number depends on the condition of what's there, the size, waterproofing, plumbing, fixtures, and finish.";

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
