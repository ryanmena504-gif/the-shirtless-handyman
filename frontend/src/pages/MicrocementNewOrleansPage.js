import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import { InstantQuoteForm } from "../components/InstantQuoteForm";
import { TrustStrip } from "../components/TrustStrip";
import { SeoHead } from "../components/SeoHead";
import {
  ArrowRight, Upload, ShieldCheck, Droplets, Layers, Clock,
  Sparkles, CheckCircle, MessageCircle, Phone,
} from "lucide-react";

const PHONE = "504-264-4919";
const TEL_LINK = `tel:${PHONE.replace(/-/g, "")}`;
const SMS_LINK = `sms:${PHONE.replace(/-/g, "")}?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20microcement%20in%20New%20Orleans.`;
const PAGE_URL = "https://theshirtlesshandyman.com/microcement-new-orleans";
const OG_IMAGE = "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1200&h=630&fit=crop&fm=jpg&q=85";

// Page-specific structured data: a focused Service entity, a BreadcrumbList for
// hierarchy signal, and a FAQ tuned to high-intent "microcement near me" queries.
const PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "Microcement Installation in New Orleans",
      description:
        "Hand-applied microcement walls, floors, and showers across Greater New Orleans. Seamless, waterproof, zero grout. Installed by The Shirtless Handyman over your existing surfaces — no demolition required.",
      provider: {
        "@type": "HomeAndConstructionBusiness",
        name: "The Shirtless Handyman",
        url: "https://theshirtlesshandyman.com",
        telephone: "(504) 264-4919",
      },
      areaServed: { "@type": "City", name: "New Orleans" },
      serviceType: "Microcement",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "2000",
        highPrice: "12000",
        offerCount: "5",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://theshirtlesshandyman.com" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Microcement New Orleans",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who installs microcement in New Orleans?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "The Shirtless Handyman, run by Ryan Mena, specializes in microcement installation across Greater New Orleans — including Metairie, Gretna, Harvey, Lakeview, Uptown, Mid-City, Marigny, Algiers, and the Westbank.",
          },
        },
        {
          "@type": "Question",
          name: "How much does microcement cost per square foot in New Orleans?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Microcement in the New Orleans area typically runs $14 to $40 per square foot installed depending on the substrate, finish color, and prep work required. A single bathroom usually lands between $2,000 and $8,000.",
          },
        },
        {
          "@type": "Question",
          name: "Can microcement be installed over existing tile in a New Orleans shower?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Microcement bonds directly to existing tile after proper prep — no demolition required. This is one of the main reasons New Orleans homeowners choose microcement over a full tile tear-out for shower renovations.",
          },
        },
        {
          "@type": "Question",
          name: "Is microcement a good choice for New Orleans humidity?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Microcement is fully waterproof when properly sealed and is widely used in wet zones including showers, pool decks, and exterior surfaces. Its sealed, jointless surface makes it especially well-suited to high-humidity climates like New Orleans, where grout is prone to mold and failure.",
          },
        },
      ],
    },
  ],
};

const SERVICE_AREAS = [
  "Metairie", "Gretna", "Harvey", "Lakeview", "Uptown",
  "Mid-City", "Marigny", "Algiers", "Westwego", "Carrollton",
  "French Quarter", "Garden District", "Bywater", "Kenner",
];

const BENEFITS = [
  { icon: Droplets, title: "100% Waterproof", body: "Sealed microcement has zero seams or grout — no path for water to enter. Built for NOLA wet zones, humidity, and decades of use." },
  { icon: Layers, title: "Installs Over Existing Tile", body: "We bond directly to your existing shower tile, floor, or walls. No demolition, no debris, no dumpster in your driveway." },
  { icon: Clock, title: "Done in 2–5 Days", body: "Most single-room microcement installs complete in under a week — versus 3–4 weeks for a comparable tile renovation." },
  { icon: ShieldCheck, title: "10+ Year Lifespan", body: "Properly sealed microcement outlasts grout-based finishes by decades. No re-caulking, no scrubbing black grout lines." },
];

export default function MicrocementNewOrleansPage() {
  const navigate = useNavigate();
  return (
    <>
      <SeoHead
        title="Microcement New Orleans | Seamless Bathroom & Floor Installation — The Shirtless Handyman"
        description="Microcement specialist in New Orleans. Seamless, waterproof, zero-grout shower & floor installation across Metairie, Gretna, Lakeview & the Westbank. Free design preview in 60 seconds. Text Ryan: 504-264-4919."
        canonical={PAGE_URL}
        ogImage={OG_IMAGE}
        ogType="article"
      >
        <script type="application/ld+json">{JSON.stringify(PAGE_SCHEMA)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid="microcement-nola-page">
        <Navbar />

        {/* Hero */}
        <section className="relative bg-[#0E0E0E] text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=2000&fit=crop&fm=jpg&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/95 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">
              Microcement · New Orleans, LA
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Microcement in New Orleans —<br />
              installed over your existing surface.
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-2xl mb-8 leading-relaxed">
              Seamless, waterproof, zero-grout microcement showers, floors, and walls — applied by hand
              across Greater New Orleans. No demolition. No 4-week timeline. No grout to scrub. See your
              own space rendered in microcement before you spend a dollar.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                onClick={() => navigate("/upload")}
                className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
                data-testid="nola-cta-upload"
              >
                <Upload className="w-4 h-4 mr-2" />
                Preview My Bathroom Free
              </Button>
              <a href={SMS_LINK}>
                <Button variant="outline" className="h-13 px-7 rounded-full border-white/30 text-white hover:bg-white/10 font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text Ryan
                </Button>
              </a>
            </div>

            <p className="text-sm text-white/45">
              Or call Ryan directly:{" "}
              <a href={TEL_LINK} className="text-white/70 hover:text-white underline underline-offset-2">
                {PHONE}
              </a>
            </p>

            <div className="mt-8 max-w-xl">
              <InstantQuoteForm variant="dark" source="microcement_nola" defaultProjectType="Microcement Bathroom" />
            </div>
          </div>
        </section>

        <TrustStrip variant="dark" />

        {/* Why microcement */}
        <section className="py-20 px-6 md:px-12 bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3 text-center">
              Why New Orleans homeowners are switching
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground text-center mb-14 max-w-2xl mx-auto leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Microcement was made for a city with this much humidity.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-sm transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-[#1A3C34]/8 flex items-center justify-center mb-4">
                    <b.icon className="w-5 h-5 text-[#1A3C34]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service areas */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3">
              Greater New Orleans coverage
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-10 leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Installing microcement across the metro & Westbank.
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {SERVICE_AREAS.map((area) => (
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

        {/* Process */}
        <section className="py-20 px-6 md:px-12 bg-[#1A3C34] text-white">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3 text-center">
              The Seamless Studio
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-center mb-14 max-w-2xl mx-auto leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              See your microcement bathroom before you build it.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: "01", t: "Upload a photo", b: "Of your existing bathroom, kitchen floor, or feature wall." },
                { n: "02", t: "Get 3 designs", b: "AI renders your space in microcement, tadelakt, and luxury plaster — instantly." },
                { n: "03", t: "Lock in a quote", b: "Real cost estimates for your ZIP. Text Ryan to schedule." },
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
                data-testid="nola-cta-process"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Try The Seamless Studio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* What we install */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-10 leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Where microcement shines in New Orleans homes
            </h2>
            <ul className="space-y-3 text-base text-foreground">
              {[
                "Walk-in showers — replaces tile + grout entirely. One waterproof shell.",
                "Bathroom floors — wall-to-wall, with no transitions or seams.",
                "Kitchen backsplashes — counter-to-ceiling, no grout to stain.",
                "Floors in older NOLA homes — bonds directly over existing concrete, tile, or wood.",
                "Patios and pool decks — UV-stable, slip-resistant, weatherproof.",
                "Feature accent walls — paired with rockscape or marmorino for a focal point.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D97757] flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/85">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-12 bg-[#0E0E0E] text-white text-center">
          <h2
            className="text-3xl md:text-5xl font-light tracking-tight mb-5 leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Ready to see your bathroom in microcement?
          </h2>
          <p className="text-base text-white/55 max-w-xl mx-auto mb-8">
            Free preview. No account. Real cost estimate. Built by Ryan Mena, born in NOLA.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => navigate("/upload")}
              className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
              data-testid="nola-cta-final"
            >
              <Upload className="w-4 h-4 mr-2" /> Preview My Bathroom
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
