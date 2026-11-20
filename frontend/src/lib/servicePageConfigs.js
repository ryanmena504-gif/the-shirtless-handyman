/**
 * Core service pages — one page per thing Ryan actually sells, so a searcher
 * typing "microcement shower New Orleans" or "venetian plaster New Orleans"
 * lands on a page about exactly that, with a quote form above the fold.
 *
 * Rendered by LocalServicePage (same template as the other local pages).
 * Pricing only uses numbers already published elsewhere on the site.
 * Countertops have no published price, so that page omits pricing schema.
 */

const AREAS = [
  "New Orleans", "Metairie", "Kenner", "Harahan", "Gretna", "Algiers",
  "Uptown", "Lakeview", "Mid-City", "Garden District", "Bywater", "Marigny",
  "Mandeville", "Covington", "Slidell", "Madisonville",
];

const WATERPROOF_FAQ = {
  q: "How do you waterproof a microcement shower?",
  a: "Microcement itself is a thin decorative finish — the waterproofing is a system underneath and on top of it. In plain terms: I inspect what's there (tile, backer board, slope, soft spots) and fix anything failing, prime and reinforce the substrate, install a waterproofing layer through the wet zone and into the corners, niches, and drain, build the microcement base and finish coats, then seal it. Before you sign, I walk you through every layer for your specific bathroom — what I'm keeping, what I'm replacing, and why.",
};

const HEATED_FAQ = {
  q: "Do I really get free heated floors?",
  a: "Yes. Book a whole-bathroom renovation or a whole-floor coating and I buy and install the underfloor heating system at no charge. I'll confirm the details for your floor during the site visit.",
};

const MOLD_FAQ = {
  q: "Will mold grow on microcement?",
  a: "Mold in tile showers usually lives in grout lines and failing caulk — porous joints that stay damp. A sealed microcement shower is one continuous surface with no grout lines, so there's no grout for mold to live in. Like any shower, it still needs normal cleaning and ventilation, and the sealer should be maintained as I'll explain at handoff.",
};

export const SERVICE_PAGE_CONFIGS = {
  "microcement-showers-new-orleans": {
    slug: "microcement-showers-new-orleans",
    serviceName: "Seamless Microcement Showers",
    serviceType: "Microcement shower installation",
    city: "New Orleans",
    title: "Microcement Showers New Orleans | Seamless, Grout-Free & Waterproof — The Shirtless Handyman",
    description:
      "Seamless microcement showers in New Orleans, built on three-layer waterproofing. No grout, no seams, no mold. Book a site visit: 504-264-4919.",
    oneLiner:
      "Gorgeous on top, overbuilt underneath: seamless microcement showers built on a three-layer waterproofing system most installers skip.",
    showWhyShowersDontLeak: true,
    eyebrow: "Seamless Showers · New Orleans, LA",
    h1: "No grout. No seams. No mold. A shower built for New Orleans humidity.",
    heroParagraph:
      "I replace the grout lines where mold lives with one continuous, sealed microcement surface — walls, niche, bench, and floor. Often right over your existing tile once I've confirmed it's solid. I explain every layer of the waterproofing before you commit.",
    heroImage: "/portfolio/wetroom-shower-niche.webp",
    ogImage: "https://www.theshirtlesshandyman.com/portfolio/wetroom-shower-niche.webp",
    primaryCta: "Get my free shower quote",
    smsBody: "Hey Ryan, I'd like a quote on a seamless microcement shower.",
    defaultProjectType: "Seamless shower",
    priceLow: 3000,
    priceHigh: null,
    benefits: [
      { icon: "Droplets", title: "Nowhere for mold to hide", body: "No grout lines and no tile joints. One sealed surface from floor to ceiling, so there's no porous grout soaking up shower water." },
      { icon: "Layers", title: "Often goes over your existing tile", body: "If the tile is solid, I can prep it and build right over it — less demolition, less dust, less time without a shower." },
      { icon: "ShieldCheck", title: "Waterproofing explained, not hidden", body: "You'll know exactly what's under the finish: what I'm keeping, what I'm replacing, and how the corners, niche, and drain get sealed." },
      { icon: "Award", title: "Installed by me, start to finish", body: "Same person who quotes the job does the work. No crews, no subs, no one you've never met in your bathroom." },
    ],
    serviceAreas: AREAS,
    whereItShines: [
      "Walk-in showers where the grout has gone black and won't come clean.",
      "Older New Orleans bathrooms with dated but solid tile you'd rather not tear out.",
      "Curbless and wet-room style showers that flow straight into the floor.",
      "Built-in niches and benches with no grout seams to scrub.",
      "Flips and rentals that need a high-end look with no grout upkeep.",
    ],
    faq: [
      MOLD_FAQ,
      WATERPROOF_FAQ,
      { q: "Can microcement go over my existing shower tile?", a: "Often, yes — after I inspect the tile assembly and confirm it's stable and not hiding water damage. If the tile or what's behind it is failing, I'll show you and we'll rebuild that part properly instead of covering a problem." },
      { q: "How much does a microcement shower cost in New Orleans?", a: "Every job is quoted per project after a free site visit. Seamless showers start around $3,000, and most of my projects land between $3,000 and $10,000. The condition of the existing surfaces, the size, and the plumbing all move the number." },
      HEATED_FAQ,
    ],
  },

  "bathroom-remodel-new-orleans": {
    slug: "bathroom-remodel-new-orleans",
    serviceName: "Seamless Bathroom Transformations",
    serviceType: "Bathroom renovation",
    city: "New Orleans",
    title: "Bathroom Remodel New Orleans | Seamless Microcement Bathrooms + Free Heated Floors — The Shirtless Handyman",
    description:
      "Seamless microcement bathrooms in New Orleans, with showers on three-layer waterproofing and free underfloor heating. Book a site visit: 504-264-4919.",
    oneLiner:
      "Gorgeous on top, overbuilt underneath: seamless microcement showers built on a three-layer waterproofing system most installers skip.",
    showWhyShowersDontLeak: true,
    eyebrow: "Bathroom Transformations · New Orleans, LA",
    h1: "A spa bathroom with no grout to scrub — and the heated floor is on me.",
    heroParagraph:
      "Walls, floor, and shower wrapped in one continuous microcement surface, rebuilt with proper waterproofing for older New Orleans homes. Book a whole-bathroom renovation and I buy and install the underfloor heating for free.",
    heroImage: "/portfolio/microcement-bath-terracotta-floor.webp",
    ogImage: "https://www.theshirtlesshandyman.com/portfolio/microcement-bath-terracotta-floor.webp",
    primaryCta: "Get my free bathroom quote",
    smsBody: "Hey Ryan, I'd like a quote on a full bathroom transformation (with the free heated floors).",
    defaultProjectType: "Full bathroom transformation",
    priceLow: 6000,
    priceHigh: null,
    benefits: [
      { icon: "Sparkles", title: "Free underfloor heating", body: "Every whole-bathroom renovation includes an underfloor heating system — I buy it and install it at no charge." },
      { icon: "Droplets", title: "One seamless shell", body: "Walls, floor, and shower in one continuous surface. No grout, no tile edges, no seams for water or mold to work into." },
      { icon: "ShieldCheck", title: "Waterproofing rebuilt properly", body: "Older NOLA bathrooms often hide soft subfloors and failed pans. I find it, show you, and rebuild it right before any finish goes on." },
      { icon: "Award", title: "One craftsman, one point of contact", body: "I quote it, I build it, I answer your texts. You always know who's in your house and what's happening next." },
    ],
    serviceAreas: AREAS,
    whereItShines: [
      "Primary bathrooms in older Uptown, Mid-City, and Garden District homes.",
      "Dated tile bathrooms you want to feel like a boutique hotel.",
      "Flips that need a wow-factor bathroom with no grout maintenance for buyers.",
      "Designers and contractors who want a seamless finish without managing the trade.",
      "Cold tile floors — fixed for good with the free heated floor.",
    ],
    faq: [
      HEATED_FAQ,
      WATERPROOF_FAQ,
      { q: "What does a full bathroom transformation include?", a: "Typically walls, floor, and shower finished in seamless microcement, with selective demolition and a waterproofing rebuild where needed, niches, and fixture and lighting upgrades as scoped. Every scope is written out in your quote after the site visit." },
      { q: "How much does a seamless bathroom remodel cost in New Orleans?", a: "It's quoted per project after a free site visit. Full seamless bathrooms start around $6,000, and most land between $6,000 and $10,000; larger and luxury bathrooms are quoted individually. They also come with free underfloor heating — I buy the system and install it at no charge. The final number depends on size, condition, plumbing, fixtures, and finish." },
      { q: "How does the process work?", a: "Call or text, I come out for a site visit and look at everything (including what's behind the tile), you get a written quote, and a deposit locks your spot on the schedule." },
    ],
  },

  "venetian-plaster-new-orleans": {
    slug: "venetian-plaster-new-orleans",
    serviceName: "Venetian Plaster",
    serviceType: "Venetian plaster installation",
    city: "New Orleans",
    title: "Venetian Plaster New Orleans | Hand-Troweled Lime Plaster Walls — The Shirtless Handyman",
    description:
      "Hand-troweled Venetian plaster and marmorino walls in New Orleans — feature walls, dining rooms, powder baths, and fireplaces in older homes. Free quote: 504-264-4919.",
    eyebrow: "Venetian Plaster · New Orleans, LA",
    h1: "Venetian plaster walls with depth you can feel — hand-troweled in New Orleans.",
    heroParagraph:
      "Polished lime plaster that catches the light and turns a flat wall into the room's centerpiece. Right at home in New Orleans' older houses, from shotgun doubles to Garden District mansions.",
    heroImage: "/venetian-plaster-hero.webp",
    ogImage: "https://www.theshirtlesshandyman.com/venetian-plaster-hero.webp",
    primaryCta: "Get my free plaster quote",
    smsBody: "Hey Ryan, I'd like a quote on Venetian plaster walls.",
    defaultProjectType: "Venetian plaster / walls",
    priceLow: 3000,
    priceHigh: null,
    benefits: [
      { icon: "Paintbrush", title: "Real lime plaster, by hand", body: "Built up in thin troweled layers and burnished — not a faux paint effect." },
      { icon: "Layers", title: "Made for older homes", body: "A natural fit for plaster walls, tall ceilings, and the character of historic New Orleans houses." },
      { icon: "Sparkles", title: "Feature walls to whole rooms", body: "Dining rooms, entries, powder baths, fireplaces, stairwells, and ceilings." },
      { icon: "Award", title: "Samples before you commit", body: "We pick color and sheen together so you know exactly what you're getting." },
    ],
    serviceAreas: AREAS,
    whereItShines: [
      "Dining room and living room feature walls.",
      "Powder rooms that should feel like a jewel box.",
      "Fireplace surrounds and chimney breasts.",
      "Entry halls and stairwells in older New Orleans homes.",
      "Restaurant, salon, and boutique interiors.",
    ],
    faq: [
      { q: "What is Venetian plaster?", a: "A lime-based plaster applied by hand in thin layers and burnished with a steel trowel. The result has a marbled depth and soft sheen that paint can't reproduce." },
      { q: "How much does Venetian plaster cost in New Orleans?", a: "Plaster walls start around $3,000 and are quoted per project based on wall area, condition, and finish. I quote after a free site visit." },
      { q: "Can Venetian plaster go over my existing walls?", a: "Usually — over sound drywall or plaster once it's repaired and primed. I check wall condition at the site visit." },
    ],
  },

  "microcement-countertops-new-orleans": {
    slug: "microcement-countertops-new-orleans",
    serviceName: "Microcement Countertops & Vanities",
    serviceType: "Microcement countertop resurfacing",
    city: "New Orleans",
    title: "Microcement Countertops New Orleans | Seamless Vanity & Counter Resurfacing — The Shirtless Handyman",
    description:
      "Seamless microcement countertops and vanity tops in New Orleans — a continuous, grout-free surface that can match your microcement walls and floors. Free quote: 504-264-4919.",
    eyebrow: "Countertops & Vanities · New Orleans, LA",
    h1: "Seamless microcement counters and vanities that match the rest of the room.",
    heroParagraph:
      "One continuous, grout-free surface on your vanity or counter — perfect for wrapping a bathroom in a single material from floor to shower to sink.",
    heroImage: "/portfolio/microcement-vanity-bathroom.webp",
    ogImage: "https://www.theshirtlesshandyman.com/portfolio/microcement-vanity-bathroom.webp",
    primaryCta: "Get my free countertop quote",
    smsBody: "Hey Ryan, I'd like a quote on microcement countertops / a vanity top.",
    defaultProjectType: "Countertops / vanity",
    priceLow: null,
    priceHigh: null,
    benefits: [
      { icon: "Layers", title: "No grout, no seams", body: "Say goodbye to tile counters and dirty grout lines around the sink." },
      { icon: "Paintbrush", title: "Matches your walls and floor", body: "Use the same color and texture as your microcement shower and floor for a fully seamless room." },
      { icon: "Droplets", title: "Sealed for daily use", body: "Finished with a protective sealer; I'll explain how to care for it at handoff." },
      { icon: "Award", title: "Priced per project", body: "Every counter is different. I quote after seeing it in person." },
    ],
    serviceAreas: AREAS,
    whereItShines: [
      "Bathroom vanity tops as part of a full seamless bathroom.",
      "Tile countertops you want to resurface without tearing out.",
      "Floating vanities and built-in sinks for a minimalist look.",
      "Bar tops and accent surfaces.",
    ],
    faq: [
      { q: "Can microcement go on a countertop?", a: "Yes, on a sound, rigid base. I check the existing counter or vanity top at the site visit and tell you whether it can be resurfaced or needs a new base." },
      { q: "How much do microcement countertops cost?", a: "They're priced per project after a site visit, based on size, edges, sink cutouts, and the condition of what's there now." },
      HEATED_FAQ,
    ],
  },

  "walk-in-shower-remodel-new-orleans": {
    slug: "walk-in-shower-remodel-new-orleans",
    serviceName: "Walk-in Shower Remodels",
    serviceType: "Walk-in shower remodel",
    city: "New Orleans",
    title: "Walk-in Shower Remodel New Orleans | Seamless, No Grout, No Mold — The Shirtless Handyman",
    description:
      "Walk-in shower remodels in New Orleans. A three-layer waterproofing system, no grout, no seams, no mold. Free underfloor heating when the shower is part of a whole-bathroom renovation. Call 504-264-4919.",
    eyebrow: "Walk-in Showers · New Orleans, LA",
    h1: "A walk-in shower remodel with no grout lines and a real drain detail.",
    heroParagraph:
      "I turn tiled stalls and tub surrounds into walk-in showers finished in seamless microcement. The pretty surface is the third layer. Under it: a substrate I repair and reinforce, then a waterproofing layer carried into the corners, the niche, and the drain and pan. No grout, no seams, and no joint for mold to occupy. If the walk-in is part of a whole-bathroom renovation, the underfloor heating is included.",
    heroImage: "/portfolio/third-job.webp",
    ogImage: "https://www.theshirtlesshandyman.com/portfolio/third-job.webp",
    primaryCta: "Get my free walk-in quote",
    smsBody: "Hey Ryan, I want a walk-in shower remodel in New Orleans.",
    defaultProjectType: "Walk-in shower remodel",
    benefits: [
      { icon: "Layers", title: "Three-layer waterproofing", body: "Reinforced base, waterproofing tied into the drain and pan, then sealed microcement. I explain each layer for your shower before you commit." },
      { icon: "Droplets", title: "No grout, no seams, no mold", body: "The walk-in is one continuous surface. Water doesn't have a grout line to sit in." },
      { icon: "ShieldCheck", title: "The pan is part of the conversation", body: "Ask about the drain and the pan. If the existing one has failed, I show you and we rebuild it instead of coating over it." },
      { icon: "Flame", title: "Free heat with the whole bathroom", body: "A walk-in that's part of a whole-bathroom renovation includes underfloor heating, supplied and installed." },
    ],
    serviceAreas: AREAS,
    whereItShines: [
      "Tub-to-walk-in conversions in older New Orleans baths.",
      "Stalls where the grout is stained and the caulk has pulled away.",
      "Curbless showers when the floor can be sloped to the drain.",
      "Whole-bathroom remodels that include the heated floor.",
    ],
    faq: [
      { q: "What should I ask before a walk-in shower remodel?", a: "Ask how the shower is waterproofed, ask to see past work and the layers used, and ask about the drain and the pan. Those three tell you whether the person builds the wet zone or just coats it. I walk them on the site visit. Call or text 504-264-4919." },
      { q: "How is a walk-in shower waterproofed?", a: "Three layers. I fix and reinforce the substrate, install waterproofing through the wet zone and into the drain and pan, then trowel and seal the microcement. The finish has no grout and no seams." },
      { q: "Can a tub become a walk-in?", a: "Often, yes. It depends on the floor structure, the drain location, and whether the pan needs to be rebuilt. I look at that in person before I tell you it can." },
      { q: "Do I get the free heated floor?", a: "When the walk-in is part of a whole-bathroom renovation, yes. I buy the underfloor heating system and install it at no charge. A shower-only remodel is scoped on its own." },
    ],
  },
};
