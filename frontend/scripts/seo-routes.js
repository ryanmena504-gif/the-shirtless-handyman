/**
 * Per-route SEO config for static pre-rendering.
 *
 * After `craco build`, scripts/prerender-seo.js reads this map and writes a
 * route-specific index.html for each path (e.g. build/microcement-new-orleans/index.html).
 * Each file has the route's <title>, <meta description>, canonical, OG/Twitter
 * tags injected into the static HTML so that:
 *   1. Search engines see route-specific meta in the initial HTML (no JS execution needed).
 *   2. Social crawlers (Facebook, Twitter, LinkedIn, Slack, iMessage) get rich previews.
 *
 * The React app still hydrates and Helmet still owns runtime meta updates.
 * This is purely about the *first byte* seen by non-JS crawlers.
 */

const SITE = "https://theshirtlesshandyman.com";
const DEFAULT_OG = "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1200&h=630&fit=crop&fm=jpg&q=85";

const SEO_ROUTES = [
  {
    path: "/",
    title: "The Shirtless Handyman | Microcement, Tadelakt & Seamless Surfaces in New Orleans",
    description: "I'm Ryan Mena. I install microcement, tadelakt, and custom rockscape walls in New Orleans homes — no demolition, no grout, no tile. Free design preview. Text: 504-264-4919.",
    ogImage: `${SITE}/portfolio/shower-led-niche.jpg`,
  },
  {
    path: "/about",
    title: "About Ryan Mena | The Shirtless Handyman — New Orleans Microcement Specialist",
    description: "Meet Ryan Mena — New Orleans-born craftsman behind The Shirtless Handyman. I used to install tile. Now I install microcement, tadelakt, and rockscape walls.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/upload",
    title: "The Seamless Studio | Preview Your Renovation Free — The Shirtless Handyman",
    description: "Upload a photo of any room and instantly preview it in microcement, tadelakt, or rockscape. Free 60-second AI preview. Serving Greater New Orleans.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/portfolio",
    title: "Portfolio | Microcement, Tadelakt & Rockscape Projects — New Orleans",
    description: "Real before-and-after photos from our microcement bathrooms, tadelakt showers, and rockscape feature walls across Greater New Orleans.",
    ogImage: DEFAULT_OG,
  },
  // -------- Local-service landing pages --------
  {
    path: "/microcement-new-orleans",
    title: "Microcement New Orleans | Seamless Bathroom & Floor Installation — The Shirtless Handyman",
    description: "Microcement specialist in New Orleans. Seamless, waterproof, zero-grout shower & floor installation across Metairie, Gretna, Lakeview & the Westbank. Free design preview in 60 seconds. Text Ryan: 504-264-4919.",
    ogImage: `${SITE}/portfolio/shower-led-niche.jpg`,
  },
  {
    path: "/microcement-metairie",
    title: "Microcement Metairie LA | Seamless Bathroom & Shower Installation",
    description: "Microcement installation in Metairie, LA. Seamless, zero-grout showers, bathroom walls, and floors — installed over your existing tile. Text Ryan: 504-264-4919.",
    ogImage: `${SITE}/portfolio/shower-led-niche.jpg`,
  },
  {
    path: "/tadelakt-new-orleans",
    title: "Tadelakt New Orleans | Hand-Burnished Moroccan Lime Plaster Showers",
    description: "Authentic tadelakt installation in New Orleans. Hand-burnished Moroccan lime plaster for showers, tub surrounds, and feature walls. Naturally waterproof. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/rockscape-walls-new-orleans",
    title: "Rockscape Feature Walls New Orleans | Sculpted Stone-Look Accent Walls",
    description: "Custom rockscape walls in New Orleans — sculpted feature walls with microaggregate stone finish and optional LED backlighting. One-of-a-kind statement pieces. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/pool-deck-resurfacing-new-orleans",
    title: "Pool Deck Resurfacing New Orleans | Microterrazzo & Cocciopesto",
    description: "Pool deck and patio resurfacing in New Orleans using microterrazzo and cocciopesto. UV-stable, slip-resistant, built for NOLA sun. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  // -------- Blog --------
  {
    path: "/blog",
    title: "The Shirtless Handyman Journal | Microcement, Tadelakt & Renovation Guides for New Orleans",
    description: "Practical guides on seamless surfaces, microcement, tadelakt, and renovation cost in New Orleans — written by Ryan Mena.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/blog/microcement-vs-tile-cost-new-orleans",
    title: "Microcement vs. Tile Cost in New Orleans — True 10-Year Breakdown",
    description: "We break down the real cost of a microcement bathroom vs. a tile renovation in New Orleans — labor, materials, timeline, and 10-year maintenance.",
    ogImage: "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1200&h=630&fit=crop&fm=jpg&q=85",
    ogType: "article",
  },
  {
    path: "/blog/best-microcement-contractor-new-orleans",
    title: "How to Pick the Best Microcement Contractor in New Orleans",
    description: "A 6-point checklist for choosing a microcement contractor in New Orleans — what to ask, what to see, and what red flags to walk away from.",
    ogImage: DEFAULT_OG,
    ogType: "article",
  },
  {
    path: "/blog/tadelakt-vs-microcement-bathroom",
    title: "Tadelakt vs. Microcement for a New Orleans Bathroom",
    description: "Tadelakt or microcement for your NOLA shower? Real differences in cost, durability, look, and which one is right for your renovation.",
    ogImage: DEFAULT_OG,
    ogType: "article",
  },
  {
    path: "/blog/why-tile-fails-in-new-orleans-humidity",
    title: "Why Tile Fails in New Orleans Humidity (And What to Install Instead)",
    description: "Black grout. Peeling caulk. Mold. Here's why tile keeps failing in NOLA bathrooms — and the seamless surface that lasts decades.",
    ogImage: DEFAULT_OG,
    ogType: "article",
  },
  // -------- Neighborhood handyman micro-pages --------
  {
    path: "/lakeview-handyman",
    title: "Lakeview Handyman & Microcement Specialist | The Shirtless Handyman",
    description: "Lakeview, New Orleans handyman and microcement specialist. Drywall, fixture installs, painting, plus seamless microcement bathrooms and tadelakt showers. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/uptown-handyman",
    title: "Uptown New Orleans Handyman & Microcement Specialist | The Shirtless Handyman",
    description: "Uptown New Orleans handyman and seamless-surface specialist. Drywall, fixtures, painting, microcement bathrooms, tadelakt showers, rockscape walls. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/mid-city-handyman",
    title: "Mid-City New Orleans Handyman & Microcement | The Shirtless Handyman",
    description: "Mid-City New Orleans handyman and microcement specialist. Renovations on raised cottages, doubles, and shotguns. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/bywater-handyman",
    title: "Bywater Handyman & Microcement Specialist | The Shirtless Handyman",
    description: "Bywater New Orleans handyman and microcement specialist. Renovations on shotguns and doubles. Microcement bathrooms, tadelakt showers, rockscape walls. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/french-quarter-handyman",
    title: "French Quarter Handyman & Microcement Specialist | The Shirtless Handyman",
    description: "French Quarter New Orleans handyman and seamless-surface specialist. Microcement bathrooms, tadelakt, plaster repair, fixture installs in historic Quarter properties. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/garden-district-handyman",
    title: "Garden District Handyman & Microcement Specialist | The Shirtless Handyman",
    description: "Garden District New Orleans handyman and seamless-surface specialist. Historic mansions, microcement bathrooms, tadelakt, plaster restoration. Text Ryan: 504-264-4919.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/viewtube",
    title: "viewTube | The DIY coach that watches you — and stops you",
    description: "YouTube shows you how. viewTube watches you do it. Pick Cole or Avery, point the phone at the bench, and get a live stop if the part is backwards.",
    ogImage: DEFAULT_OG,
  },
  {
    path: "/viewtube/show",
    title: "Feel the stop | viewTube",
    description: "Fifteen seconds. Cole watches a book get flipped backwards and freezes the session.",
    ogImage: DEFAULT_OG,
  },
    title: "Pick a coach | viewTube",
    description: "Choose Cole or Avery and a structured DIY project. viewTube watches the bench and stops you if the part is backwards.",
    ogImage: DEFAULT_OG,
  },
];

module.exports = { SEO_ROUTES, SITE };
