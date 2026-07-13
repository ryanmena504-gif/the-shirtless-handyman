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
    priceLow: 5000,
    priceHigh: 30000,
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
      { q: "How much does microcement cost per square foot in New Orleans?", a: "Microcement in the New Orleans area typically runs $25 to $60 per square foot installed depending on the substrate, finish color, and prep work required. Minimum project fee is $5,000. A single bathroom usually lands between $5,000 and $12,000 all-in." },
      { q: "Can microcement be installed over existing tile in a New Orleans shower?", a: "Yes. Microcement bonds directly to existing tile after proper prep — no demolition required. This is one of the main reasons New Orleans homeowners choose microcement over a full tile tear-out for shower renovations." },
      { q: "Is microcement a good choice for New Orleans humidity?", a: "Microcement is fully waterproof when properly sealed and is widely used in wet zones including showers, pool decks, and exterior surfaces. Its sealed, jointless surface makes it especially well-suited to high-humidity climates like New Orleans, where grout is prone to mold and failure." },
    ],
  },

  // ---- Microcement Installers · New Orleans (hiring intent) ---------------
  // Sibling to /microcement-new-orleans, but angled for searchers actively
  // looking to *hire* a microcement installer (different SERP intent).
  "microcement-installers-new-orleans": {
    slug: "microcement-installers-new-orleans",
    serviceName: "Microcement Installation",
    serviceType: "Microcement Installer",
    city: "New Orleans",
    title: "Microcement Installers New Orleans | Local Specialist, Real Photos, Fast Quotes — The Shirtless Handyman",
    description:
      "Hire a microcement installer in New Orleans. Born-and-raised NOLA craftsman Ryan Mena installs seamless, waterproof microcement showers, floors, and walls — no demolition, no grout, no subcontractors. Free design preview in 60 seconds. Text 504-264-4919.",
    eyebrow: "Microcement Installers · New Orleans, LA",
    h1: "Microcement installers in New Orleans — one craftsman, real portfolio, fast quote.",
    heroParagraph:
      "Looking for microcement installers in New Orleans? You're in the right place. I'm Ryan Mena — born here, working here, installing microcement personally on every project. No subcontractors, no franchise quote, no 4-week wait. See your own bathroom rendered in microcement in 60 seconds, then get a real installer-direct quote.",
    heroImage:
      "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Get My Installer Quote Free",
    smsBody: "Hey Ryan, I'm looking for a microcement installer in New Orleans.",
    defaultProjectType: "Microcement Bathroom",
    priceLow: 5000,
    priceHigh: 30000,
    benefits: [
      { icon: "Award", title: "The Installer Touches Every Job", body: "I install every microcement project personally — same hands from estimate to final seal. No 'we'll send a crew.' No language-barrier subs. You get one accountable craftsman." },
      { icon: "ShieldCheck", title: "Licensed, Insured & NOLA-Based", body: "Fully licensed and insured Louisiana home-improvement business. Local addresses, local references, local accountability. No national franchise pulling permits from Texas." },
      { icon: "Layers", title: "Real Microcement, Real Portfolio", body: "Italian microcement systems — not paint, not faux, not a knock-off. Ask to see in-person samples and references in your zip code before you commit a dollar." },
      { icon: "Clock", title: "Quote in 24 Hours, Install in 2–3 Weeks", body: "Quotes go out same-day or next-morning. Most New Orleans microcement installs are booked within 2–3 weeks of approval — much faster than the typical contractor pipeline." },
    ],
    serviceAreas: NOLA_AREAS,
    whereItShines: [
      "Walk-in showers — sealed microcement shell replacing tile + grout entirely.",
      "Master bathroom floors and walls — one continuous, waterproof surface.",
      "Powder rooms and half baths — a high-impact upgrade in a small footprint.",
      "Kitchen backsplashes and accent walls — no grout to stain, modern matte finish.",
      "Concrete-slab floors — bonded directly to existing slab with zero subfloor demo.",
      "Short-term rental turnovers — durable under guest abuse, easy to re-seal.",
    ],
    faq: [
      { q: "Who is the best microcement installer in New Orleans?", a: "I'm biased, but here's the test: any installer worth hiring should (1) show you in-person samples — not just photos — (2) name the exact microcement system they use (I use Italian-imported systems, not generic concrete overlay), (3) provide local NOLA references you can call, and (4) personally install the work — not subcontract it. The Shirtless Handyman, run by Ryan Mena, meets all four. Text 504-264-4919 for samples and references." },
      { q: "What should I ask a microcement installer before hiring them?", a: "Five questions: 'Will you personally install this or is it a subcontractor?', 'What microcement system and brand do you use?', 'Can I see a finished project in person in my zip code?', 'How do you prep over existing tile or substrate?', and 'What's the warranty on the seal?' If an installer dodges any of these, walk away." },
      { q: "How much do microcement installers charge in New Orleans?", a: "New Orleans microcement installers typically charge $25 to $60 per square foot installed, depending on the substrate, prep work, finish system, and color complexity. Minimum project fee is $5,000 (materials alone for a small bathroom run about $2,500 before labor). A typical single-bathroom install lands $5,000 to $12,000. Larger multi-room installs go up to $30,000. I give a fixed, all-in price after a free in-home consultation — no hidden 'change order' add-ons." },
      { q: "Do microcement installers in New Orleans need to be licensed?", a: "Yes. Microcement installation is an interior-finish trade that falls under Louisiana's residential home-improvement licensing rules for projects above the state threshold. Always hire a licensed and insured installer — ask to see the license number and a current insurance certificate before signing a contract." },
      { q: "How long does a microcement installation take in New Orleans?", a: "Most single-bathroom microcement installs in New Orleans take 4 to 7 working days, with cure time between layers. I schedule around your life — you can keep using the rest of the house while I work, and the room is back in service within 48 hours of the final seal." },
      { q: "Can you install microcement over existing tile in a New Orleans home?", a: "Yes — that's the most common install I do. Microcement bonds directly to existing tile after proper prep (cleaning, mechanical scarification, and a bonding primer). No demolition. No dumpster. No tile removal cost." },
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
    priceLow: 5000,
    priceHigh: 30000,
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
      { q: "What's the average cost of a microcement bathroom in Metairie?", a: "A typical Metairie bathroom microcement project runs $5,000 to $12,000 depending on square footage and prep. Minimum project fee is $5,000. Larger multi-room seamless transformations reach $30,000." },
      { q: "Can microcement be installed on a concrete slab home?", a: "Yes — concrete slab homes (very common in Metairie) are an ideal substrate for microcement. I install directly on properly prepped concrete, often without any subfloor work." },
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
    priceLow: 6500,
    priceHigh: 20000,
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
      { q: "How much does a tadelakt shower cost in New Orleans?", a: "A tadelakt shower in the New Orleans area typically runs $6,500 to $15,000 depending on square footage, ceiling height, and color complexity. Full tadelakt bathroom installs reach $20,000." },
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
    priceLow: 5000,
    priceHigh: 30000,
    benefits: [
      { icon: "Award", title: "Built for Your Exact Space", body: "We sculpt each panel to fit your wall dimensions, ceiling line, and architectural features. No two rockscape walls are alike." },
      { icon: "Sparkles", title: "LED Backlighting Available", body: "Integrate warm or color-shifting LED behind the sculpted face for cinematic depth — perfect for living rooms and lobbies." },
      { icon: "Layers", title: "Authentic Stone Texture", body: "The microaggregate finish gives every surface a real carved-rock feel — not faux paint, not printed wallpaper." },
      { icon: "ShieldCheck", title: "Lightweight & Easy to Install", body: "Foam-core panels mean I can install on any standard drywall — no structural reinforcement needed in older NOLA homes." },
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
    priceLow: 5000,
    priceHigh: 30000,
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

  // =========================================================================
  // NEIGHBORHOOD HANDYMAN MICRO-PAGES — long-tail local SEO
  // Each is a hyper-local landing page for "handyman in {neighborhood}" + seamless
  // surfaces. Same template, different copy, separately rankable.
  // =========================================================================
  "lakeview-handyman": {
    slug: "lakeview-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "Lakeview",
    title: "Lakeview Handyman & Microcement Specialist | The Shirtless Handyman",
    description:
      "Lakeview, New Orleans handyman and microcement specialist. Drywall, fixture installs, painting, plus seamless microcement bathrooms and tadelakt showers. Text Ryan: 504-264-4919.",
    eyebrow: "Lakeview · New Orleans, LA",
    h1: "Lakeview handyman — and the only microcement specialist on your block.",
    heroParagraph:
      "Born and built in New Orleans, serving Lakeview homes from Harrison Avenue to West End Boulevard. Same-day handyman fixes and full seamless-surface renovations — microcement bathrooms, tadelakt showers, rockscape walls. One craftsman. Real photos. Honest pricing.",
    heroImage: "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My Lakeview Project",
    smsBody: "Hey Ryan, I'm in Lakeview and need help with a project.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 150,
    priceHigh: 12000,
    benefits: [
      { icon: "Clock", title: "Same-Week Availability", body: "Lakeview is 12 minutes from my truck. Small repairs usually get scheduled within a week, microcement within 2–3." },
      { icon: "ShieldCheck", title: "Licensed & Insured Locally", body: "Fully covered, NOLA-based business. Not a national franchise quote." },
      { icon: "Wrench", title: "From Drywall to Microcement", body: "One call covers handyman repairs and full seamless renovations — no juggling 3 contractors." },
      { icon: "Award", title: "Real Lakeview References", body: "Ask for a list of Lakeview clients — I'll put you in touch with neighbors who've used me." },
    ],
    serviceAreas: ["Lakeview", "Lakeshore", "West End", "Lake Vista", "Lakewood", "Navarre"],
    whereItShines: [
      "Post-Katrina rebuilds — drywall, trim, fixtures, painting.",
      "Microcement bathrooms in two-story Lakeview homes.",
      "Pool deck resurfacing for lakefront properties.",
      "Pressure washing and exterior touch-ups before listing.",
      "Custom rockscape feature walls for new construction.",
    ],
    faq: [
      { q: "Do you cover all of Lakeview?", a: "Yes — from Robert E. Lee down to West End and across to Lake Vista. Lakeview is one of my most-requested neighborhoods because of its post-Katrina rebuild density." },
      { q: "Can you do both handyman and microcement on the same visit?", a: "Absolutely. Many Lakeview clients book a microcement bathroom and have me knock out the to-do list (drywall patches, fixture installs, paint touch-ups) while I'm there. One trip, one invoice." },
      { q: "How much does a Lakeview microcement bathroom cost?", a: "Most Lakeview bathrooms land between $5,000 and $12,000 installed depending on size and prep. Minimum project fee is $5,000." },
    ],
  },

  "uptown-handyman": {
    slug: "uptown-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "Uptown",
    title: "Uptown New Orleans Handyman & Microcement Specialist | The Shirtless Handyman",
    description:
      "Uptown New Orleans handyman and seamless-surface specialist. Drywall, fixtures, painting, microcement bathrooms, tadelakt showers, rockscape walls. Text Ryan: 504-264-4919.",
    eyebrow: "Uptown · New Orleans, LA",
    h1: "Uptown handyman — for the historic homes that deserve the right craftsman.",
    heroParagraph:
      "Serving Uptown New Orleans from St. Charles Avenue to Magazine Street to Audubon. Old plaster walls, century-old framing, narrow shotgun bathrooms — I've worked them all. Handyman repairs and full microcement / tadelakt renovations built to respect the character of an Uptown home.",
    heroImage: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My Uptown Project",
    smsBody: "Hey Ryan, I'm in Uptown and need help with a project.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 150,
    priceHigh: 18000,
    benefits: [
      { icon: "Award", title: "Historic Home Experience", body: "Lath-and-plaster walls, old subfloors, narrow shotgun layouts — I've worked them all. I don't damage what I'm hired to improve." },
      { icon: "Layers", title: "Microcement Over Anything", body: "Bonds directly to original tile, plaster, or even old wood — perfect for Uptown homes where demolition is too risky." },
      { icon: "ShieldCheck", title: "Insured for Historic Properties", body: "Full liability coverage for older homes, including documented prep on heritage-style walls." },
      { icon: "Sparkles", title: "Modern Finish, Classic Bones", body: "Microcement, tadelakt, and venetian plaster sit beautifully in century-old Uptown architecture." },
    ],
    serviceAreas: ["Uptown", "University Area", "Audubon", "Carrollton", "Riverbend", "Black Pearl", "Touro"],
    whereItShines: [
      "Microcement showers in narrow Uptown shotgun bathrooms.",
      "Tadelakt feature walls in century-old plaster rooms.",
      "Rockscape walls in renovated double-shotgun living areas.",
      "Plaster and trim repairs that don't ruin the historic detail.",
      "Pre-sale handyman punch lists for Uptown listings.",
    ],
    faq: [
      { q: "Do you work on historic Uptown homes?", a: "Yes — historic homes are most of what I do in Uptown. I take time to test substrates and document everything before I touch a wall. We bond microcement directly to old surfaces wherever possible to preserve the original house." },
      { q: "What's the most popular renovation in Uptown right now?", a: "Microcement bathrooms — especially shower-only conversions in tight shotgun layouts. The seamless finish fits a tiny footprint better than tile ever can." },
      { q: "Do you handle smaller handyman jobs in Uptown too?", a: "Yes. Drywall patches, plaster repair, fixture installs, painting, exterior touch-ups. Sometimes I knock these out the same day as a microcement consult." },
    ],
  },

  "mid-city-handyman": {
    slug: "mid-city-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "Mid-City",
    title: "Mid-City New Orleans Handyman & Microcement | The Shirtless Handyman",
    description:
      "Mid-City New Orleans handyman and microcement specialist. Renovations on raised cottages, doubles, and shotguns. Drywall, fixtures, microcement bathrooms. Text Ryan: 504-264-4919.",
    eyebrow: "Mid-City · New Orleans, LA",
    h1: "Mid-City handyman — built for raised cottages and shotgun bathrooms.",
    heroParagraph:
      "Serving Mid-City New Orleans from Canal Street to Bayou St. John to Esplanade Ridge. Raised cottages, doubles, and renovated shotguns — I work them all. Handyman fixes, drywall, painting, plus full seamless microcement bathrooms and tadelakt showers.",
    heroImage: "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My Mid-City Project",
    smsBody: "Hey Ryan, I'm in Mid-City and need help with a project.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 150,
    priceHigh: 14000,
    benefits: [
      { icon: "Wrench", title: "All-in-One Craftsman", body: "Handyman to high-end microcement under one phone number. No subcontracting." },
      { icon: "Layers", title: "Microcement Over Old Tile", body: "Most Mid-City bathrooms still have 1950s tile. We bond microcement directly — no demolition required." },
      { icon: "Clock", title: "5-Minute Drive Door-to-Door", body: "I live nearby. Mid-City is one of my fastest-turnaround neighborhoods." },
      { icon: "ShieldCheck", title: "Insured & Locally Accountable", body: "Same craftsman before and after the install. If something needs attention, I'm one text away." },
    ],
    serviceAreas: ["Mid-City", "Bayou St. John", "Esplanade Ridge", "Faubourg St. John", "Tulane", "Treme"],
    whereItShines: [
      "Microcement powder rooms in raised cottages.",
      "Tadelakt showers in renovated Mid-City shotguns.",
      "Rockscape accent walls for double-shotgun living rooms.",
      "Pool deck and patio resurfacing in Bayou St. John yards.",
      "Quick-turn handyman repairs before Mardi Gras / Jazz Fest.",
    ],
    faq: [
      { q: "Do you work in raised cottages?", a: "All the time. Raised cottages have unique subfloor concerns (especially after the post-Katrina rebuilds), and microcement works on them as long as we properly test the substrate first." },
      { q: "How quickly can you come look at a Mid-City project?", a: "Usually within 48 hours. I live close enough that estimating Mid-City jobs is genuinely fast." },
      { q: "Is Mid-City humidity a problem for microcement?", a: "No — microcement is fully waterproof when sealed. It's especially well-suited to NOLA humidity because there are no grout lines for water or mold to find." },
    ],
  },

  "bywater-handyman": {
    slug: "bywater-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "Bywater",
    title: "Bywater Handyman & Microcement Specialist | The Shirtless Handyman",
    description:
      "Bywater New Orleans handyman and microcement specialist. Renovations on shotguns and doubles. Microcement bathrooms, tadelakt showers, rockscape walls. Text Ryan: 504-264-4919.",
    eyebrow: "Bywater · New Orleans, LA",
    h1: "Bywater handyman — modern microcement for the most creative neighborhood in NOLA.",
    heroParagraph:
      "Serving Bywater and the Upper 9th from Press Street to Poland Avenue. Shotguns, doubles, art studios, short-term rentals — I work them all. Handyman repairs, plus seamless microcement bathrooms, tadelakt showers, and one-off rockscape feature walls that fit the Bywater aesthetic perfectly.",
    heroImage: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My Bywater Project",
    smsBody: "Hey Ryan, I'm in Bywater and want to chat about a project.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 150,
    priceHigh: 16000,
    benefits: [
      { icon: "Sparkles", title: "Fits the Bywater Aesthetic", body: "Microcement, tadelakt, and rockscape look the way Bywater wants to look — warm, hand-finished, never sterile." },
      { icon: "Award", title: "STR-Friendly Turnaround", body: "Quick-turn renovations between Airbnb guests. Tested process for Bywater short-term rentals." },
      { icon: "Wrench", title: "Trades + Aesthetic in One", body: "Handyman, microcement, and rockscape under one phone number." },
      { icon: "ShieldCheck", title: "NOLA-Native Craftsman", body: "Born and raised in New Orleans. I get how Bywater works." },
    ],
    serviceAreas: ["Bywater", "Marigny", "Upper 9th Ward", "Holy Cross", "St. Claude"],
    whereItShines: [
      "Microcement bathrooms in renovated shotguns.",
      "Rockscape feature walls for live/work studios.",
      "Tadelakt showers for boutique Airbnb units.",
      "Quick-turn drywall, paint, and fixture work between guests.",
      "Custom one-off finishes that match Bywater's creative aesthetic.",
    ],
    faq: [
      { q: "Do you work with short-term rental owners in Bywater?", a: "Yes — a lot of my Bywater work is for Airbnb hosts who need turnaround between bookings. We schedule around your reservation calendar." },
      { q: "Will microcement hold up in a high-turnover Bywater rental?", a: "Yes. Microcement is more durable than tile and grout under guest abuse — no joints to crack, no grout to stain. A quick seasonal re-seal is all it needs." },
      { q: "Do you do custom one-offs?", a: "Bywater is the right neighborhood for that. Rockscape walls, color-tinted microcement, mixed-finish bathrooms — I love a one-off." },
    ],
  },

  "french-quarter-handyman": {
    slug: "french-quarter-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "French Quarter",
    title: "French Quarter Handyman & Microcement Specialist | The Shirtless Handyman",
    description:
      "French Quarter New Orleans handyman and seamless-surface specialist. Microcement bathrooms, tadelakt, plaster repair, fixture installs in historic Quarter properties. Text Ryan: 504-264-4919.",
    eyebrow: "French Quarter · New Orleans, LA",
    h1: "French Quarter handyman — respectful renovations on 200-year-old buildings.",
    heroParagraph:
      "Working in the French Quarter takes patience, the right insurance, and a craftsman who actually understands historic plaster, courtyards, and short-term rental turnover. I cover Royal Street to Dauphine, Esplanade to Canal. Handyman repairs, microcement bathrooms, tadelakt showers, and plaster restoration.",
    heroImage: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My French Quarter Project",
    smsBody: "Hey Ryan, I'm in the French Quarter and have a project to discuss.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 200,
    priceHigh: 25000,
    benefits: [
      { icon: "Award", title: "Historic Property Experience", body: "Quarter buildings need a craftsman who respects what's there. We test before we touch and document every step." },
      { icon: "ShieldCheck", title: "Insured for Quarter Work", body: "Full coverage and familiar with VCC restrictions, courtyard access, and STR licensing context." },
      { icon: "Layers", title: "Modern Finish, Historic Bones", body: "Tadelakt and microcement sit beautifully against original Quarter plaster — no seam, no joint, no jarring contrast." },
      { icon: "Clock", title: "Scheduled Around Bookings", body: "STR-friendly turnaround. We work around your guest calendar." },
    ],
    serviceAreas: ["French Quarter", "Vieux Carré", "Marigny", "Faubourg Marigny", "Treme"],
    whereItShines: [
      "Microcement bathrooms in second-floor Quarter apartments.",
      "Tadelakt showers in courtyard guest suites.",
      "Plaster repair and historic-friendly drywall patches.",
      "Rockscape accent walls for boutique Quarter STRs.",
      "Pre-listing punch lists for Quarter properties going on market.",
    ],
    faq: [
      { q: "Can you do major renovations inside French Quarter properties?", a: "Yes, with the caveat that anything affecting exterior visible elements requires VCC approval. Interior renovations — microcement bathrooms, plaster repair, fixture work — I handle directly." },
      { q: "How do you handle access for second-floor Quarter units?", a: "We coordinate with property managers for elevator/stair access and minimize disruption to neighbors. Most of my Quarter clients are repeat work because of that." },
      { q: "Is microcement allowed in historic French Quarter bathrooms?", a: "Microcement is an interior finish that doesn't alter the historic structure — it bonds directly to existing tile or substrate. It's a common upgrade in Quarter STRs and full-time residences." },
    ],
  },

  "garden-district-handyman": {
    slug: "garden-district-handyman",
    serviceName: "Handyman & Seamless Surfaces",
    serviceType: "General Contracting",
    city: "Garden District",
    title: "Garden District Handyman & Microcement Specialist | The Shirtless Handyman",
    description:
      "Garden District New Orleans handyman and seamless-surface specialist. Historic mansions, microcement bathrooms, tadelakt, plaster restoration. Text Ryan: 504-264-4919.",
    eyebrow: "Garden District · New Orleans, LA",
    h1: "Garden District handyman — high-end finishes for historic mansions.",
    heroParagraph:
      "Serving the Garden District from St. Charles Avenue to Magazine to Jackson. Greek Revival and Italianate mansions get high-end treatment — full seamless microcement, hand-burnished tadelakt, custom rockscape feature walls, and the kind of plaster and trim work that doesn't damage what's been there 150 years.",
    heroImage: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=2000&fit=crop&fm=jpg&q=85",
    primaryCta: "Text My Garden District Project",
    smsBody: "Hey Ryan, I have a Garden District home and need help.",
    defaultProjectType: "Handyman / Microcement",
    priceLow: 200,
    priceHigh: 35000,
    benefits: [
      { icon: "Award", title: "High-End Finish Specialist", body: "Tadelakt, hand-burnished microcement, custom-tinted venetian plaster. Built for homes where the finish has to look the part." },
      { icon: "Sparkles", title: "Historic-Sensitive Approach", body: "I work around original moldings, plaster, and trim. We test substrates and protect what's there." },
      { icon: "Layers", title: "Modern + Classic, Coexisting", body: "Microcement bathrooms and tadelakt showers integrate beautifully against 150-year-old plaster walls." },
      { icon: "ShieldCheck", title: "Discreet, Insured, Local", body: "Quiet jobsite. Full coverage. NOLA-based. No national franchise quotes." },
    ],
    serviceAreas: ["Garden District", "Lower Garden District", "Irish Channel", "St. Charles Corridor", "Touro"],
    whereItShines: [
      "Tadelakt showers in restored Garden District mansions.",
      "Microcement bathrooms in carriage houses and pool houses.",
      "Rockscape walls in renovated kitchens and family rooms.",
      "Hand-finished venetian plaster in dining rooms and parlors.",
      "Pool deck resurfacing in Garden District courtyards.",
    ],
    faq: [
      { q: "Do you work on Garden District historic homes?", a: "Yes — a large portion of my high-end work is Garden District renovations. We move carefully around original moldings, plaster, and trim, and we test every substrate before we apply microcement or tadelakt." },
      { q: "What does a Garden District tadelakt shower cost?", a: "Larger Garden District tadelakt installations typically run $8,000 to $18,000 — sometimes more for high ceilings, custom color, or full-room (floor + wall) installations." },
      { q: "Can you coordinate with our architect or designer?", a: "Absolutely. A lot of my Garden District work is designer-specified — I'm comfortable presenting samples, color matching, and meeting on-site to walk specs." },
    ],
  },
};
