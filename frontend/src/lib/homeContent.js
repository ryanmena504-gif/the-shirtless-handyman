/**
 * Homepage content Ryan can edit without touching layout code.
 *
 * PROOF SECTION ("Real jobs" on the homepage)
 * ------------------------------------------
 * The section stays HIDDEN until at least one slot below is completely
 * filled in. Half-filled slots are ignored, so it's safe to fill them one
 * at a time.
 *
 * Rules: only real customers' own words (with their OK), and only photos of
 * YOUR jobs. Never made-up reviews, ratings, or stock photos.
 */

// ---- Customer quotes -------------------------------------------------------
// Fill in quote + name to publish a slot (area is optional but helps). Example:
//   { quote: "Their exact words, copied from the text or review.", name: "Dana R.", area: "Lakeview" },
const TESTIMONIAL_SLOTS = [
  { quote: "", name: "", area: "" }, // slot 1
  { quote: "", name: "", area: "" }, // slot 2
  { quote: "", name: "", area: "" }, // slot 3
];

// ---- Before / after photos ---------------------------------------------------
// 1. Put both photos in frontend/public/portfolio/ (jpg or webp, about 1200px wide).
// 2. Type their paths and a short caption below. Example of a filled slot:
//   { before: "/portfolio/metairie-shower-before.jpg", after: "/portfolio/metairie-shower-after.jpg",
//     caption: "Metairie · 1960s tile shower → seamless microcement, over the existing tile, 4 days" },
const BEFORE_AFTER_SLOTS = [
  { before: "", after: "", caption: "" }, // slot 1
  { before: "", after: "", caption: "" }, // slot 2
  { before: "", after: "", caption: "" }, // slot 3
];

const filled = (obj, keys) => keys.every((k) => typeof obj[k] === "string" && obj[k].trim() !== "");

export const TESTIMONIALS = TESTIMONIAL_SLOTS.filter((t) => filled(t, ["quote", "name"]));
export const BEFORE_AFTER = BEFORE_AFTER_SLOTS.filter((p) => filled(p, ["before", "after", "caption"]));

export const SERVICE_LINKS = [
  { label: "Seamless microcement showers", href: "/microcement-showers-new-orleans" },
  { label: "Full bathroom transformations", href: "/bathroom-remodel-new-orleans" },
  { label: "Venetian plaster", href: "/venetian-plaster-new-orleans" },
  { label: "Microcement countertops", href: "/microcement-countertops-new-orleans" },
  { label: "Tadelakt", href: "/tadelakt-new-orleans" },
  { label: "Microcement in Metairie", href: "/microcement-metairie" },
];

// Plain-English version of the wet-area build. Ryan: adjust wording to match
// exactly how you build yours (product names, membrane type, etc.).
export const WATERPROOF_STEPS = [
  { title: "Inspect what's really there", body: "I check the existing tile, backer, slope, and drain, and look for soft spots or hidden water damage before quoting." },
  { title: "Fix the problems, don't cover them", body: "Loose tile, rot, or a failed pan gets repaired or rebuilt. Microcement only goes over a solid, stable base." },
  { title: "Prime and reinforce", body: "The surface is cleaned, primed, and reinforced so the new layers bond tightly and move with the house." },
  { title: "Waterproof the wet zone", body: "A waterproofing layer goes through the shower — corners, niche, bench, and drain detailed so water has nowhere to go." },
  { title: "Hand-trowel the microcement", body: "Base and finish coats are troweled on by hand into one continuous surface: no grout, no seams." },
  { title: "Seal it and show you how to care for it", body: "Protective sealer coats finish the job. At handoff I explain cleaning and upkeep so it stays looking new." },
];

// Homepage FAQ — also published as FAQPage schema. Keep answers truthful.
export const HOME_FAQ = [
  {
    q: "What is microcement, exactly?",
    a: "A thin, cement-based coating hand-troweled in layers and sealed. It covers showers, floors, walls, and counters as one continuous surface — the look of polished concrete or stone with no tiles and no grout lines.",
  },
  {
    q: "Will mold grow on it?",
    a: "Mold in tile showers lives mostly in grout lines and failing caulk. A sealed microcement shower has no grout lines, so there's no grout for mold to grow in. Like any shower it still needs normal cleaning and ventilation.",
  },
  {
    q: "Is it really waterproof?",
    a: "The waterproofing comes from the system underneath and the sealer on top — not from the decorative layer alone. I build the wet zone with a dedicated waterproofing layer and detail the corners, niche, and drain, then seal it. I explain each layer for your bathroom before you sign.",
  },
  {
    q: "Can it go over my existing tile?",
    a: "Often, yes — once I've inspected it and confirmed it's solid. If the tile or what's behind it is failing, I'll show you and we'll fix that properly instead of covering a problem.",
  },
  {
    q: "What does it cost?",
    a: "Every job is priced individually after a free site visit, because the condition of what's there changes the work. You'll get a written quote with the scope spelled out before you commit to anything.",
  },
  {
    q: "Do I really get free heated floors?",
    a: "Yes. Book a whole-bathroom renovation or a whole-floor coating and I buy and install the underfloor heating system at no charge.",
  },
  {
    q: "Where do you work?",
    a: "The New Orleans metro — including Metairie, Kenner, Harahan, the Westbank, and St. Bernard — plus the Northshore: Mandeville, Covington, Madisonville, and Slidell.",
  },
  {
    q: "How does it work from first call to finished?",
    a: "Call, text, or send the form. I come out for a site visit, you get a written quote, and a deposit locks in your dates. I do the work myself, start to finish.",
  },
];
