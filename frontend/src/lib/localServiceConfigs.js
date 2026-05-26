/**
 * Local-service landing page configs. Each config is consumed by LocalServicePage.
 * Keep copy NOLA-specific (humidity, year-round wet weather, French Quarter aesthetics)
 * so each page reads native and ranks for distinct long-tail queries.
 */

const NOLA_AREAS = [
  "Metairie", "Gretna", "Harvey", "Lakeview", "Uptown",
  "Mid-City", "Marigny", "Algiers", "Westwego", "Carrollton",
  "French Quarter", "Garden District", "Bywater", "Kenner",
];

export const LOCAL_SERVICE_CONFIGS = {
  // ---- Microcement · New Orleans (top-level) ------------------------------
  "microcement-new-orleans": {
    slug: "microcement-new-orleans",
    serviceName: "Microcement",
    serviceType: "Microcement",
    city: "New Orleans",
    title: "Microcement New Orleans | Seamless Bathroom & Floor Installation — The Shirtless Handyman",
    description:
      "Microcement specialist in New Orleans. Seamless, waterproof, zero-grout shower & floor installation across Metairie, Gretna, Lakeview & the Westbank. Free design preview in 60 seconds. Text Ryan: 504-264-4919.",
    eyebrow: "Microcement · New Orleans, LA",
    h1: "Microcement in New Orleans — installed over your existing surface.",
    heroParagraph:
      "Seamless, waterproof, zero-grout microcement showers, floors, and walls — applied by hand across Greater New Orleans. No demolition. No 4-week timeline. No grout to scrub. See your own space rendered in microcement before you spend a dollar.",
    heroImage:
      "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Preview My Bathroom Free",
    smsBody: "Hey Ryan, I'm interested in microcement in New Orleans.",
    defaultProjectType: "Microcement Bathroom",
    priceLow: 2000,
    priceHigh: 12000,
    benefits: [
      { icon: "Droplets", title: "100% Waterproof", body: "Sealed microcement has zero seams or grout — no path for water to enter. Built for NOLA wet zones, humidity, and decades of use." },
      { icon: "Layers", title: "Installs Over Existing Tile", body: "We bond directly to your existing shower tile, floor, or walls. No demolition, no debris, no dumpster in your driveway." },
      { icon: "Clock", title: "Done in 2–5 Days", body: "Most single-room microcement installs complete in under a week — versus 3–4 weeks for a comparable tile renovation." },
      { icon: "ShieldCheck", title: "10+ Year Lifespan", body: "Properly sealed microcement outlasts grout-based finishes by decades. No re-caulking, no scrubbing black grout lines." },
    ],
    serviceAreas: NOLA_AREAS,
    whereItShines: [
      "Walk-in showers — replaces tile + grout entirely. One waterproof shell.",
      "Bathroom floors — wall-to-wall, with no transitions or seams.",
      "Kitchen backsplashes — counter-to-ceiling, no grout to stain.",
      "Floors in older NOLA homes — bonds directly over existing concrete, tile, or wood.",
      "Patios and pool decks — UV-stable, slip-resistant, weatherproof.",
      "Feature accent walls — paired with rockscape or marmorino for a focal point.",
    ],
    faq: [
      { q: "Who installs microcement in New Orleans?", a: "The Shirtless Handyman, run by Ryan Mena, specializes in microcement installation across Greater New Orleans — including Metairie, Gretna, Harvey, Lakeview, Uptown, Mid-City, Marigny, Algiers, and the Westbank." },
      { q: "How much does microcement cost per square foot in New Orleans?", a: "Microcement in the New Orleans area typically runs $14 to $40 per square foot installed depending on the substrate, finish color, and prep work required. A single bathroom usually lands between $2,000 and $8,000." },
      { q: "Can microcement be installed over existing tile in a New Orleans shower?", a: "Yes. Microcement bonds directly to existing tile after proper prep — no demolition required. This is one of the main reasons New Orleans homeowners choose microcement over a full tile tear-out for shower renovations." },
      { q: "Is microcement a good choice for New Orleans humidity?", a: "Microcement is fully waterproof when properly sealed and is widely used in wet zones including showers, pool decks, and exterior surfaces. Its sealed, jointless surface makes it especially well-suited to high-humidity climates like New Orleans, where grout is prone to mold and failure." },
    ],
  },

  // ---- Microcement · Metairie ---------------------------------------------
  "microcement-metairie": {
    slug: "microcement-metairie",
    serviceName: "Microcement",
    serviceType: "Microcement",
    city: "Metairie",
    title: "Microcement Metairie | Seamless Bathroom & Floor Installation — The Shirtless Handyman",
    description:
      "Microcement installation in Metairie, LA. Seamless, waterproof, zero-grout showers and floors over existing tile. Free design preview in 60 seconds. Text Ryan: 504-264-4919.",
    eyebrow: "Microcement · Metairie, LA",
    h1: "Microcement in Metairie — installed over your existing surface.",
    heroParagraph:
      "Seamless, waterproof microcement showers, floors, and walls — installed across Metairie and the Greater New Orleans metro. No demolition. No grout. No 4-week timeline. Preview your own bathroom in microcement before you spend a dollar.",
    heroImage:
      "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Preview My Bathroom Free",
    smsBody: "Hey Ryan, I'm in Metairie and interested in microcement.",
    defaultProjectType: "Microcement Bathroom",
    priceLow: 2000,
    priceHigh: 12000,
    benefits: [
      { icon: "Droplets", title: "Built for slab-on-grade homes", body: "Most Metairie homes sit on a concrete slab — the perfect substrate for microcement. We bond directly with zero subfloor work." },
      { icon: "Layers", title: "Installs Over Existing Tile", body: "Keep your current bathroom intact. We bond microcement directly to the tile — no demolition, no debris in your driveway." },
      { icon: "Clock", title: "Done in 2–5 Days", body: "Most Metairie bathroom installs complete in under a week versus 3–4 weeks for full tile replacement." },
      { icon: "ShieldCheck", title: "10+ Year Lifespan", body: "Sealed microcement outlasts grout-based finishes by decades. No re-caulking. No mold lines." },
    ],
    serviceAreas: ["Old Metairie", "Bucktown", "Lakeview", "Bonnabel", "Fat City", "Airline Park", "Kenner", "River Ridge"],
    whereItShines: [
      "Walk-in showers — replaces tile + grout with one waterproof shell.",
      "Bathroom floors — wall-to-wall continuous surface with radiant heat compatibility.",
      "Kitchen backsplashes — counter-to-ceiling, never stains.",
      "Garage and utility room floors — sealed against heat, oil, and standing water.",
      "Patio and pool deck — UV-stable, slip-resistant, weatherproof.",
    ],
    faq: [
      { q: "Who installs microcement in Metairie?", a: "The Shirtless Handyman, run by Ryan Mena, installs microcement throughout Metairie, Old Metairie, Bucktown, Bonnabel, and the rest of Jefferson Parish." },
      { q: "What's the average cost of a microcement bathroom in Metairie?", a: "A typical Metairie bathroom microcement project runs $2,000 to $8,000 depending on square footage and prep. Full multi-room transformations start around $8,000." },
      { q: "Can microcement be installed on a concrete slab home?", a: "Yes — concrete slab homes (very common in Metairie) are an ideal substrate for microcement. We can install directly on properly prepped concrete, often without any subfloor work." },
      { q: "How does microcement hold up in Louisiana humidity?", a: "Properly sealed microcement is fully waterproof and mold-resistant — making it especially well-suited to Metairie's humid, year-round wet climate. It's used in walk-in showers, wet rooms, and outdoor patios across the metro." },
    ],
  },

  // ---- Tadelakt · New Orleans ----------------------------------------------
  "tadelakt-new-orleans": {
    slug: "tadelakt-new-orleans",
    serviceName: "Tadelakt",
    serviceType: "Tadelakt",
    city: "New Orleans",
    title: "Tadelakt Shower Installation New Orleans | Moroccan Plaster — The Shirtless Handyman",
    description:
      "Authentic tadelakt shower and bathroom installation in New Orleans. Hand-applied Moroccan lime plaster — naturally waterproof, antibacterial, seamless. Free design preview. Text Ryan: 504-264-4919.",
    eyebrow: "Tadelakt · New Orleans, LA",
    h1: "Tadelakt showers in New Orleans — Moroccan craftsmanship by hand.",
    heroParagraph:
      "Hand-applied tadelakt for showers, tub surrounds, and bathroom walls across Greater New Orleans. Naturally waterproof. Naturally antibacterial. No tile. No grout. One continuous Moroccan lime plaster surface that looks better the longer you live with it.",
    heroImage:
      "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Preview My Shower Free",
    smsBody: "Hey Ryan, I'm interested in a tadelakt shower in New Orleans.",
    defaultProjectType: "Tadelakt Shower",
    priceLow: 3500,
    priceHigh: 18000,
    benefits: [
      { icon: "Droplets", title: "Naturally Waterproof", body: "Tadelakt has been used in Moroccan hammams for 800+ years because the lime + olive-soap finish self-seals against water. No surface coating required." },
      { icon: "Sparkles", title: "Antibacterial by Chemistry", body: "The high-pH lime substrate naturally resists mold, mildew, and bacteria — a real advantage in New Orleans humidity." },
      { icon: "Award", title: "Hand-Polished Finish", body: "Every surface is burnished by hand with river stones — producing the deep, glowing patina you can't fake." },
      { icon: "Layers", title: "Single Continuous Surface", body: "Walls flow into floor with zero seams or transitions. The whole shower becomes one sculptural piece." },
    ],
    serviceAreas: NOLA_AREAS,
    whereItShines: [
      "Walk-in showers and wet rooms — naturally waterproof without any sealer.",
      "Tub surrounds with deep, warm color tones.",
      "Bathroom feature walls with a hand-burnished glow.",
      "Powder rooms — high-touch, high-impact in a small footprint.",
      "Spa-style retreats in older NOLA homes where tile would feel wrong.",
    ],
    faq: [
      { q: "Who installs tadelakt in New Orleans?", a: "The Shirtless Handyman, run by Ryan Mena, installs tadelakt across Greater New Orleans — including Uptown, Garden District, Lakeview, Mid-City, and the Westbank." },
      { q: "How much does a tadelakt shower cost in New Orleans?", a: "A tadelakt shower in the New Orleans area typically runs $3,500 to $12,000 depending on square footage, ceiling height, and color complexity. Full bathroom installs can reach $18,000." },
      { q: "Is tadelakt really waterproof without a sealer?", a: "Yes. Authentic tadelakt is burnished with river stone and treated with olive-oil soap, which creates a self-sealing surface. It has been the traditional finish for Moroccan hammams (steam baths) for centuries." },
      { q: "How long does a tadelakt shower take to install?", a: "Most tadelakt shower installs take 5 to 8 days because of the multiple hand-applied layers and burnishing time. The result is a one-of-a-kind hand-finished surface that machine-made tile can never replicate." },
    ],
  },

  // ---- Rockscape walls · New Orleans --------------------------------------
  "rockscape-walls-new-orleans": {
    slug: "rockscape-walls-new-orleans",
    serviceName: "Rockscape Walls",
    serviceType: "Decorative Wall Installation",
    city: "New Orleans",
    title: "Custom Rockscape Feature Walls New Orleans | Sculpted Stone Accent Walls",
    description:
      "Custom rockscape accent walls in New Orleans. Hand-sculpted, microaggregate-coated foam panels that look like carved natural stone — optional LED backlighting. Free design preview. Text Ryan: 504-264-4919.",
    eyebrow: "Rockscape Walls · New Orleans, LA",
    h1: "Custom rockscape walls — sculpted stone for your New Orleans home.",
    heroParagraph:
      "Hand-sculpted foam panels coated in microaggregate to look and feel like carved natural stone. Backlit, textured, and completely one-of-a-kind. Built right here in New Orleans for living rooms, bedrooms, restaurants, and lobbies that need a statement piece.",
    heroImage:
      "https://images.unsplash.com/photo-1738585608732-49294c24ece0?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Design My Rockscape Wall",
    smsBody: "Hey Ryan, I want a custom rockscape wall in New Orleans.",
    defaultProjectType: "Rockscape Feature Wall",
    priceLow: 3500,
    priceHigh: 25000,
    benefits: [
      { icon: "Award", title: "Built for Your Exact Space", body: "We sculpt each panel to fit your wall dimensions, ceiling line, and architectural features. No two rockscape walls are alike." },
      { icon: "Sparkles", title: "LED Backlighting Available", body: "Integrate warm or color-shifting LED behind the sculpted face for cinematic depth — perfect for living rooms and lobbies." },
      { icon: "Layers", title: "Authentic Stone Texture", body: "The microaggregate finish gives every surface a real carved-rock feel — not faux paint, not printed wallpaper." },
      { icon: "ShieldCheck", title: "Lightweight & Easy to Install", body: "Foam-core panels mean we can install on any standard drywall — no structural reinforcement needed in older NOLA homes." },
    ],
    serviceAreas: NOLA_AREAS,
    whereItShines: [
      "Living room accent walls — the single biggest impact upgrade for the dollar.",
      "Bedroom headboard walls — sculpted texture behind your bed.",
      "Restaurant and bar interiors — a focal point that customers photograph.",
      "Hotel lobbies and short-term rentals — instant 'wow' moment.",
      "Backlit feature niches and home theater walls.",
    ],
    faq: [
      { q: "What is a rockscape wall?", a: "A rockscape wall is a hand-sculpted accent wall made from foam-core panels coated in microaggregate to give the look and feel of carved natural stone. It can be backlit, color-tinted, or shaped to integrate with existing architecture." },
      { q: "How much does a custom rockscape wall cost in New Orleans?", a: "Most rockscape walls run $3,500 to $12,000 depending on wall size, depth of carving, and whether LED backlighting is integrated. Large commercial installations can reach $25,000." },
      { q: "Is the surface real stone?", a: "No — and that's a feature, not a bug. Real carved stone of this scale would weigh hundreds of pounds and require structural reinforcement. Our sculpted foam + microaggregate panels are lightweight, look and feel real to the touch, and install on any standard wall." },
      { q: "How long does a rockscape wall take to install?", a: "A typical accent wall takes 3 to 6 days depending on size and detail. Larger commercial walls may take 1–2 weeks of on-site sculpting and finishing." },
    ],
  },

  // ---- Pool deck resurfacing · New Orleans --------------------------------
  "pool-deck-resurfacing-new-orleans": {
    slug: "pool-deck-resurfacing-new-orleans",
    serviceName: "Pool Deck Resurfacing",
    serviceType: "Pool Deck Resurfacing",
    city: "New Orleans",
    title: "Pool Deck Resurfacing New Orleans | Microterrazzo & Cocciopesto — The Shirtless Handyman",
    description:
      "Pool deck and patio resurfacing in New Orleans. Microterrazzo and cocciopesto seamless finishes — UV-stable, slip-resistant, weatherproof. Free design preview. Text Ryan: 504-264-4919.",
    eyebrow: "Pool Deck · New Orleans, LA",
    h1: "Pool deck resurfacing in New Orleans — built for sun, rain, and bare feet.",
    heroParagraph:
      "Seamless microterrazzo and cocciopesto resurfacing for pool decks, patios, and outdoor kitchens across Greater New Orleans. UV-stable. Slip-resistant. No grout joints to crack or weed-grow. Cooler underfoot than dark concrete or tile. Built for year-round NOLA weather.",
    heroImage:
      "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Preview My Pool Deck Free",
    smsBody: "Hey Ryan, I need pool deck resurfacing in New Orleans.",
    defaultProjectType: "Pool Deck",
    priceLow: 3000,
    priceHigh: 18000,
    benefits: [
      { icon: "Droplets", title: "Weatherproof + UV-Stable", body: "Sealed microterrazzo handles year-round NOLA sun, summer thunderstorms, and the occasional flood. No cracking. No fading." },
      { icon: "ShieldCheck", title: "Slip-Resistant Finish", body: "We add a fine aggregate to the topcoat so the deck stays grippy when wet — important for pools and bare feet." },
      { icon: "Layers", title: "Goes Over Existing Concrete", body: "Bond directly to your existing pool deck. No demolition. No re-pour. Most projects finish in under a week." },
      { icon: "Sparkles", title: "Cooler Underfoot", body: "Lighter-toned microterrazzo reflects more heat than dark pavers or tile — meaningfully cooler on bare feet in July." },
    ],
    serviceAreas: NOLA_AREAS,
    whereItShines: [
      "Pool decks and pool surrounds — sealed, slip-resistant, easy to clean.",
      "Patios and outdoor lounging areas.",
      "Outdoor kitchens and bar areas.",
      "Garden walkways and stairs.",
      "Covered porches and screened lanais.",
    ],
    faq: [
      { q: "Who resurfaces pool decks in New Orleans?", a: "The Shirtless Handyman, run by Ryan Mena, resurfaces pool decks, patios, and outdoor kitchens across Greater New Orleans using seamless microterrazzo, cocciopesto, and microcement systems." },
      { q: "How much does pool deck resurfacing cost in New Orleans?", a: "Most pool deck resurfacing projects in the New Orleans area run $3,000 to $12,000 depending on square footage, existing deck condition, and finish selection. Large multi-zone outdoor projects can reach $18,000." },
      { q: "Is microterrazzo slippery when wet?", a: "No — we add a fine aggregate to the topcoat that creates a grippy texture even when wet. It's slip-rated for residential pool decks." },
      { q: "How long will a resurfaced pool deck last in Louisiana?", a: "Properly sealed microterrazzo and cocciopesto pool decks routinely last 10+ years in Louisiana climate. A periodic re-seal (every 3–5 years) extends life further." },
    ],
  },
};
