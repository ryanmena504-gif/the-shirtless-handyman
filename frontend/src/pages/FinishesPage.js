import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { ArrowRight, MessageCircle } from "lucide-react";

const PAGE_URL = "https://theshirtlesshandyman.com/finishes";
const PHONE_SMS =
  "sms:5042644919?body=Hey%20Ryan%2C%20I%20saw%20your%20finishes%20page%20and%20have%20a%20question.";

/**
 * Finishes — the microcement / plaster finish gallery.
 * Every finish is mixed and hand-troweled on site by Ryan.
 * Names + descriptions match the "microcement mood" board Ryan picked.
 */
const FINISHES = [
  {
    name: "French Quarter Alabaster",
    category: "Warm mineral plaster",
    description: "Smooth satin with subtle trowel movement.",
    image: "/finishes/french-quarter-alabaster.jpg",
    swatch: "#E9E1D3",
  },
  {
    name: "Smoked Industrial Concrete",
    category: "Microcement floor & wall",
    description: "Deep tone variation, matte sealed, waterproof.",
    image: "/finishes/smoked-industrial-concrete.jpg",
    swatch: "#4B4B49",
  },
  {
    name: "Garden District Terracotta",
    category: "Warm earth lime wash",
    description: "Velvety clay tone, breathable organic lime base.",
    image: "/finishes/garden-district-terracotta.jpg",
    swatch: "#C4704F",
  },
  {
    name: "Warm Linen Wetroom Finish",
    category: "Seamless waterproof microcement",
    description: "Non-porous, mold-resistant, ideal for curb-less showers.",
    image: "/finishes/warm-linen-wetroom.jpg",
    swatch: "#D9CFC0",
  },
];

const FINISHES_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Microcement and plaster finishes by The Shirtless Handyman",
  itemListElement: FINISHES.map((f, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: f.name,
    description: `${f.category}: ${f.description}`,
    image: `https://theshirtlesshandyman.com${f.image}`,
  })),
};

export default function FinishesPage() {
  return (
    <>
      <SeoHead
        title="Microcement & Plaster Finishes | The Shirtless Handyman"
        description="Finish tones I mix and hand-trowel on site: French Quarter Alabaster, Smoked Industrial Concrete, Garden District Terracotta, and Warm Linen Wetroom Finish. Seamless, waterproof microcement and plaster in New Orleans."
        canonical={PAGE_URL}
        ogImage="https://theshirtlesshandyman.com/finishes/french-quarter-alabaster.jpg"
      >
        <script type="application/ld+json">
          {JSON.stringify(FINISHES_SCHEMA)}
        </script>
      </SeoHead>
      <div className="min-h-screen bg-background" data-testid="finishes-page">
        <Navbar />

        {/* Hero */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <p
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
              data-testid="finishes-eyebrow"
            >
              Finishes
            </p>
            <h1
              className="text-4xl md:text-6xl font-semibold tracking-tight mb-5"
              style={{ fontFamily: "'Fraunces', serif" }}
              data-testid="finishes-heading"
            >
              Finish tones I mix &amp; hand-trowel
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every finish is mixed and applied on site. Pick a starting point
              — I&rsquo;ll tailor it to your light and space.
            </p>
          </div>
        </section>

        {/* Finish cards */}
        <section className="pb-16 md:pb-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {FINISHES.map((finish) => (
              <article
                key={finish.name}
                className="group rounded-3xl overflow-hidden border border-border/40 bg-card"
                data-testid={`finish-card-${finish.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={finish.image}
                    alt={`${finish.name} — ${finish.description}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    {finish.category}
                  </p>
                  <h2
                    className="text-2xl font-semibold tracking-tight mb-2 flex items-center gap-2.5"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: finish.swatch }}
                      aria-hidden="true"
                    />
                    {finish.name}
                  </h2>
                  <p className="text-muted-foreground mb-5">
                    {finish.description}
                  </p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D97757] hover:text-[#C56545] transition-colors"
                  >
                    Request this finish <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10 max-w-xl mx-auto">
            Don&rsquo;t see your tone? I mix custom colors on site — text me a
            photo of what you&rsquo;re after.
          </p>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-12 pb-20 md:pb-28">
          <div className="max-w-5xl mx-auto rounded-3xl bg-primary/5 border border-primary/20 p-10 md:p-14 text-center">
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Like one of these? Let&rsquo;s put it on your walls.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start a project and mention the finish by name — I&rsquo;ll bring
              samples to your estimate.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#D97757] hover:bg-[#C56545] text-white font-semibold transition-colors"
                data-testid="finishes-cta-start"
              >
                Start a Project <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={PHONE_SMS}
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white/10 hover:bg-white/15 font-semibold border border-white/20 transition-colors"
                data-testid="finishes-cta-text"
              >
                <MessageCircle className="w-4 h-4" /> Text Me
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
