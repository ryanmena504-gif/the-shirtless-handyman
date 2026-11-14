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
import { ArrowRight, Upload, Sparkles, DollarSign, ChevronRight, MessageCircle, Phone, Droplets, ShieldCheck, Paintbrush, AlertCircle, Layers, CalendarCheck, Wrench, Home, Clock, CheckCircle, Star, Gem, Hammer, User, Flame, ClipboardCheck, HandCoins, Search, Mail, MapPin } from "lucide-react";
import { TEL_LINK as TEL_HREF, EMAIL, HOURS_LABEL, SERVICE_AREA_LABEL, HEATED_FLOORS_OFFER_SHORT, HEATED_FLOORS_OFFER_LONG, scrollToQuoteForm, PRICING_HEADLINE, PRICING_SUBHEAD, PRICE_SHOWER, PRICE_FULL_BATH, PRICE_FULL_BATH_RANGE, PRICE_WALLS } from "../lib/contact";
import { HOME_FAQ, TESTIMONIALS, BEFORE_AFTER, SERVICE_LINKS, WATERPROOF_STEPS } from "../lib/homeContent";

const HERO_BG = "/portfolio/shower-led-niche.jpg";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const TEL_LINK = TEL_HREF;

// ---- Global JSON-LD entity block ----------------------------------------
// One graph that names the business (LocalBusiness/HomeAndConstructionBusiness),
// the person (Ryan Mena), the website, and the core services. LLMs treat this
// as the authoritative "who / what / where" for the entity behind the domain.
const SITE_URL = "https://www.theshirtlesshandyman.com";
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
      email: "ryanmena@theshirtlesshandyman.com",
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
        { "@type": "City", name: "Mandeville" },
        { "@type": "City", name: "Covington" },
        { "@type": "City", name: "Madisonville" },
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
          opens: "09:00",
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
            itemOffered: { "@type": "Service", name: "Seamless Shower", description: "Microcement or tadelakt shower or tub surround, often over existing tile when it's stable. Starting around $3,000. Quoted per project after a free site visit." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 3000, priceCurrency: "USD" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Full Seamless Bathroom", description: "Walls, floor, and shower in one continuous waterproof shell. Starting around $6,000; most land between $6,000 and $10,000. Includes free underfloor heating, supplied and installed at no charge." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 6000, maxPrice: 10000, priceCurrency: "USD" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Venetian Plaster & Feature Walls", description: "Venetian plaster, marmorino, Roman clay, and rockscape feature walls. Starting around $3,000. Quoted per project after a free site visit." },
            priceCurrency: "USD",
            priceSpecification: { "@type": "PriceSpecification", minPrice: 3000, priceCurrency: "USD" },
          },
        ],
      },
      knowsAbout: [
        "Microcement", "Tadelakt", "Venetian plaster", "Marmorino", "Rockscape walls",
        "Pool deck resurfacing", "Seamless waterproof coatings", "Beton cire",
        "Moroccan lime plaster", "Cocciopesto", "Microterrazzo",
      ],
      slogan: "No grout. No seams. No mold.",
      makesOffer: {
        "@type": "Offer",
        name: "Free underfloor heating",
        description: "Underfloor heating system purchased and installed free with any whole-bathroom renovation or whole-floor coating.",
        price: "0",
        priceCurrency: "USD",
      },
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
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: HOME_FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

const SERVICES = [
  {
    title: "Microcement",
    finishId: "microcement",
    description: "Seamless waterproof showers, floors, and walls — installed directly over existing tile.",
    image: "/portfolio/shower-led-niche.jpg",
    priceRange: "From around $3,000",
  },
  {
    title: "Tadelakt",
    finishId: "tadelakt",
    description: "Hand-burnished Moroccan lime plaster. Naturally waterproof. 800-year-old craft.",
    image: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From around $3,000",
  },
  {
    title: "Venetian Plaster",
    finishId: "venetian",
    description: "Mirror-polished Italian lime plaster. Marbled depth that catches the light. A Renaissance finish, hand-applied today.",
    image: "/venetian-plaster-hero.jpg",
    priceRange: "From around $3,000",
  },
  {
    title: "Rockscape Walls",
    finishId: "rockscape",
    description: "Sculpted feature walls that look like carved stone. Optional LED backlighting.",
    image: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From around $3,500",
  },
  {
    title: "Pool Decks & Outdoor",
    finishId: "microterrazzo",
    description: "Microterrazzo + cocciopesto resurfacing. UV-stable. Slip-resistant. Built for NOLA sun.",
    image: "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=900&fit=crop&fm=jpg&q=85",
    priceRange: "From around $3,000",
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
        title="Microcement Showers & Bathrooms New Orleans | No Grout, No Mold — The Shirtless Handyman"
        description="Seamless, waterproof microcement showers, bathrooms, Venetian plaster & countertops in New Orleans + the Northshore. No grout, no seams, no mold. Free quote + free heated floors with a full bathroom. Call 504-264-4919."
        canonical="https://www.theshirtlesshandyman.com/"
        ogImage="https://www.theshirtlesshandyman.com/portfolio/shower-led-niche.jpg"
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

        <div className="relative z-10 h-full flex items-center min-h-[92vh] pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl">
              <motion.p
                className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Microcement Showers &amp; Bathrooms · New Orleans + Northshore
              </motion.p>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[0.95] text-white mb-6"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                <RevealText text="No grout." as="span" className="block" delay={0.25} />
                <RevealText text="No seams." as="span" className="block" delay={0.45} />
                <RevealText text="No mold." as="span" className="block italic" delay={0.65} />
              </h1>

              <motion.p
                className="text-base md:text-lg leading-relaxed text-white/75 mb-3 max-w-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                Seamless, waterproof microcement showers and full bathroom transformations — built for New Orleans humidity, where grout goes black and mold finds every seam.
              </motion.p>

              <motion.p
                className="text-sm text-white/50 mb-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Personally installed by Ryan Mena · New Orleans metro &amp; the Northshore.
              </motion.p>

              {/* Offer — the heated floors are the hook, so they sit above the fold */}
              <motion.p
                className="inline-flex items-center gap-2 text-sm text-white bg-[#D97757]/20 border border-[#D97757]/50 rounded-full px-4 py-1.5 mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.25 }}
                data-testid="hero-heated-offer"
              >
                <Flame className="w-4 h-4 text-[#D97757]" aria-hidden="true" />
                {HEATED_FLOORS_OFFER_SHORT}
              </motion.p>

              {/* CTAs — call first (phones), then the quote form right here */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <div className="flex flex-wrap gap-3">
                  <a href={TEL_LINK} data-testid="hero-call-btn">
                    <Button className="h-12 px-6 rounded-full bg-white text-[#0E0E0E] text-base font-semibold hover:bg-white/90">
                      <Phone className="w-4 h-4 mr-2" />
                      Call {PHONE}
                    </Button>
                  </a>
                  <a href={SMS_LINK} data-testid="hero-text-btn">
                    <Button variant="outline" className="h-12 px-6 rounded-full border-white/30 text-white hover:bg-white/10 text-base font-medium">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Text me
                    </Button>
                  </a>
                </div>
                <InstantQuoteForm id="quote" variant="dark" source="hero_form" className="max-w-xl" />
                <p className="text-sm text-white/55">
                  Want to see it first?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/upload")}
                    className="text-white/80 hover:text-white underline underline-offset-2"
                    data-testid="hero-studio-btn"
                  >
                    Preview your own room in microcement — free, ~60 sec
                  </button>
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

      {/* Marquee strip — Midnight Cement signature: one continuous line, like the surfaces */}
      <div className="overflow-hidden border-y border-white/10 bg-black/60 py-4" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy} className="whitespace-nowrap text-sm md:text-base uppercase tracking-[0.3em] font-semibold text-white/70 pr-8">
              No grout <span className="text-[#D97757] px-2">•</span> No tile <span className="text-[#D97757] px-2">•</span> No mold <span className="text-[#D97757] px-2">•</span> One seamless surface <span className="text-[#D97757] px-2">•</span> New Orleans <span className="text-[#D97757] px-2">•</span>&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Trust strip — right under the hero, sets the bar before scrolling */}
      <TrustStrip variant="dark" />

      {/* ===== WHAT IS MICROCEMENT? — most visitors have never heard of it ===== */}
      <section id="what-is-microcement" className="py-20 md:py-24 px-6 md:px-12 bg-[#F5F1EA]" data-testid="what-is-microcement-section">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">What is microcement?</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[#1A3C34] leading-tight mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
              Think of it as stone-look plaster with <span className="italic">no grout lines at all.</span>
            </h2>
            <div className="space-y-4 text-base text-[#1A3C34]/80 leading-relaxed">
              <p>
                Microcement is a thin, cement-based coating troweled on by hand in a few layers, then sealed. It
                covers walls, floors, showers, and counters as <strong className="font-semibold text-[#1A3C34]">one continuous surface</strong> —
                the look of polished concrete or natural stone, without tiles or grout.
              </p>
              <p>
                Why it matters in New Orleans: grout is porous, it stays damp, and that's where mold grows. No grout lines means no
                grout to go black, no re-grouting, and a shower that's easy to wipe down.
              </p>
              <p>
                And because it's only a few millimeters thick, it can often go right over existing tile once I've confirmed it's solid —
                less demolition, less mess, less time without a bathroom.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button
                onClick={() => scrollToQuoteForm()}
                className="h-12 px-6 rounded-full bg-[#1A3C34] text-white hover:bg-[#0E2A24] font-medium"
                data-testid="what-is-quote-btn"
              >
                Get my free quote <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="/faq" className="inline-flex items-center h-12 px-5 rounded-full border border-[#1A3C34]/25 text-[#1A3C34] hover:bg-[#1A3C34]/5 text-sm font-medium">
                Read the full FAQ
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="/portfolio/wetroom-shower-niche.jpg" alt="Seamless microcement shower with built-in niche, no grout lines — New Orleans" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full" />
            <img src="/portfolio/textured-plaster-closeup.jpg" alt="Close-up of hand-troweled microcement texture" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover w-full mt-8" />
          </div>
        </div>
      </section>

      {/* ===== WHAT I DO ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-background" data-testid="services-section">
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
                image: "/portfolio/wetroom-shower-niche.jpg",
                title: "Wet rooms",
                materials: "Microcement · Tadelakt · Rockscape",
                desc: "Showers, tub surrounds, and full bathroom walls installed as one continuous, waterproof surface — right over your existing tile. Zero grout, zero seams, zero mold habitat.",
                finishHint: "microcement",
                href: "/microcement-showers-new-orleans",
              },
              {
                slug: "architectural-walls",
                image: "/venetian-plaster-hero.jpg",
                title: "Architectural walls",
                materials: "Venetian plaster · Marmorino · Rockscape",
                desc: "Feature walls, fireplaces, dining rooms, and powder baths. Hand-troweled Italian and Moroccan plasters that catch the light and turn a flat wall into the room's centerpiece.",
                finishHint: "venetian",
                href: "/venetian-plaster-new-orleans",
              },
              {
                slug: "floors-outdoor",
                image: "/portfolio/microcement-bath-terracotta-floor.jpg",
                title: "Floors &amp; outdoor",
                materials: "Microcement · Microterrazzo · Cocciopesto",
                desc: "Continuous floors that flow from room to room. Pool decks, patios, and outdoor surfaces built for New Orleans sun and humidity. UV-stable, slip-resistant, and won't crack at the joints.",
                finishHint: "microterrazzo",
                href: "/bathroom-remodel-new-orleans",
              },
            ].map((cat, i) => (
              <ScrollReveal key={cat.slug} delay={i * 0.08}>
                <button
                  onClick={() => navigate(cat.href)}
                  data-cursor="view"
                  data-cursor-label="See more"
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
                      See how it works <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
          {/* Every service has its own page — good for Google and for visitors */}
          <div className="mt-10 flex flex-wrap justify-center gap-2.5" data-testid="service-links">
            {SERVICE_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/60 text-sm text-foreground hover:bg-[#1A3C34] hover:text-white hover:border-[#1A3C34] transition-colors"
              >
                {l.label} <ChevronRight className="w-3.5 h-3.5" />
              </a>
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

      {/* ===== HOW I WATERPROOF — the part people can't see and worry about ===== */}
      <section id="waterproofing" className="py-20 md:py-28 px-6 md:px-12 bg-background" data-testid="waterproofing-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">What's under the finish</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground leading-tight mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              How I waterproof your shower — <span className="italic">layer by layer.</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              The pretty part is the last few millimeters. What keeps water out of your walls is everything underneath —
              and I'll walk you through every layer for your bathroom before you sign anything.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WATERPROOF_STEPS.map((step, i) => (
              <li key={step.title} className="bg-card border border-white/10 rounded-2xl p-6" data-testid={`waterproof-step-${i}`}>
                <span className="text-xs font-bold text-[#D97757]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-base font-semibold text-foreground mt-1 mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== HEATED FLOORS OFFER ===== */}
      <section id="heated-floors" className="px-6 md:px-12 pb-20 md:pb-28 bg-background" data-testid="heated-floors-section">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-[#D97757] to-[#B4502F] text-white p-8 md:p-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/80 mb-3 inline-flex items-center gap-2">
              <Flame className="w-4 h-4" aria-hidden="true" /> The heated floors are on me
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Free underfloor heating with any full bathroom or whole-floor coating.
            </h2>
            <p className="text-base text-white/85 leading-relaxed">
              {HEATED_FLOORS_OFFER_LONG} Warm floors on cold mornings, at no extra cost.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => scrollToQuoteForm()}
              className="h-12 rounded-full bg-white text-[#B4502F] hover:bg-white/90 font-semibold"
              data-testid="heated-floors-quote-btn"
            >
              Claim it with a free quote <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a href={TEL_LINK} className="inline-flex items-center justify-center gap-2 h-12 rounded-full border border-white/50 text-white font-semibold hover:bg-white/10">
              <Phone className="w-4 h-4" /> Call {PHONE}
            </a>
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
              From first call to finished bathroom.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0 md:gap-0">
            {[
              { num: "01", icon: Phone, title: "Call, text, or send the form", desc: "Tell me what you've got. A couple of photos helps, but isn't required." },
              { num: "02", icon: Search, title: "Free site visit", desc: "I look at everything — including what's behind the tile — and explain the waterproofing plan in plain English." },
              { num: "03", icon: ClipboardCheck, title: "Written quote", desc: "Priced for your project, with the scope spelled out. No pressure, no surprise add-ons." },
              { num: "04", icon: CalendarCheck, title: "Deposit, then I build it", desc: "A deposit locks your dates. I do the work myself, start to finish." },
            ].map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center px-6 py-8" data-testid={`step-${i}`}>
                {/* Connector line */}
                {i < 3 && (
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

      {/* ===== PROOF — real before/afters + reviews. Renders ONLY when Ryan adds
           real entries in src/lib/homeContent.js. Never put made-up content here. */}
      {(BEFORE_AFTER.length > 0 || TESTIMONIALS.length > 0) && (
        <section id="proof" className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E] text-white" data-testid="proof-section">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">Real jobs</p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                Before &amp; after, around New Orleans.
              </h2>
            </div>
            {BEFORE_AFTER.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {BEFORE_AFTER.map((p) => (
                  <figure key={p.after} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <div className="grid grid-cols-2">
                      <div className="relative">
                        <img src={p.before} alt={`Before: ${p.caption}`} loading="lazy" className="w-full aspect-square object-cover" />
                        <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider bg-black/70 px-2 py-1 rounded">Before</span>
                      </div>
                      <div className="relative">
                        <img src={p.after} alt={`After: ${p.caption}`} loading="lazy" className="w-full aspect-square object-cover" />
                        <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider bg-[#D97757] px-2 py-1 rounded">After</span>
                      </div>
                    </div>
                    <figcaption className="p-4 text-sm text-white/70">{p.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {TESTIMONIALS.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TESTIMONIALS.map((t) => (
                  <blockquote key={t.name + t.quote.slice(0, 12)} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    <p className="text-base leading-relaxed text-white/85">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="mt-4 text-xs uppercase tracking-[0.18em] font-bold text-[#D97757]">
                      {t.name}{t.area ? ` · ${t.area}` : ""}
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
              data-testid="pricing-headline"
            >
              {PRICING_HEADLINE}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              {PRICING_SUBHEAD}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {/* Seamless shower */}
            <div className="bg-white border border-border/40 rounded-2xl p-8 flex flex-col" data-testid="pricing-shower">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Droplets className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3
                className="text-xl font-medium text-foreground mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Seamless Shower
              </h3>
              <p className="text-xs text-muted-foreground mb-5">One shower or tub surround</p>
              <p className="text-3xl font-semibold text-foreground mb-1">{PRICE_SHOWER}</p>
              <p className="text-xs text-muted-foreground mb-6">Quoted per project after a free site visit.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Microcement or tadelakt, often right over existing tile when it's stable",
                  "Little or no demolition on qualifying projects",
                  "Waterproofed layer by layer, with no grout lines for mold to grow in",
                  "Custom color and hand finish",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={SMS_LINK} className="mt-auto">
                <Button variant="outline" className="w-full h-11 rounded-full border-border/60 text-foreground text-sm font-medium">
                  Text Me About Your Shower
                </Button>
              </a>
            </div>

            {/* Full bathroom (highlighted) */}
            <div className="bg-[#0E0E0E] border-2 border-[#D97757]/40 rounded-2xl p-8 flex flex-col relative" data-testid="pricing-full-bathroom">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-[#D97757] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Free heated floors
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#D97757]/15 flex items-center justify-center mb-5">
                <Paintbrush className="w-5 h-5 text-[#D97757]" />
              </div>
              <h3
                className="text-xl font-medium text-white mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Full Seamless Bathroom
              </h3>
              <p className="text-xs text-white/50 mb-5">Walls, floor, and shower in one continuous shell</p>
              <p className="text-3xl font-semibold text-white mb-1">{PRICE_FULL_BATH}</p>
              <p className="text-xs text-white/60 mb-6">{PRICE_FULL_BATH_RANGE}</p>
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  "No grout lines anywhere, so mold has nowhere to grow",
                  "Selective demolition and a waterproofing rebuild where needed",
                  "Niche builds and fixture upgrades",
                  "Custom color, texture, and hand finish",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
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
                  {HEATED_FLOORS_OFFER_LONG}
                </p>
              </div>
              <Button
                onClick={() => {
                  if (!scrollToQuoteForm()) navigate("/#quote");
                }}
                className="w-full h-11 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545] mt-auto"
                data-testid="pricing-full-bathroom-cta"
              >
                Get My Free Quote
              </Button>
            </div>

            {/* Plaster & feature walls */}
            <div className="bg-white border border-border/40 rounded-2xl p-8 flex flex-col" data-testid="pricing-walls">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5">
                <Home className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3
                className="text-xl font-medium text-foreground mb-1 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Venetian Plaster &amp; Feature Walls
              </h3>
              <p className="text-xs text-muted-foreground mb-5">Accent walls, rooms, and stone-look features</p>
              <p className="text-3xl font-semibold text-foreground mb-1">{PRICE_WALLS}</p>
              <p className="text-xs text-muted-foreground mb-6">Priced by wall area and finish after a free site visit.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Venetian plaster, marmorino, and Roman clay",
                  "Rockscape feature walls, with optional LED backlighting",
                  "Mirror-polished or soft matte finishes",
                  "Bigger custom builds, like wet rooms and whole floors, quoted per project",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={SMS_LINK} className="mt-auto">
                <Button variant="outline" className="w-full h-11 rounded-full border-border/60 text-foreground text-sm font-medium">
                  Text Me About Your Walls
                </Button>
              </a>
            </div>
          </div>

          <p className="text-center text-xs md:text-sm text-muted-foreground/80 mt-10 max-w-2xl mx-auto leading-relaxed">
            The final number depends on the condition of what's there, the size, waterproofing, plumbing, fixtures, and finish. You get it in writing before any work starts.
          </p>
        </div>
      </section>

      {/* ===== FAQ — answers the fears that stop people from calling ===== */}
      <section id="faq" className="py-20 md:py-28 px-6 md:px-12 bg-[#F5F1EA]" data-testid="home-faq-section">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3 text-center">Straight answers</p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1A3C34] text-center mb-10" style={{ fontFamily: "'Fraunces', serif" }}>
            What people ask before they call.
          </h2>
          <div className="space-y-3">
            {HOME_FAQ.map(({ q, a }, i) => (
              <details key={q} className="group bg-white rounded-2xl border border-[#1A3C34]/10 p-5 open:shadow-sm" data-testid={`home-faq-${i}`}>
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-base font-semibold text-[#1A3C34]">
                  {q}
                  <ChevronRight className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-90 text-[#D97757]" />
                </summary>
                <p className="mt-3 text-sm md:text-base text-[#1A3C34]/75 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-[#1A3C34]/70">
            More questions? <a href="/faq" className="underline underline-offset-2 font-semibold">See the full FAQ</a> or{" "}
            <a href={TEL_LINK} className="underline underline-offset-2 font-semibold">call {PHONE}</a>.
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
                  Call or text me directly, or drop your name and number below and I'll text you back. I answer every one personally.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                  <a href={TEL_LINK} data-testid="closing-call-btn">
                    <Button className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545] w-full sm:w-auto">
                      <Phone className="w-5 h-5 mr-2" />
                      Call {PHONE}
                    </Button>
                  </a>
                  <a href={SMS_LINK} data-testid="closing-text-btn">
                    <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 text-base font-medium w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Text me
                    </Button>
                  </a>
                </div>
                <InstantQuoteForm variant="dark" source="closing_cta" className="text-left mb-5" />
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="text-sm text-white/60 hover:text-white underline underline-offset-2"
                  data-testid="closing-upload-btn"
                >
                  <Upload className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Or preview your own room in microcement first — free
                </button>

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

          <nav aria-label="Services" className="flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start" data-testid="footer-services">
            {SERVICE_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} The Shirtless Handyman. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                The Shirtless Handyman LLC &middot; {SERVICE_AREA_LABEL} &middot; {HOURS_LABEL}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <a href={TEL_LINK} className="hover:text-foreground inline-flex items-center gap-1" data-testid="footer-call"><Phone className="w-3 h-3" />{PHONE}</a>
                <a href={`mailto:${EMAIL}`} className="hover:text-foreground inline-flex items-center gap-1" data-testid="footer-email"><Mail className="w-3 h-3" />{EMAIL}</a>
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <button onClick={() => navigate("/portfolio")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-portfolio">Work</button>
              <a href="/finishes" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-finishes">Finishes</a>
              <a href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-faq">FAQ</a>
              <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-blog">Journal</a>
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

