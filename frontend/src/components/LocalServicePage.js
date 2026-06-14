import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Navbar } from "./Navbar";
import { InstantQuoteForm } from "./InstantQuoteForm";
import { TrustStrip } from "./TrustStrip";
import { PricingCalculator } from "./PricingCalculator";
import { SeoHead } from "./SeoHead";
import {
  ArrowRight, Upload, ShieldCheck, Droplets, Layers, Clock,
  Sparkles, CheckCircle, MessageCircle, Phone, Wrench, Paintbrush, Award,
} from "lucide-react";

const PHONE = "504-264-4919";
const TEL_LINK = `tel:${PHONE.replace(/-/g, "")}`;

// Map icon string identifiers used in config -> lucide icon components
const ICONS = {
  Droplets, Layers, Clock, ShieldCheck, Wrench, Paintbrush, Award,
  Sparkles, CheckCircle,
};

/**
 * LocalServicePage — generic NOLA local-SEO landing template.
 *
 * Renders an SEO-optimized, lead-gen-attached service page from a config object.
 * Used for /microcement-new-orleans, /microcement-metairie, /tadelakt-new-orleans,
 * /rockscape-walls-new-orleans, /pool-deck-resurfacing-new-orleans.
 */
export default function LocalServicePage({ config }) {
  const navigate = useNavigate();
  const {
    slug,
    serviceName,
    serviceType,
    city,
    title,
    description,
    eyebrow,
    h1,
    heroParagraph,
    heroImage,
    ogImage,
    primaryCta,
    smsBody,
    benefits,
    serviceAreas,
    whereItShines,
    faq,
    priceLow,
    priceHigh,
    defaultProjectType,
  } = config;

  const pageUrl = `https://theshirtlesshandyman.com/${slug}`;
  const smsLink = `sms:${PHONE.replace(/-/g, "")}?body=${encodeURIComponent(smsBody)}`;
  const finalOgImage = ogImage || heroImage;

  // Page schema: a focused Service + BreadcrumbList + page-specific FAQ
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: `${serviceName} in ${city}`,
        description,
        provider: {
          "@type": "HomeAndConstructionBusiness",
          name: "The Shirtless Handyman",
          url: "https://theshirtlesshandyman.com",
          telephone: "(504) 264-4919",
          priceRange: "$$",
          areaServed: { "@type": "City", name: city },
        },
        areaServed: { "@type": "City", name: city },
        serviceType,
        // priceRange is the field Google SERP renderers read directly when deciding
        // whether to show a "From $X" pricing snippet alongside the search result.
        priceRange: `$${priceLow.toLocaleString()}–$${priceHigh.toLocaleString()}`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: String(priceLow),
          highPrice: String(priceHigh),
          offerCount: "5",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            minPrice: String(priceLow),
            maxPrice: String(priceHigh),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://theshirtlesshandyman.com" },
          { "@type": "ListItem", position: 2, name: `${serviceName} ${city}`, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <>
      <SeoHead title={title} description={description} canonical={pageUrl} ogImage={finalOgImage} ogType="article">
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid={`local-service-${slug}`}>
        <Navbar />

        {/* Hero */}
        <section className="relative bg-[#0E0E0E] text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-25"
            style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/95 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">{eyebrow}</p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {h1}
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-2xl mb-8 leading-relaxed">{heroParagraph}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                onClick={() => navigate("/upload")}
                className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
                data-testid={`${slug}-cta-upload`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {primaryCta}
              </Button>
              <a href={smsLink}>
                <Button variant="outline" className="h-13 px-7 rounded-full border-white/30 text-white hover:bg-white/10 font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text Ryan
                </Button>
              </a>
            </div>

            <p className="text-sm text-white/45">
              Or call Ryan directly:{" "}
              <a href={TEL_LINK} className="text-white/70 hover:text-white underline underline-offset-2">{PHONE}</a>
            </p>

            <div className="mt-8 max-w-xl">
              <InstantQuoteForm variant="dark" source={`landing_${slug}`} defaultProjectType={defaultProjectType} />
            </div>
          </div>
        </section>

        <TrustStrip variant="dark" />

        {/* Pricing calculator — instant estimate */}
        <PricingCalculator />

        {/* Benefits */}
        <section className="py-20 px-6 md:px-12 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3 text-center">
              Why {city} homeowners choose this
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground text-center mb-14 max-w-2xl mx-auto leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Built for the way {city} actually lives.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {benefits.map((b) => {
                const Icon = ICONS[b.icon] || Sparkles;
                return (
                  <div key={b.title} className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-sm transition-shadow">
                    <div className="w-11 h-11 rounded-xl bg-[#1A3C34]/8 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#1A3C34]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service areas (optional) */}
        {serviceAreas?.length > 0 && (
          <section className="py-20 px-6 md:px-12 bg-background">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3">
                Coverage near {city}
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-10 leading-snug"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Serving {city} and neighboring areas.
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-border/60 text-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
                Don't see your neighborhood? Text Ryan at{" "}
                <a href={TEL_LINK} className="underline underline-offset-2 text-foreground">{PHONE}</a>{" "}
                — we travel for the right project.
              </p>
            </div>
          </section>
        )}

        {/* Studio */}
        <section className="py-20 px-6 md:px-12 bg-[#1A3C34] text-white">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3 text-center">
              The Seamless Studio
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-center mb-14 max-w-2xl mx-auto leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              See your {serviceName.toLowerCase()} project before you build it.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: "01", t: "Upload a photo", b: `Of your existing ${defaultProjectType.toLowerCase()} or any related space.` },
                { n: "02", t: "Get 3 designs", b: "AI renders your space in seamless surfaces — instantly." },
                { n: "03", t: "Lock in a quote", b: `Real cost estimates for ${city} and the Greater New Orleans area.` },
              ].map((s) => (
                <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
                  <p className="text-[#D97757] text-sm font-bold mb-3">{s.n}</p>
                  <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{s.b}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                onClick={() => navigate("/upload")}
                className="h-13 px-8 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
                data-testid={`${slug}-cta-process`}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Try The Seamless Studio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Where it shines */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-10 leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Where {serviceName.toLowerCase()} shines in {city} homes
            </h2>
            <ul className="space-y-3 text-base text-foreground">
              {whereItShines.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D97757] flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/85">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ visible block */}
        {faq?.length > 0 && (
          <section className="py-20 px-6 md:px-12 bg-[#FAFAF9]">
            <div className="max-w-3xl mx-auto">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3 text-center">
                Frequently Asked
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground text-center mb-10 leading-snug"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Answers for {city} homeowners.
              </h2>
              <div className="space-y-3">
                {faq.map(({ q, a }) => (
                  <details
                    key={q}
                    className="group bg-white border border-border/40 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                  >
                    <summary className="cursor-pointer text-base font-semibold text-foreground flex items-center justify-between gap-3">
                      <span>{q}</span>
                      <span className="text-[#D97757] text-xl leading-none transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-12 bg-[#0E0E0E] text-white text-center">
          <h2
            className="text-3xl md:text-5xl font-light tracking-tight mb-5 leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Ready to see your space in {serviceName.toLowerCase()}?
          </h2>
          <p className="text-base text-white/55 max-w-xl mx-auto mb-8">
            Free preview. No account. Real cost estimate. Built by Ryan Mena, born in NOLA.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => navigate("/upload")}
              className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
              data-testid={`${slug}-cta-final`}
            >
              <Upload className="w-4 h-4 mr-2" /> {primaryCta}
            </Button>
            <a href={TEL_LINK}>
              <Button variant="outline" className="h-13 px-7 rounded-full border-white/30 text-white hover:bg-white/10 font-medium">
                <Phone className="w-4 h-4 mr-2" /> Call {PHONE}
              </Button>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
