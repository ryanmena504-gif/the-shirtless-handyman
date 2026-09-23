import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import { InstantQuoteForm } from "../components/InstantQuoteForm";
import { TrustStrip } from "../components/TrustStrip";
import { PricingCalculator } from "../components/PricingCalculator";
import { GoogleReviews } from "../components/GoogleReviews";
import { SeoHead } from "../components/SeoHead";
import { RevealText, ScrollReveal, MagneticButton } from "../components/cinematic";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, DollarSign, ChevronRight, MessageCircle, Phone, Droplets, ShieldCheck, Paintbrush, AlertCircle, Layers, CalendarCheck, Wrench, Home, Clock, CheckCircle, Star, Gem, Hammer, User } from "lucide-react";

const HERO_BG = "/portfolio/shower-led-niche.jpg";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const TEL_LINK = "tel:5042644919";

// ---- Global JSON-LD entity block ----------------------------------------
// One graph that names the business (LocalBusiness/HomeAndConstructionBusiness),
// the person (Ryan Mena), the website, and the core services. LLMs treat this
// as the authoritative "who / what / where" for the entity behind the domain.
const SITE_URL = "https://theshirtlesshandyman.com";
const GLOBAL_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeAndConstructionBusiness",
      "@id": `${SITE_URL}/#business`,
      name: "The Shirtless Handyman",
      alternateName: ["Shirtless Handyman", "The Shirtless Handyman NOLA"],
      url: SITE_URL,
      logo: `${SITE_URL}/portfolio/microcement-vanity-bathroom.jpg`,
      image: `${SITE_URL}/portfolio/shower-led-niche.jpg`,
      description:
        "Owner-operated microcement, tadelakt, and seamless-surface installation studio in New Orleans, Louisiana. Founder Ryan Mena personally installs every project — no subcontractors, no franchise.",
      telephone: "+1-504-264-4919",
      email: "ryan@theshirtlesshandyman.com",
      priceRange: "$$-$$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Orleans",
        addressRegion: "LA",
        addressCountry: "US",
      },
      areaServed: [
        { "@type": "City", name: "New Orleans" },
        { "@type": "City", name: "Metairie" },
        { "@type": "City", name: "Kenner" },
        { "@type": "City", name: "Harahan" },
        { "@type": "City", name: "Gretna" },
        { "@type": "City", name: "Harvey" },
        { "@type": "City", name: "Chalmette" },
        { "@type": "City", name: "Slidell" },
      ],
      geo: {
        "@type": "GeoCoordinates",
        latitude: 29.9511,
        longitude: -90.0715,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "17:00",
        },
      ],
      founder: { "@id": `${SITE_URL}/about#ryan` },
      employee: { "@id": `${SITE_URL}/about#ryan` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Seamless bathroom packages",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Essential Seamless Bathroom Overlay", description: "Microcement or tadelakt overlay on an existing bathroom footprint. Starting at $5,500. Most qualifying overlays range from $5,500–$9,500." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 5500, maxPrice: 9500, priceCurrency: "USD" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Signature Grout-Free Bathroom Transformation", description: "Full bathroom rebuild in seamless surfaces — walls, floor, shower in one continuous shell with new fixtures and lighting. Starting at $15,000. Most Signature transformations range from $18,000–$35,000+. Includes up to 30 sq ft of radiant heated flooring at no additional charge." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 15000, maxPrice: 35000, priceCurrency: "USD" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Luxury Seamless Wet Room", description: "Fully custom wet-room build with rockscape or feature-wall integration, radiant heat, layered lighting, and bespoke finishes. Starting at $30,000. Custom luxury projects are priced individually." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 30000, priceCurrency: "USD" },
          },
        ],
      },
      knowsAbout: [
        "Microcement", "Tadelakt", "Venetian plaster", "Marmorino", "Rockscape walls",
        "Pool deck resurfacing", "Seamless waterproof coatings", "Beton cire",
        "Moroccan lime plaster", "Cocciopesto", "Microterrazzo",
      ],
      slogan: "One craftsman. Zero grout. Real materials.",
      sameAs: [
        // Fill in once GBP / Yelp / Facebook / Instagram are live:
        // "https://www.google.com/maps/place/?q=place_id:XXXX",
        // "https://www.yelp.com/biz/the-shirtless-handyman-new-orleans",
        // "https://www.facebook.com/theshirtlesshandyman",
        // "https://www.instagram.com/theshirtlesshandyman",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#ryan`,
      name: "Ryan Mena",
      jobTitle: "Microcement & Seamless Surface Craftsman",
      description:
        "New Orleans-born craftsman and founder of The Shirtless Handyman. Personally installs microcement, tadelakt, and rockscape projects across the greater New Orleans metro.",
      worksFor: { "@id": `${SITE_URL}/#business` },
      knowsAbout: ["Microcement", "Tadelakt", "Venetian plaster", "Rockscape walls", "Pool deck resurfacing"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Orleans",
        addressRegion: "LA",
        addressCountry: "US",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Shirtless Handyman",
      publisher: { "@id": `${SITE_URL}/#business` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/faq?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const SERVICES = [
  {
    title: "Microcement",
    finishId: "microcement",
    description: "Seamless waterproof showers, floors, and walls — installed directly over existing tile.",
    image: "/portfolio/shower-led-niche.jpg",
    priceRange: "From $5,500",
  },
  {
    title: "Tadelakt",
    finishId: "tadelakt",
    description: "Hand-burnished Moroccan lime plaster. Naturally waterproof. 800-year-old craft.",
    image: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From $5,500",
  },
  {
    title: "Venetian Plaster",
    finishId: "venetian",
    description: "Mirror-polished Italian lime plaster. Marbled depth that catches the light. A Renaissance finish, hand-applied today.",
    image: "/venetian-plaster-hero.jpg",
    priceRange: "From $1,800",
  },
  {
    title: "Rockscape Walls",
    finishId: "rockscape",
    description: "Sculpted feature walls that look like carved stone. Optional LED backlighting.",
    image: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From $3,500",
  },
  {
    title: "Pool Decks & Outdoor",
    finishId: "microterrazzo",
    description: "Microterrazzo + cocciopesto resurfacing. UV-stable. Slip-resistant. Built for NOLA sun.",
    image: "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From $3,000",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  // Scroll-to-hash: when the URL includes #finishes / #pricing / #how-it-works,
  // smooth-scroll to that section after render. Runs on mount and on hash
  // changes so nav links from anywhere on the site land in the right place.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash?.replace("#", "");
      if (!hash) return;
      // Wait a tick so the target is definitely mounted
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <SeoHead
        title="The Shirtless Handyman | Microcement, Tadelakt & Seamless Surfaces in New Orleans"
        description="I'm Ryan Mena. I install microcement, tadelakt, and custom rockscape walls in New Orleans homes — no demolition, no grout, no tile. Free design preview. Text: 504-264-4919."
        canonical="https://theshirtlesshandyman.com/"
        ogImage="https://theshirtlesshandyman.com/portfolio/shower-led-niche.jpg"
      >
        <script type="application/ld+json">{JSON.stringify(GLOBAL_SCHEMA)}</script>
      </SeoHead>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] overflow-hidden" data-testid="hero-section">
        <motion.img
          src={HERO_BG}
          alt="Seamless microcement shower wall installed by The Shirtless Handyman in New Orleans"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

        <div className="relative z-10 h-full flex items-center min-h-[92vh]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl">
              <motion.p
                className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Microcement & Seamless Surface Specialist · New Orleans, LA
              </motion.p>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-white mb-6"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                <RevealText text="Seamless surfaces," as="span" className="block" delay={0.25} />
                <RevealText text="hand-troweled in" as="span" className="block" delay={0.45} />
                <RevealText text="New Orleans." as="span" className="block italic" delay={0.65} />
              </h1>

              <motion.p
                className="text-base md:text-lg leading-relaxed text-white/75 mb-3 max-w-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                Microcement, tadelakt, and mineral plaster — built for New Orleans humidity, where grout goes black and mold finds every seam.
              </motion.p>

              <motion.p
                className="text-sm text-white/50 mb-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Personally installed by Ryan Mena · NOLA, Metairie &amp; Westbank.
              </motion.p>

              {/* CTAs — one clear, singular action so visitors know exactly what this site does */}
              <motion.div
                className="flex flex-col items-start gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <MagneticButton>
                  <Button
                    onClick={() => navigate("/upload")}
                    className="h-14 px-9 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-xl shadow-[#D97757]/30 hover:bg-[#C56545]"
                    data-testid="hero-studio-btn"
                  >
                    <Sparkles className="w-5 h-5 mr-2.5" />
                    Visualize my room
                  </Button>
                </MagneticButton>
                <p className="text-sm text-white/50">
                  Upload a photo — see it in microcement in ~60 seconds. Free.{" "}
                  <a href="#finishes" className="text-white/70 hover:text-white underline underline-offset-2" data-testid="hero-finishes-anchor">
                    Or explore finishes ↓
                  </a>
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/45 text-[10px] uppercase tracking-[0.3em] font-semibold pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <span>Scroll</span>
          <motion.div
            className="w-px h-10 bg-white/40"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </motion.div>
      </section>

      {/* Trust strip — right under the hero, sets the bar before scrolling */}
      <TrustStrip variant="dark" />

      {/* Google Reviews — auto-hides if API key not yet configured */}
      <GoogleReviews variant="light" />

      {/* ===== FINISHES / WHAT I DO ===== */}
      {/* ===== FEATURED WORK — 3 large project-type cards ===== */}
      <section id="finishes" className="py-20 md:py-28 px-6 md:px-12 bg-background" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
              Featured Work
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Three types of rooms.<br />
              <span className="italic">One seamless philosophy.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                slug: "wet-rooms",
                image: "/portfolio/shower-led-niche.jpg",
                title: "Wet rooms",
                materials: "Microcement · Tadelakt · Rockscape",
                desc: "Showers, tub surrounds, and full bathroom walls installed as one continuous, waterproof surface — right over your existing tile. Zero grout, zero seams, zero mold habitat.",
                finishHint: "microcement",
              },
              {
                slug: "architectural-walls",
                image: "/venetian-plaster-hero.jpg",
                title: "Architectural walls",
                materials: "Venetian plaster · Marmorino · Rockscape",
                desc: "Feature walls, fireplaces, dining rooms, and powder baths. Hand-troweled Italian and Moroccan plasters that catch the light and turn a flat wall into the room's centerpiece.",
                finishHint: "venetian",
              },
              {
                slug: "floors-outdoor",
                image: "/portfolio/microcement-vanity-bathroom.jpg",
                title: "Floors &amp; outdoor",
                materials: "Microcement · Microterrazzo · Cocciopesto",
                desc: "Continuous floors that flow from room to room. Pool decks, patios, and outdoor surfaces built for New Orleans sun and humidity. UV-stable, slip-resistant, and won't crack at the joints.",
                finishHint: "microterrazzo",
              },
            ].map((cat, i) => (
              <ScrollReveal key={cat.slug} delay={i * 0.08}>
                <button
                  onClick={() => navigate(`/upload?finish=${cat.finishHint}`)}
                  data-cursor="view"
                  data-cursor-label="Visualize"
                  className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden text-left bg-muted hover:shadow-xl transition-shadow"
                  data-testid={`featured-work-${cat.slug}`}
                >
                  <motion.img
                    src={cat.image}
                    alt={`${cat.title.replace('&amp;', '&')} — seamless surface work by The Shirtless Handyman, New Orleans`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
                  <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3">
                      {cat.materials}
                    </p>
                    <h3
                      className="text-3xl md:text-4xl font-light mb-3 leading-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                      dangerouslySetInnerHTML={{ __html: cat.title }}
                    />
                    <p className="text-sm text-white/70 mb-4 leading-relaxed">{cat.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:text-[#D97757] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY SEAMLESS — 3 mold-forward bullets ===== */}
      <section className="py-14 md:py-20 px-6 md:px-12 bg-[#0E0E0E]" data-testid="why-seamless-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              Why Seamless
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Built for NOLA humidity —<br />
              <span className="italic text-white/70">not generic "wet areas."</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              {
                icon: Droplets,
                title: "No grout, no mold habitat",
                desc: "Grout is porous cement. It absorbs. It holds moisture. That's where mold lives. Seamless surfaces have none.",
              },
              {
                icon: Layers,
                title: "No joints, no place to sneak behind",
                desc: "Every seam is a chance for water to work its way through. My installs have zero — one continuous surface, wall to floor to niche.",
              },
              {
                icon: ShieldCheck,
                title: "Waterproof for New Orleans, specifically",
                desc: "Not a generic wet-area system. Every material I use is chosen for 76% humidity, foundation shift, and how NOLA houses actually sweat.",
              },
            ].map((bullet, i) => (
              <div
                key={bullet.title}
                className="flex flex-col gap-3"
                data-testid={`why-seamless-bullet-${i}`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <bullet.icon className="w-5 h-5 text-[#D97757]" />
                </div>
                <h3 className="text-base font-semibold text-white leading-tight">
                  {bullet.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">{bullet.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING CALCULATOR — instant estimate ===== */}
      <div id="pricing">
        <PricingCalculator />
      </div>

      {/* ===== MEET RYAN ===== (warm hybrid palette: light bone bg, warm taupe accents) */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F5F1EA] relative overflow-hidden" data-testid="meet-ryan-section">
        {/* Subtle plaster-grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <ScrollReveal className="order-2 md:order-1" delay={0.1}>
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F0E8D8]">
                <img
                  src="/ryan-mena-illustration.jpg"
                  alt="Ryan Mena — The Shirtless Handyman — illustration"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 px-1">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-1">
                  Ryan Mena
                </p>
                <p className="text-lg font-light text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
                  Founder · Craftsman · NOLA-born
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="order-1 md:order-2" delay={0.25}>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
                Meet Ryan
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[#1A3C34] mb-6 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                I used to install tile.<br />
                <span className="italic">I stopped.</span>
              </h2>
              <div className="space-y-4 text-base text-[#1A3C34]/80 leading-relaxed">
                <p>
                  I'm Ryan, born and raised in New Orleans. I spent years installing tile in NOLA bathrooms — and watching that exact same tile fail inside a decade. It's not the tile's fault. It's just the wrong material for this climate.
                </p>
                <p>
                  So I went and learned the alternative. Microcement. Tadelakt. Marmorino. Sculpted rockscape. Surfaces that don't have seams to fail. Surfaces that look like a Tulum hotel or a Moroccan riad — and last in NOLA humidity for decades.
                </p>
                <p>
                  Now that's all I do. One craftsman. Real materials. Photos of every step. <strong className="text-[#1A3C34] font-semibold">You text me, I show up, I treat your home like my own.</strong> That's the whole pitch.
                </p>
              </div>

              {/* Pull-quote — proven copy, elevated so it lands hard */}
              <blockquote
                className="mt-8 mb-8 border-l-4 border-[#D97757] pl-5 md:pl-6"
                data-testid="ryan-pull-quote"
              >
                <p
                  className="text-2xl md:text-3xl lg:text-[2rem] font-light leading-[1.2] text-[#1A3C34] tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  &ldquo;Grout turning black. Caulk peeling. Mold finding the smallest seam.&rdquo;
                </p>
                <footer className="mt-3 text-xs uppercase tracking-[0.22em] font-bold text-[#D97757]">
                  — Every NOLA bathroom I&rsquo;ve been called back to
                </footer>
              </blockquote>

              <div className="flex flex-wrap gap-3">
                <a href={SMS_LINK}>
                  <MagneticButton>
                    <Button className="h-12 px-6 rounded-full bg-[#1A3C34] text-white hover:bg-[#0E2A24] font-medium" data-testid="meet-ryan-text-btn">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Text me directly
                    </Button>
                  </MagneticButton>
                </a>
                <a
                  href="https://g.page/r/CZgh4ltLoG1SEBI/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-[#1A3C34]/25 text-[#1A3C34] hover:bg-[#1A3C34]/5 text-sm font-medium transition-colors"
                  data-testid="meet-ryan-review-link"
                >
                  <Star className="w-4 h-4" />
                  Worked with me? Leave a Google review
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (simplified) ===== */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              Process
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Three steps. That's it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0">
            {[
              { num: "01", icon: Upload, title: "Share your space", desc: "Snap a photo of the room, wall, floor, or outdoor area you want to transform." },
              { num: "02", icon: Sparkles, title: "Align on finish and scope", desc: "See it redesigned in The Seamless Studio, then we lock finish, scope, and budget together." },
              { num: "03", icon: CalendarCheck, title: "I build it", desc: "One craftsman, one continuous surface. In and out — no subcontractors, no surprises." },
            ].map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center px-6 py-8" data-testid={`step-${i}`}>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-[52px] left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border/60" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5 relative z-10">
                  <step.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xs font-bold text-[#D97757] mb-2">{step.num}</span>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTRACTOR PARTNERS — compact strip, full pitch on /contractors ===== */}
      <section className="py-10 px-6 md:px-12 bg-[#0E0E0E] border-y border-white/10" data-testid="contractor-partner-section">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-2">
              For Contractors &amp; Remodelers
            </p>
            <p className="text-base md:text-lg text-white/85 leading-snug" style={{ fontFamily: "'Fraunces', serif" }}>
              You run the job. I install the seamless surface — microcement, tadelakt, venetian, rockscape. Bill more, same schedule.
            </p>
          </div>
          <button
            onClick={() => navigate("/contractors")}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-white/25 text-white hover:bg-white/10 text-sm font-medium whitespace-nowrap transition-colors"
            data-testid="contractor-strip-cta"
          >
            See how it works
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              Pricing
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Three ways I build seamless.
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Every seamless bathroom I install falls into one of three tiers. The Seamless Studio helps you (and me) figure out which one fits your space before I quote a fixed number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {/* Tier 1 — Essential */}
            <div className="bg-white border border-border/40 rounded-2xl p-8 flex flex-col" data-testid="pricing-essential">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Wrench className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3
                className="text-xl font-medium text-foreground mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Essential Seamless Bathroom Overlay
              </h3>
              <p className="text-xs text-muted-foreground mb-5">Single bathroom, existing footprint</p>
              <p className="text-3xl font-semibold text-foreground mb-1">Starting at $5,500</p>
              <p className="text-xs text-muted-foreground mb-6">Most qualifying overlays range from $5,500–$9,500.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Microcement or tadelakt over existing tile (when stable)",
                  "One shower or tub surround",
                  "Standard bathroom footprint",
                  "Little or no demolition on qualifying projects",
                  "5-year bond warranty, 1-year seal warranty",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={SMS_LINK} className="mt-auto">
                <Button variant="outline" className="w-full h-11 rounded-full border-border/60 text-foreground text-sm font-medium">
                  See If Your Bathroom Qualifies
                </Button>
              </a>
            </div>

            {/* Tier 2 — Signature (highlighted) */}
            <div className="bg-[#0E0E0E] border-2 border-[#D97757]/40 rounded-2xl p-8 flex flex-col relative" data-testid="pricing-signature">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-[#D97757] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#D97757]/15 flex items-center justify-center mb-5">
                <Paintbrush className="w-5 h-5 text-[#D97757]" />
              </div>
              <h3
                className="text-xl font-medium text-white mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Signature Grout-Free Bathroom Transformation
              </h3>
              <p className="text-xs text-white/40 mb-5">Full bathroom rebuild in seamless</p>
              <p className="text-3xl font-semibold text-white mb-1">Starting at $15,000</p>
              <p className="text-xs text-white/40 mb-6">Most Signature transformations range from $18,000–$35,000+.</p>
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  "Walls, floor, and shower in one continuous shell",
                  "Fixture upgrades + integrated lighting",
                  "Selective demolition + waterproofing rebuild",
                  "New plumbing runs & niche builds",
                  "Custom color, texture, and hand-finish",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-[#D97757]/30 bg-[#D97757]/10 px-4 py-3 mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-1">
                  Included, at no charge
                </p>
                <p className="text-xs text-white/80 leading-relaxed">
                  Every qualifying Signature Grout-Free Bathroom Transformation includes up to 30 square feet of radiant heated flooring at no additional charge.
                </p>
              </div>
              <Button
                onClick={() => {
                  const formEl = document.querySelector('[data-testid="instant-quote-form-hero_form"]');
                  formEl?.scrollIntoView({ behavior: "smooth", block: "center" });
                  formEl?.querySelector('input')?.focus();
                }}
                className="w-full h-11 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545] mt-auto"
                data-testid="pricing-signature-cta"
              >
                Get a Seamless Transformation Quote
              </Button>
            </div>

            {/* Tier 3 — Luxury */}
            <div className="bg-white border border-border/40 rounded-2xl p-8 flex flex-col" data-testid="pricing-luxury">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Home className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3
                className="text-xl font-medium text-foreground mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Luxury Seamless Wet Room
              </h3>
              <p className="text-xs text-muted-foreground mb-5">Fully custom, no-limits build</p>
              <p className="text-3xl font-semibold text-foreground mb-1">Starting at $30,000</p>
              <p className="text-xs text-muted-foreground mb-6">Custom luxury projects are priced individually.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Open-plan wet-room layouts",
                  "Rockscape or feature-wall integration",
                  "Radiant floor heating included",
                  "Layered lighting + smart controls",
                  "Bespoke tadelakt or Venetian finishes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={SMS_LINK} className="mt-auto">
                <Button variant="outline" className="w-full h-11 rounded-full border-border/60 text-foreground text-sm font-medium">
                  Request a Bathroom Assessment
                </Button>
              </a>
            </div>
          </div>

          <p className="text-center text-xs md:text-sm text-muted-foreground/80 mt-10 max-w-2xl mx-auto leading-relaxed">
            Final pricing depends on substrate condition, square footage, waterproofing requirements, plumbing, fixtures, electrical work, access, and finish complexity.
          </p>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="closing-cta-section">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0E0E0E] rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D97757]/10 via-transparent to-transparent" />
            <div className="relative z-10 p-12 md:p-20">
              <div className="max-w-xl mx-auto text-center">

                <h2
                  className="text-3xl md:text-5xl font-light tracking-tight text-white mb-5 leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Bring me your room,<br />idea, or rough budget.
                </h2>

                <p className="text-base text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
                  Upload a photo and see it in microcement in ~60 seconds. Or text me — I answer them all personally.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-5">
                  <Button
                    onClick={() => navigate("/upload")}
                    className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                    data-testid="closing-upload-btn"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Visualize my room
                  </Button>
                  <a href={SMS_LINK} data-testid="closing-text-btn">
                    <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 text-base font-medium w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Text me — {PHONE}
                    </Button>
                  </a>
                </div>

                <p className="text-xs text-white/25">
                  Free preview. No account needed. Takes 60 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/40 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Review CTA — prominent, top of the footer */}
          <div className="bg-[#0E0E0E] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-2">
                Worked with me?
              </p>
              <p className="text-white text-lg md:text-xl font-light" style={{ fontFamily: "'Fraunces', serif" }}>
                Your Google review helps other NOLA homeowners find me.
              </p>
              <p className="text-white/60 text-xs mt-1">
                Takes 30 seconds. No account required if you&rsquo;re already signed into Google.
              </p>
            </div>
            <a
              href="https://g.page/r/CZgh4ltLoG1SEBI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#0E0E0E] font-semibold text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
              data-testid="footer-google-review-cta"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Leave a Google review
            </a>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} The Shirtless Handyman. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Serving Greater New Orleans &middot; {PHONE} &middot; ryanmena@theshirtlesshandyman.com
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <button onClick={() => navigate("/portfolio")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-portfolio">Work</button>
              <a href="/#finishes" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-finishes">Finishes</a>
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-process">Process</a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-pricing">Pricing</a>
              <button onClick={() => navigate("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-about">About</button>
              <button onClick={() => navigate("/contractors")} className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors" data-testid="footer-contractors">For Contractors</button>
              <button onClick={() => navigate("/admin")} className="text-sm text-muted-foreground/40 hover:text-foreground transition-colors" data-testid="footer-admin-link">Admin</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

