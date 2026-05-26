/**
 * Blog posts data. Each post is rendered by BlogPostPage using a small section
 * renderer (no MDX setup needed). Sections are plain JS structures so we keep the
 * blog framework-free, easy to extend, and trivially serializable into JSON-LD.
 *
 * To add a new post: append a config object to BLOG_POSTS and add its slug to
 * sitemap.xml. Done.
 */

export const BLOG_POSTS = [
  // -------------------------------------------------------------------------
  {
    slug: "microcement-vs-tile-cost-new-orleans",
    title: "Microcement vs. Tile: True Cost Breakdown for a New Orleans Bathroom",
    description:
      "We break down the real cost of a microcement bathroom vs. a tile renovation in New Orleans — labor, materials, timeline, and 10-year maintenance.",
    excerpt:
      "Tile looks cheap on paper. But once you factor in demolition, grout work, sealing, and the inevitable mold repair, microcement quietly wins. Here's the math.",
    publishedAt: "2026-02-10",
    readTimeMin: 6,
    heroImage:
      "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1600&fit=crop&fm=jpg&q=85",
    ogImage:
      "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1200&h=630&fit=crop&fm=jpg&q=85",
    tags: ["microcement", "cost", "comparison", "new orleans"],
    sections: [
      { type: "p", content: "If you're staring at a quote for a tile bathroom in New Orleans and the number made you put your phone down, you're not alone. Tile pricing in the metro has crept up steadily — and that's before you factor in the parts of the renovation nobody puts on the quote." },
      { type: "p", content: "We do both finishes. Most of our clients arrive comparing microcement to tile on a per-square-foot basis. By the end of the conversation, they're surprised to learn the gap is much smaller than they assumed — and over 10 years, microcement is usually the cheaper finish." },
      { type: "h2", content: "The headline numbers" },
      { type: "p", content: "For a typical New Orleans bathroom (around 60 sq ft of floor, 120 sq ft of walls), here's what we see most often in 2026 pricing:" },
      { type: "ul", items: [
        "Mid-range tile renovation: $9,000 – $18,000 installed",
        "Microcement seamless renovation: $5,000 – $9,500 installed",
        "Tadelakt shower-only renovation: $6,500 – $12,000 installed",
      ]},
      { type: "p", content: "Microcement comes in lower on the installed number for one main reason: no demolition. We bond directly to existing surfaces. No dumpster. No two-day tile-removal labor. No drywall repairs. Roughly 30% of a tile renovation's cost goes into stuff that has nothing to do with the new finish." },
      { type: "h2", content: "What the quote sheet often hides" },
      { type: "p", content: "Here's where tile gets you over the long haul — costs that almost never appear in the original quote:" },
      { type: "ul", items: [
        "Grout re-sealing every 2–3 years ($200–$500 per service)",
        "Caulk replacement in corners and at the tub line (~$150/year)",
        "Mold remediation in older NOLA bathrooms ($500–$2,000)",
        "Eventually re-grouting failing joints ($800–$2,500)",
      ]},
      { type: "p", content: "Across 10 years of typical use in New Orleans humidity, an average homeowner spends $2,500–$5,000 maintaining a tile bathroom. Microcement, by comparison, needs one re-seal at year 5–7 (around $400–$800) and that's it." },
      { type: "h2", content: "When tile still wins" },
      { type: "p", content: "We won't pretend tile is the wrong call for everyone. Tile is the better choice if you're chasing a specific traditional aesthetic (subway, Italian marble mosaic) where the grout lines are the design. Tile also resells slightly easier to traditional buyers who haven't yet seen microcement done well." },
      { type: "h2", content: "When microcement wins decisively" },
      { type: "ul", items: [
        "You're renovating over existing tile and want to skip demolition",
        "You're tired of scrubbing grout lines that turn black",
        "You want a modern, hotel-style look without the European price tag",
        "Your home is older and the substrate isn't perfectly flat — microcement is more forgiving",
        "You value installation speed (2–5 days vs. 3–4 weeks)",
      ]},
      { type: "h2", content: "The real takeaway" },
      { type: "p", content: "If you compare materials alone, tile is cheaper. If you compare installed cost, microcement is cheaper. If you compare 10-year total cost of ownership in New Orleans humidity, microcement is much cheaper. The Seamless Studio gives you a real estimate for your specific room in 60 seconds — it's worth running before you commit either way." },
      { type: "cta", text: "See your bathroom in microcement — free preview", href: "/upload" },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "best-microcement-contractor-new-orleans",
    title: "How to Choose the Best Microcement Contractor in New Orleans",
    description:
      "Microcement is a craft — not a paint job. Here are the 7 questions to ask any New Orleans contractor before letting them touch your bathroom.",
    excerpt:
      "Microcement is becoming the most-requested bathroom finish in NOLA. Which means a lot of contractors are claiming they install it. Here's how to separate the real ones.",
    publishedAt: "2026-02-12",
    readTimeMin: 5,
    heroImage:
      "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=1600&fit=crop&fm=jpg&q=85",
    ogImage:
      "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=1200&h=630&fit=crop&fm=jpg&q=85",
    tags: ["contractor", "guide", "microcement", "new orleans"],
    sections: [
      { type: "p", content: "Microcement looks simple — it's a thin, hand-applied coating. That's exactly why so many general contractors and painters have started saying they install it. The problem: microcement isn't paint. It's a craft. The difference between a great install and a failure shows up in months, not years." },
      { type: "p", content: "Before you hire anyone in New Orleans (us included), here are the seven questions worth asking." },
      { type: "h2", content: "1. How many full microcement projects have you personally installed?" },
      { type: "p", content: "Not how many projects their crew has touched. How many they themselves have hand-applied start to finish. Microcement is a feel-based craft — minimum 10 completed installs is the floor before someone should be running your project." },
      { type: "h2", content: "2. Can I see a microcement shower you installed at least 18 months ago?" },
      { type: "p", content: "Anyone can show photos from week one. The real test is what the surface looks like 18+ months into daily use. Ask to visit (or video-call) a real installation that's been lived in." },
      { type: "h2", content: "3. What primer and sealer system do you use?" },
      { type: "p", content: "There's no universal answer — but the contractor should name a specific system (Topciment, Mortex, Pandomo, etc.) and explain why they chose it for your substrate. 'We figure it out as we go' is the wrong answer." },
      { type: "h2", content: "4. How do you handle expansion joints and corners?" },
      { type: "p", content: "Corners are where microcement either looks like a million bucks or fails inside 6 months. If a contractor can't explain their corner detail in 30 seconds, walk away." },
      { type: "h2", content: "5. Do you carry liability insurance and a Louisiana contractor's license?" },
      { type: "p", content: "Non-negotiable. Ask for both certificates of insurance and the LSLBC license number. Verify it on the Louisiana State Licensing Board site." },
      { type: "h2", content: "6. What's your timeline — and what happens if you go over?" },
      { type: "p", content: "Microcement requires curing time between coats. A 'we'll finish in 3 days' claim for a full bathroom is a red flag. Realistic NOLA timeline: 4–7 days for a single bathroom." },
      { type: "h2", content: "7. Will you give me an actual finish sample before applying?" },
      { type: "p", content: "Microcement color and texture is subtle. A real installer will hand-apply a small finish sample on a board so you can see — in your actual lighting — what the final wall will look like. If they refuse, that's a problem." },
      { type: "h2", content: "One bonus question" },
      { type: "p", content: "'Can I see your portfolio of NOLA-area installs?' Local matters. New Orleans humidity, slab foundations, and older substrates are different beasts than dry-climate microcement work. Make sure your contractor has actually solved problems in this city." },
      { type: "cta", text: "See our microcement portfolio and request a quote", href: "/microcement-new-orleans" },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "tadelakt-vs-microcement-bathroom",
    title: "Tadelakt vs. Microcement: Which Seamless Surface Wins for Your Bathroom?",
    description:
      "Tadelakt and microcement both deliver seamless, waterproof bathrooms. Here's the real difference — when to choose each, and what each one costs in New Orleans.",
    excerpt:
      "They look similar in photos. They're radically different in practice. Here's how to choose the right one for your specific bathroom.",
    publishedAt: "2026-02-14",
    readTimeMin: 5,
    heroImage:
      "https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=1600&fit=crop&fm=jpg&q=85",
    ogImage:
      "https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=1200&h=630&fit=crop&fm=jpg&q=85",
    tags: ["tadelakt", "microcement", "comparison", "bathroom"],
    sections: [
      { type: "p", content: "If you've already decided you don't want tile, your next decision is usually between tadelakt and microcement. The Instagram aesthetic is similar — soft, seamless, modern — but the materials, installation, and final feel are genuinely different." },
      { type: "h2", content: "Material" },
      { type: "p", content: "Microcement is a cement-based polymer-modified coating. It's engineered. Modern. Comes in dozens of colors. Tadelakt is traditional Moroccan lime plaster, finished with olive-oil soap. It's a craft from the 1100s. Both are real options — they're just answering different questions." },
      { type: "h2", content: "Waterproofing" },
      { type: "p", content: "Microcement is waterproof when sealed with a topcoat. Tadelakt is naturally waterproof from chemistry alone — lime + olive soap creates a self-sealing surface that's been used in Moroccan steam baths for 800+ years." },
      { type: "h2", content: "Look and feel" },
      { type: "p", content: "Microcement reads modern, industrial, minimalist. Walls feel smooth and cool. Tadelakt reads warm, sculptural, hand-finished. The surface has depth and slight texture — the kind of finish you keep touching." },
      { type: "h2", content: "Cost in New Orleans" },
      { type: "ul", items: [
        "Microcement bathroom: $5,000 – $9,500",
        "Tadelakt shower: $6,500 – $12,000",
        "Full tadelakt bathroom: $9,000 – $18,000",
      ]},
      { type: "p", content: "Tadelakt is hand-burnished with river stones. The labor hours per square foot are 2–3x what microcement requires. That's the price gap." },
      { type: "h2", content: "When microcement is the right call" },
      { type: "ul", items: [
        "You want a clean, modern, hotel-style look",
        "You're renovating multiple rooms (kitchen, floors, etc.) and want a unified finish",
        "Budget is a real constraint",
        "Your timeline matters (2–5 days vs. 5–8 for tadelakt)",
      ]},
      { type: "h2", content: "When tadelakt is the right call" },
      { type: "ul", items: [
        "You want a hand-finished, deeply textured aesthetic",
        "You're doing a single feature space (master shower, powder room)",
        "You appreciate craft heritage — this is genuinely an 800-year-old technique",
        "Mold and bacteria resistance matters to you (lime's high pH naturally suppresses both)",
      ]},
      { type: "p", content: "Most of our New Orleans clients pick microcement for floors, tubs, and full bathrooms — and tadelakt for the shower itself or a single feature wall. Combining both in one bathroom is genuinely a beautiful move." },
      { type: "cta", text: "Preview both finishes for your bathroom — free", href: "/upload" },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: "why-tile-fails-in-new-orleans-humidity",
    title: "Why Tile Fails in New Orleans Humidity (And What to Use Instead)",
    description:
      "Tile bathrooms in New Orleans homes routinely fail at the grout. Here's why — and the seamless alternatives that thrive in NOLA's wet climate.",
    excerpt:
      "Walk into any 15-year-old bathroom in this city and you'll see the same failure pattern. It's not the tile that's failing — it's everything between the tiles.",
    publishedAt: "2026-02-16",
    readTimeMin: 4,
    heroImage:
      "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=1600&fit=crop&fm=jpg&q=85",
    ogImage:
      "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=1200&h=630&fit=crop&fm=jpg&q=85",
    tags: ["humidity", "tile failure", "new orleans", "microcement"],
    sections: [
      { type: "p", content: "New Orleans averages 76% relative humidity year-round. That's higher than Houston. Higher than Miami. And it's the single biggest reason why traditional tile bathrooms in this city fail decades earlier than they would anywhere else." },
      { type: "h2", content: "Where tile actually fails" },
      { type: "p", content: "It's never the tile itself. Tile is fired clay or porcelain — it lasts essentially forever. The failure happens in:" },
      { type: "ul", items: [
        "Grout joints (cement-based, porous, absorbs moisture)",
        "Caulk at tub and shower edges (cracks within 12–24 months)",
        "The substrate behind the tile (drywall + thinset can soften when moisture penetrates the grout)",
      ]},
      { type: "p", content: "In a typical NOLA shower, moisture penetrates grout within 6 months of install. The grout absorbs, holds it, and slowly releases it back into the room. That's where the black mold lines come from. The tile is fine — the grid around it is hosting a microbial party." },
      { type: "h2", content: "The math" },
      { type: "p", content: "An average tile shower in this city needs:" },
      { type: "ul", items: [
        "Re-caulking every 12–24 months",
        "Grout sealing every 2–3 years",
        "Re-grouting after about 8–10 years",
        "Substrate repair after about 12–15 years if moisture penetration goes uncaught",
      ]},
      { type: "p", content: "Multiply that by every tile bathroom in your house and you can see why the long-term cost of tile in NOLA is so much higher than the install number suggests." },
      { type: "h2", content: "What we recommend instead" },
      { type: "p", content: "Seamless surfaces — microcement, tadelakt, micro quartz — eliminate the failure mode entirely. There's nothing to absorb moisture. Nothing to seal. Nothing to scrub. One continuous waterproof skin from floor to ceiling." },
      { type: "p", content: "For New Orleans specifically, our top recommendations are:" },
      { type: "ul", items: [
        "Microcement — best general-purpose bathroom finish",
        "Tadelakt — best for the shower wall and tub surround specifically",
        "Micro quartz — best where you want a slightly more luxurious feel and slightly higher slip resistance",
      ]},
      { type: "h2", content: "The bottom line" },
      { type: "p", content: "Tile isn't broken in dry climates. In New Orleans, it's fighting a battle it can't win. Seamless surfaces aren't just a trend — they're the right material answer for the climate." },
      { type: "cta", text: "See your bathroom in a seamless finish — free preview", href: "/upload" },
    ],
  },
];

export const BLOG_POSTS_BY_SLUG = Object.fromEntries(BLOG_POSTS.map((p) => [p.slug, p]));
