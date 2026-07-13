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
    description: "Seamless waterproof showers, floors, and walls — installed directly over existing tile.",
    image: "/portfolio/shower-led-niche.jpg",
    href: "/microcement-new-orleans",
    priceRange: "From $5,500",
  },
  {
    title: "Tadelakt",
    description: "Hand-burnished Moroccan lime plaster. Naturally waterproof. 800-year-old craft.",
    image: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?w=900&fit=crop&fm=jpg&q=85",
    href: "/tadelakt-new-orleans",
    priceRange: "From $5,500",
  },
  {
    title: "Venetian Plaster",
    description: "Mirror-polished Italian lime plaster. Marbled depth that catches the light. A Renaissance finish, hand-applied today.",
    image: "/venetian-plaster-hero.jpg",
    href: "/upload",
    priceRange: "From $1,800",
  },
  {
    title: "Rockscape Walls",
    description: "Sculpted feature walls that look like carved stone. Optional LED backlighting.",
    image: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?w=900&fit=crop&fm=jpg&q=85",
    href: "/rockscape-walls-new-orleans",
    priceRange: "From $3,500",
  },
  {
    title: "Pool Decks & Outdoor",
    description: "Microterrazzo + cocciopesto resurfacing. UV-stable. Slip-resistant. Built for NOLA sun.",
    image: "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?w=900&fit=crop&fm=jpg&q=85",
    href: "/pool-deck-resurfacing-new-orleans",
    priceRange: "From $3,000",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

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
                <RevealText text="Seamless renovations," as="span" className="block" delay={0.25} />
                <RevealText text="built by hand in" as="span" className="block" delay={0.45} />
                <RevealText text="New Orleans." as="span" className="block italic" delay={0.65} />
              </h1>

              <motion.p
                className="text-base md:text-lg leading-relaxed text-white/75 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                I'm Ryan Mena. I install <strong className="text-white font-medium">microcement, tadelakt, and custom rockscape walls</strong> in NOLA homes — over your existing tile, with zero grout, zero seams, and zero demolition. One craftsman. One continuous surface. Built to outlast the humidity.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <MagneticButton>
                  <Button
                    onClick={() => {
                      const formEl = document.querySelector('[data-testid="instant-quote-form-hero_form"]');
                      formEl?.scrollIntoView({ behavior: "smooth", block: "center" });
                      formEl?.querySelector('input')?.focus();
                    }}
                    className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                    data-testid="hero-quote-btn"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request a Bathroom Assessment
                  </Button>
                </MagneticButton>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="outline"
                  className="h-13 px-7 rounded-full border-white/30 text-white hover:bg-white/10 font-medium"
                  data-testid="hero-studio-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  See Your Space — Try The Studio
                </Button>
              </motion.div>

              <motion.p
                className="text-sm text-white/40 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                Or text Ryan directly: <a href={SMS_LINK} className="text-white/65 hover:text-white underline underline-offset-2">{PHONE}</a>
              </motion.p>

              <motion.div
                className="mt-8 max-w-xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.6 }}
              >
                <InstantQuoteForm variant="dark" source="hero_form" />
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

      {/* ===== WHAT I DO ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-background" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
              What I Install
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Five crafts. One philosophy:<br />
              <span className="italic">no seams, no grout, no shortcuts.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {SERVICES.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 0.08}>
                <button
                  onClick={() => navigate(service.href)}
                  data-cursor="view"
                  data-cursor-label="View"
                  className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden text-left bg-muted hover:shadow-xl transition-shadow"
                  data-testid={`service-card-${service.title.toLowerCase().replace(/[^a-z]/g, "-")}`}
                >
                  <motion.img
                    src={service.image}
                    alt={`${service.title} installation by The Shirtless Handyman, New Orleans`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-2">
                      {service.priceRange}
                    </p>
                    <h3
                      className="text-2xl font-light mb-2 leading-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-sm text-white/70 mb-3 leading-relaxed">{service.description}</p>
                    <motion.span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white"
                      initial={{ opacity: 0, x: -4 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </motion.span>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VENETIAN PLASTER — large feature strip ===== */}
      <section
        className="relative overflow-hidden bg-[#1A1410]"
        data-testid="venetian-plaster-section"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
          {/* Image side */}
          <ScrollReveal className="relative md:order-1 order-1">
            <div className="relative w-full h-[55vh] md:h-full min-h-[480px]">
              <motion.img
                src="/venetian-plaster-hero.jpg"
                alt="Venetian plaster wall — mirror-polished Italian lime plaster with warm, marbled depth — installed by The Shirtless Handyman in New Orleans"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.04 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1A1410]/60 md:to-[#1A1410]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/70 via-transparent to-transparent md:from-transparent" />
            </div>
          </ScrollReveal>

          {/* Copy side */}
          <ScrollReveal delay={0.15} className="md:order-2 order-2 flex items-center px-6 md:px-12 lg:px-20 py-14 md:py-0">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] font-bold text-[#D97757] mb-4">
                Featured Craft · Italian Heritage
              </p>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.05] mb-6"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Venetian Plaster.<br />
                <span className="italic text-[#E8D2BD]">Light, made tangible.</span>
              </h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-5">
                Burnished Italian lime plaster, troweled and polished by hand in 5–7 thin layers
                until it reflects light like a sheet of marble — but warmer, deeper, alive. The same
                finish that lines Renaissance palazzos in Venice and Florence is now installed in
                New Orleans living rooms, hallways, dining rooms, and powder baths.
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
                Custom-tinted to any color. Naturally anti-microbial. Zero VOCs. No seams, no grout,
                no joints — just one continuous, hand-finished plane that turns a flat wall into the
                room&apos;s most striking feature.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-1">
                    Best for
                  </p>
                  <p className="text-sm text-white/85">Living rooms · Dining · Halls · Powder baths</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-1">
                    Starting at
                  </p>
                  <p className="text-sm text-white/85">$14/sq ft · most rooms $1,800–$4,500</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/upload")}
                  data-cursor="view"
                  data-cursor-label="Try"
                  className="inline-flex items-center gap-2 rounded-full bg-[#D97757] hover:bg-[#C56545] text-white text-sm font-semibold h-11 px-6 transition-colors"
                  data-testid="venetian-try-studio-btn"
                >
                  Preview it in your space <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={SMS_LINK}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 hover:bg-white/5 text-white text-sm font-semibold h-11 px-6 transition-colors"
                  data-testid="venetian-text-ryan-btn"
                >
                  Text Ryan for a quote
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== PRICING CALCULATOR — instant estimate ===== */}
      <PricingCalculator />

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
                  I'm Ryan, born and raised in New Orleans. I spent years installing tile in NOLA bathrooms — and watching that exact same tile fail inside a decade. Grout turning black. Caulk peeling. Mold finding the smallest seam. It's not the tile's fault. It's just the wrong material for this climate.
                </p>
                <p>
                  So I went and learned the alternative. Microcement. Tadelakt. Marmorino. Sculpted rockscape. Surfaces that don't have seams to fail. Surfaces that look like a Tulum hotel or a Moroccan riad — and last in NOLA humidity for decades.
                </p>
                <p>
                  Now that's all I do. One craftsman. Real materials. Photos of every step. <strong className="text-[#1A3C34] font-semibold">You text me, I show up, I treat your home like my own.</strong> That's the whole pitch.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  onClick={() => navigate("/about")}
                  variant="outline"
                  className="h-12 px-6 rounded-full border-[#1A3C34]/25 text-[#1A3C34] hover:bg-[#1A3C34] hover:text-white font-medium"
                  data-testid="meet-ryan-about-btn"
                >
                  <User className="w-4 h-4 mr-2" />
                  Read my full story
                </Button>
                <a href={SMS_LINK}>
                  <MagneticButton>
                    <Button className="h-12 px-6 rounded-full bg-[#1A3C34] text-white hover:bg-[#0E2A24] font-medium" data-testid="meet-ryan-text-btn">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Text me directly
                    </Button>
                  </MagneticButton>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="problem-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Pain points */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
                Sound Familiar?
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-8 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                You know your space needs work.<br />
                You just can't see the finish line.
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Can't picture the upgrade</h3>
                    <p className="text-sm text-white/45 leading-relaxed">You know you want something better — but choosing materials from a swatch book doesn't tell you how it'll actually look in your space.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Scared of wasting money</h3>
                    <p className="text-sm text-white/45 leading-relaxed">Renovations aren't cheap. Committing thousands without seeing the result? That keeps people stuck for years.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Tired of grout, mold, and outdated finishes</h3>
                    <p className="text-sm text-white/45 leading-relaxed">Scrubbing grout lines that turn black. Caulk that peels. Tile that looks like it's from 2005. You deserve better.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution transition */}
            <div className="bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 border border-[#D97757]/20 rounded-3xl p-10 md:p-12">
              <div className="w-14 h-14 rounded-2xl bg-[#D97757] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3
                className="text-2xl md:text-3xl font-light tracking-tight text-white mb-4 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Now you can see your upgrade before you commit a single dollar.
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8">
                The Seamless Studio takes a photo of your actual space and shows you exactly what it looks like coated in seamless microcement, tadelakt, venetian plaster, or any of the premium finishes I install. Three design options. Real cost estimates. In about 60 seconds.
              </p>
              <Button
                onClick={() => navigate("/upload")}
                className="h-12 px-8 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                data-testid="problem-cta-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                Show Us Your Room
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white" data-testid="trust-section">
        <div className="max-w-7xl mx-auto">

          {/* Result statements */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-20">
            {[
              "No grout. Ever.",
              "One surface. Zero seams.",
              "Waterproof from day one.",
            ].map((statement) => (
              <div key={statement} className="text-center">
                <p
                  className="text-xl md:text-2xl font-light text-foreground tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {statement}
                </p>
              </div>
            ))}
          </div>

          {/* Trust bullets — 2 rows of 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6 mb-20">
            {[
              { icon: CheckCircle, text: "Clean jobsite, every time — we leave it better than we found it" },
              { icon: Clock, text: "On time, on budget — no drawn-out timelines or surprise costs" },
              { icon: ShieldCheck, text: "Licensed, insured, and personally accountable for every project" },
              { icon: Star, text: "5-star craftsmanship — I don't cut corners on materials or labor" },
              { icon: Phone, text: "Direct line to Ryan — no call centers, no runaround" },
              { icon: Gem, text: "Premium materials, disciplined preparation, and craftsmanship built for long-term value." },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="w-4 h-4 text-[#D97757] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Ryan did our entire master bath in microcement. No more grout to scrub, and it looks like a luxury hotel. Best money we've spent on the house.",
                name: "Sarah M.",
                detail: "Bathroom remodel — Metairie, LA",
              },
              {
                quote: "We were nervous about doing something different. The Seamless Studio let us see exactly what it would look like before we committed. Turned out even better in person.",
                name: "Marcus & Tina D.",
                detail: "Kitchen surfaces — Harvey, LA",
              },
              {
                quote: "The rockscape wall in our living room is insane. Everyone who walks in asks about it. Ryan built it exactly like the preview showed.",
                name: "Jason R.",
                detail: "Feature wall — Gretna, LA",
              },
            ].map((t) => (
              <div key={t.name} className="bg-[#FAFAF9] border border-border/40 rounded-2xl p-7">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={`testimonial-star-${t.name}-${s}`} className="w-3.5 h-3.5 fill-[#D97757] text-[#D97757]" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT ARE SEAMLESS SURFACES ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="seamless-explainer-section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
              The Future of Surfaces
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              What are seamless surfaces?<br />
              And why does The Seamless Studio show them?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seamless surfaces use microcement, tadelakt, and luxury plaster coatings applied directly over your existing walls, floors, and counters. No demolition. No grout lines. Just one smooth, continuous, waterproof surface — and that's exactly what The Seamless Studio designs for your space.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Whether you're looking for a microcement bathroom upgrade, a concrete overlay for your kitchen floors, or a custom feature wall that turns heads — I handle it all personally, right here in New Orleans. Seamless surfaces are the modern alternative to tile, stone, and traditional finishes. They're faster to install, easier to maintain, and they look like nothing else on the market. If you're searching for a microcement installer in New Orleans or a seamless surface contractor near you, you just found him.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { title: "Bathrooms & Showers", desc: "Waterproof micro quartz and tadelakt replace every tile and grout line with a single seamless shell. Walk-in showers, tub surrounds, vanity walls — all one surface.", icon: Droplets },
              { title: "Floors & Walls", desc: "Microcement flows wall-to-wall, room-to-room. No joints, no transitions, no seams. Warm underfoot, cool to the eye. Works on concrete, tile, even wood subfloors.", icon: Layers },
              { title: "Kitchens & Counters", desc: "Beton cire countertops with waterfall edges. Venetian plaster backsplashes that go from counter to ceiling. Zero grout to scrub, ever.", icon: ShieldCheck },
              { title: "Outdoor & Pool Areas", desc: "Microterrazzo pool decks. Cocciopesto patios. Rockscape accent walls made from sculpted foam and microaggregate. Built for sun, rain, and bare feet.", icon: Paintbrush },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1 group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-[#D97757] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Surface types */}
          <div className="bg-[#F5F5F4] rounded-3xl p-8 md:p-12">
            <h3
              className="text-xl font-medium text-foreground mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Finishes I install — and what The Seamless Studio shows you
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                "Microcement", "Tadelakt", "Venetian Plaster", "Roman Clay", "Marmorino",
                "Stucco Lustro", "Grassello di Calce", "Beton Cire", "Cocciopesto", "Microterrazzo",
                "Micro Quartz", "Lime Wash", "Seamless Epoxy", "Rockscape Walls", "Solid Surface",
              ].map((finish) => (
                <div key={finish} className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-border/40">
                  <span className="w-2 h-2 rounded-full bg-[#D97757] flex-shrink-0" />
                  <span className="text-sm text-foreground font-medium">{finish}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM POSITIONING ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E] overflow-hidden" data-testid="premium-section">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
              Premium Craftsmanship
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              This is not a cheap fix.<br />This is a high-value upgrade.
            </h2>
            <p className="text-sm text-white/45 max-w-xl mx-auto">
              Seamless surfaces and rockscape walls are luxury finishes — hand-applied, custom-designed, and built to outlast anything tile or grout could ever offer.
            </p>
          </div>

          {/* Two-column: Seamless Surfaces + Rockscape */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

            {/* Seamless Surfaces */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#D97757]/15 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#D97757]" />
                </div>
                <h3
                  className="text-xl font-medium text-white"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Seamless Surfaces
                </h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Microcement, tadelakt, venetian plaster, and beton cire — applied by hand over your existing surfaces. No demolition. No grout. Just one continuous, waterproof plane that transforms the entire feel of a room.
              </p>
              <div className="space-y-3 mb-8 flex-1">
                {[
                  "Custom color-matched to your vision",
                  "Rated for wet zones — showers, pools, kitchens",
                  "Applied over existing tile, concrete, or drywall",
                  "10+ year lifespan with minimal maintenance",
                  "Modern European aesthetic that never dates",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] flex-shrink-0" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => navigate("/upload")}
                className="w-full h-11 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545] mt-auto"
                data-testid="premium-surfaces-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Preview in The Seamless Studio
              </Button>
            </div>

            {/* Rockscape Walls */}
            <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1738585608732-49294c24ece0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHx0ZXh0dXJlZCUyMHN0b25lJTIwYWNjZW50JTIwd2FsbCUyMGludGVyaW9yJTIwbHV4dXJ5JTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwwfHx8fDE3NzY0NTM1Njd8MA&ixlib=rb-4.1.0&q=85"
                  alt="Custom sculpted rockscape accent wall with microaggregate stone finish — The Shirtless Handyman, New Orleans"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-[#D97757] text-white text-[10px] font-bold uppercase tracking-wider">
                    Signature Piece
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#D97757]/15 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-[#D97757]" />
                  </div>
                  <h3
                    className="text-xl font-medium text-white"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Custom Rockscape Walls
                  </h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  Hand-sculpted foam blocks, coated in microaggregate to look and feel like carved natural stone. Backlit, textured, and completely one-of-a-kind. A statement piece that turns any room into a destination.
                </p>
                <div className="space-y-3 mb-8 flex-1">
                  {[
                    "Sculpted to fit your exact wall and space",
                    "Microaggregate finish — authentic rock texture",
                    "Integrated LED backlighting available",
                    "Bedrooms, living rooms, restaurants, lobbies",
                    "Lightweight — installs on any standard wall",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] flex-shrink-0" />
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
                <a href={SMS_LINK} className="mt-auto" data-testid="premium-rockscape-btn">
                  <Button variant="outline" className="w-full h-11 rounded-full border-white/20 text-white hover:bg-white/10 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request a Custom Rockscape Design
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Durability bar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p
              className="text-lg md:text-xl font-light text-white/80 tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              "Luxury that lasts. Every surface I install is waterproof, mold-resistant, UV-stable, and designed to look better with age — not worse."
            </p>
          </div>
        </div>
      </section>

      {/* ===== HANDYMAN (secondary) ===== */}
      <section className="py-14 px-6 md:px-12 bg-[#FAFAF9] border-y border-border/40" data-testid="handyman-section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground/60 mb-2">
              Also Available
            </p>
            <h3
              className="text-xl md:text-2xl font-light tracking-tight text-foreground mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Need a handyman? We do that too.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Drywall patches, fixture installs, door and trim work, painting, pressure washing, and general repairs. My main focus is seamless surfaces — but I'm happy to help with the small stuff while I'm already there.
            </p>
          </div>
          <a href={SMS_LINK} className="flex-shrink-0" data-testid="handyman-text-btn">
            <Button variant="outline" className="h-11 px-6 rounded-full border-border/60 text-foreground hover:bg-accent text-sm font-medium">
              <MessageCircle className="w-4 h-4 mr-2" />
              Text Ryan — {PHONE}
            </Button>
          </a>
        </div>
      </section>

      {/* ===== HOW IT WORKS (simplified) ===== */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              How It Works
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Four steps. That's it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0">
            {[
              { num: "01", icon: Upload, title: "Upload your space", desc: "Snap a photo of any room, wall, floor, or outdoor area." },
              { num: "02", icon: Sparkles, title: "See it redesigned", desc: "The Seamless Studio shows you 3 seamless surface options — instantly." },
              { num: "03", icon: DollarSign, title: "Get a quote", desc: "Real cost estimates based on your project and location." },
              { num: "04", icon: CalendarCheck, title: "Schedule the build", desc: "Text Ryan, lock in a date, and I make it real." },
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
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate("/upload")}
              className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
              data-testid="how-it-works-cta"
            >
              <Upload className="w-5 h-5 mr-2" />
              Try Seamless Studio Free
            </Button>
          </div>
        </div>
      </section>

      {/* ===== GALLERY — What the AI shows = what I build ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="gallery-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              From Screen to Reality
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              What you see in the tool<br />can be built in real life.
            </h2>
            <p className="text-sm text-white/45 max-w-lg mx-auto">
              The Seamless Studio designs with the exact same finishes I install. Every surface you preview is something I can put on your walls, floors, and counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Bathrooms",
                desc: "Tadelakt showers, micro quartz wet zones, seamless vanity walls",
                image: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxwb2xpc2hlZCUyMGNvbmNyZXRlJTIwbHV4dXJ5JTIwYmF0aHJvb20lMjBtaW5pbWFsfGVufDB8fHx8MTc3NjQ1MjM2Mnww&ixlib=rb-4.1.0&q=85",
                type: "Bathroom",
              },
              {
                title: "Floors",
                desc: "Microcement, beton cire, and microterrazzo — wall to wall, no seams",
                image: "https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxwb2xpc2hlZCUyMGNvbmNyZXRlJTIwZmxvb3IlMjBpbnRlcmlvciUyMG9wZW4lMjBwbGFuJTIwbW9kZXJufGVufDB8fHx8MTc3NjQ1Mzc3Mnww&ixlib=rb-4.1.0&q=85",
                type: "Living Room",
              },
              {
                title: "Feature Walls",
                desc: "Rockscape, venetian plaster, marmorino — the focal point of any room",
                image: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHx0ZXh0dXJlZCUyMHN0b25lJTIwYWNjZW50JTIwd2FsbCUyMGludGVyaW9yJTIwbHV4dXJ5JTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwwfHx8fDE3NzY0NTM1Njd8MA&ixlib=rb-4.1.0&q=85",
                type: "Bedroom",
              },
              {
                title: "Outdoor Spaces",
                desc: "Pool decks, patios, outdoor kitchens — sealed against sun and rain",
                image: "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvdXRkb29yJTIwcGF0aW8lMjBjb25jcmV0ZSUyMHBvb2wlMjBkZWNrJTIwbHV4dXJ5fGVufDB8fHx8MTc3NjQ1Mzc2Nnww&ixlib=rb-4.1.0&q=85",
                type: "Pool Deck",
              },
            ].map((cat) => (
              <button
                key={cat.title}
                onClick={() => navigate("/upload", { state: { projectType: cat.type } })}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
                data-testid={`gallery-${cat.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <img
                  src={cat.image}
                  alt={`${cat.title} — seamless surface renovation example by The Shirtless Handyman, New Orleans`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3
                    className="text-xl font-medium text-white mb-1.5"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">{cat.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D97757]">
                    <Upload className="w-3.5 h-3.5" />
                    Try in Seamless Studio
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR WORK ===== */}
      <section className="py-16 px-6 md:px-12 bg-white" data-testid="our-work-section">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            Real Results
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            See completed projects
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Real before and after photos from jobs I've done — no renders, no stock photos.
          </p>
          <Button
            onClick={() => navigate("/portfolio")}
            variant="outline"
            className="rounded-full h-12 px-8 border-[#D97757]/40 text-[#D97757] hover:bg-[#D97757]/5 text-sm font-medium"
            data-testid="home-see-our-work-btn"
          >
            See Our Work
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* ===== CONTRACTOR PARTNERS ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="contractor-partner-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — pitch */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
                For Contractors & Remodelers
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Add seamless surfaces<br />to your next project.
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-4">
                You run the remodel. We install the surfaces. Your client gets a higher-end finish, you increase the project value, and nobody has to learn a new trade.
              </p>
              <p className="text-base text-white/60 leading-relaxed mb-8">
                I partner with general contractors, bathroom remodelers, kitchen builders, and design firms across Greater New Orleans. You bring the project — I bring the microcement, tadelakt, venetian plaster, and rockscape installs.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { title: "Increase project value", desc: "Seamless surfaces are a premium upsell your clients will love — higher ticket, same timeline." },
                  { title: "No extra training needed", desc: "We handle the entire surface installation. You stay focused on your scope." },
                  { title: "White-label available", desc: "We work under your brand or ours — whatever makes the project smoother." },
                  { title: "Fast turnaround", desc: "Most surface installs complete in 2–5 days depending on scope." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-[#D97757] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <a href={SMS_LINK} data-testid="partner-text-btn">
                  <Button className="h-12 px-8 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Text Ryan to Partner
                  </Button>
                </a>
                <Button
                  onClick={() => navigate("/contractor/register")}
                  variant="outline"
                  className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 text-sm font-medium"
                  data-testid="partner-register-btn"
                >
                  Create a Contractor Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right — quick stats / value props */}
            <div className="space-y-6">
              {[
                { metric: "2–5 days", label: "Average surface install time" },
                { metric: "$2K–$8K", label: "Added project value per room" },
                { metric: "15+", label: "Seamless finish types available" },
                { metric: "0", label: "Grout lines. Forever." },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
                  <p
                    className="text-3xl md:text-4xl font-light text-[#D97757] min-w-[100px]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {stat.metric}
                  </p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
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
                  Stop imagining it.<br />See it.
                </h2>

                <p className="text-base text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
                  One photo. Sixty seconds. Three seamless surface designs for your space — free. Or text Ryan right now and get a straight answer today.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-5">
                  <Button
                    onClick={() => navigate("/upload")}
                    className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                    data-testid="closing-upload-btn"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Show Us Your Room
                  </Button>
                  <a href={SMS_LINK} data-testid="closing-text-btn">
                    <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 text-base font-medium w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Text {PHONE}
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
              <button onClick={() => navigate("/portfolio")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-portfolio">Our Work</button>
              <button onClick={() => navigate("/faq")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-faq">FAQ</button>
              <button onClick={() => navigate("/book")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-book">Book</button>
              <button onClick={() => navigate("/contractor/register")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-contractor-signup">Contractor Sign Up</button>
              <button onClick={() => navigate("/contractor/login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-contractor-login">Contractor Login</button>
              <button onClick={() => navigate("/admin")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-admin-link">Admin</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

