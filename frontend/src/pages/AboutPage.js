import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { TrustStrip } from "../components/TrustStrip";
import { InstantQuoteForm } from "../components/InstantQuoteForm";
import { Button } from "../components/ui/button";
import { MessageCircle, Phone, Award, Hammer, Heart, MapPin } from "lucide-react";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%20want%20to%20chat%20about%20a%20project.`;
const TEL_LINK = "tel:5042644919";
const PAGE_URL = "https://theshirtlesshandyman.com/about";

const ABOUT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${PAGE_URL}#ryan`,
  name: "Ryan Mena",
  jobTitle: "Microcement & Seamless Surface Craftsman",
  description:
    "New Orleans-born craftsman specializing in microcement, tadelakt, and custom rockscape installations. Founder of The Shirtless Handyman.",
  worksFor: {
    "@type": "HomeAndConstructionBusiness",
    name: "The Shirtless Handyman",
    url: "https://theshirtlesshandyman.com",
    telephone: "(504) 264-4919",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Orleans",
    addressRegion: "LA",
    addressCountry: "US",
  },
  knowsAbout: ["Microcement", "Tadelakt", "Venetian Plaster", "Rockscape Walls", "Pool Deck Resurfacing"],
};

const VALUES = [
  {
    icon: Hammer,
    title: "One craftsman, one job",
    body: "When you hire me, you get me. Not a sales rep, not a foreman, not a sub-sub-contractor. I show up, I run the install, I'm the one who texts you back at 9pm on a Tuesday.",
  },
  {
    icon: Heart,
    title: "I treat your house like mine",
    body: "Drop cloths down before tools come in. Daily clean-up. Photos of every coat. The bathroom is sealed off so the rest of your house keeps living. That's just how it should be.",
  },
  {
    icon: MapPin,
    title: "Born in NOLA, built for NOLA",
    body: "I grew up here. I know what humidity does to grout. I know which slab foundations are tricky. I know why your great-aunt's bathroom in Carrollton still has the same tile from 1987 and exactly why it's failing now.",
  },
  {
    icon: Award,
    title: "Real materials, real techniques",
    body: "I source authentic European microcement systems (Topciment, Mortex), real Moroccan tadelakt lime, and Italian Marmorino. Not big-box knockoffs. The finish you see in the photo is the finish you get.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="Meet Ryan Mena — Founder of The Shirtless Handyman | New Orleans Microcement Specialist"
        description="New Orleans-born craftsman specializing in microcement, tadelakt, and custom rockscape installations. The Shirtless Handyman is one guy doing the craft right. Text: 504-264-4919."
        canonical={PAGE_URL}
        ogImage="https://theshirtlesshandyman.com/portfolio/shower-led-niche.jpg"
        ogType="profile"
      >
        <script type="application/ld+json">{JSON.stringify(ABOUT_SCHEMA)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid="about-page">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-12 px-6 md:px-12 bg-[#0E0E0E] text-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">
              Meet Ryan · The Shirtless Handyman
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-5 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              One guy.<br />
              Real materials.<br />
              <span className="italic">Done right.</span>
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-2xl leading-relaxed">
              I'm not a franchise. I'm not a brokerage. I'm not 16 sub-contractors in a trenchcoat.
              I'm one craftsman in New Orleans who got tired of installing tile and started doing something better.
            </p>
          </div>
        </section>

        <TrustStrip variant="dark" />

        {/* Portrait + story */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-start">
            <div className="md:col-span-2">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#1A3C34]">
                <img
                  src="/portfolio/microcement-vanity-bathroom.jpg"
                  alt="Ryan Mena hand-finishing a microcement bathroom in New Orleans"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/85 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-1">
                    Ryan Mena
                  </p>
                  <p className="text-lg font-light" style={{ fontFamily: "'Fraunces', serif" }}>
                    Founder · Craftsman · NOLA-born
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-6 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                I used to install tile.<br />
                <span className="italic">I stopped.</span>
              </h2>
              <div className="space-y-5 text-base text-foreground/80 leading-relaxed">
                <p>
                  Born and raised in New Orleans. I spent years installing tile bathrooms across the metro — Lakeview, Uptown, Metairie, Bywater. Good work, fair prices, happy customers. And then, like clockwork, ten years later I'd be walking the same client through their black grout lines, their peeling caulk, and the wet drywall hiding behind the shower.
                </p>
                <p>
                  It wasn't the tile failing. Tile lasts forever. It was everything between the tiles — the grout, the caulk, the substrate — losing a slow war with NOLA humidity. I started telling people honestly: tile is the wrong material for this climate. They'd ask what to use instead. I didn't have a real answer.
                </p>
                <p>
                  So I went and learned. I studied microcement systems from Spain and Italy. I learned authentic Moroccan tadelakt the way it's been done in hammams for 800 years. I built sculpted rockscape feature walls. I figured out which substrates work in old NOLA homes and which ones need to be torn out first.
                </p>
                <p>
                  Now this is all I do. <strong className="text-foreground font-semibold">Microcement. Tadelakt. Rockscape. Seamless. Period.</strong> One craftsman, real materials, your house treated like it's mine. No call center. No "we'll get someone out next week." You text me. I show up. We figure out what your space wants to become.
                </p>
                <p className="text-foreground italic">
                  That's the whole pitch. Welcome to The Shirtless Handyman.
                </p>
                <p className="text-sm text-muted-foreground pt-3">— Ryan Mena</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 md:px-12 bg-[#F5F1EA] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nf'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nf)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">
                How I work
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Four things I will never compromise on.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-sm transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-[#1A3C34]/8 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-[#1A3C34]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead capture */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">
              Let's talk
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Tell me about your space.
            </h2>
            <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Drop your name and phone. I'll text you back personally within the hour — no auto-reply, no call center, no script.
            </p>
            <div className="max-w-md mx-auto">
              <InstantQuoteForm variant="light" source="about_page" />
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <a href={SMS_LINK}>
                <Button className="h-12 px-6 rounded-full bg-[#1A3C34] text-white hover:bg-[#0E2A24] font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" /> Text Ryan
                </Button>
              </a>
              <a href={TEL_LINK}>
                <Button variant="outline" className="h-12 px-6 rounded-full border-foreground/20 font-medium">
                  <Phone className="w-4 h-4 mr-2" /> Call {PHONE}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
