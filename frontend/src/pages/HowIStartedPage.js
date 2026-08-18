import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Hammer, Wrench, Layers, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%20read%20your%20story%20and%20want%20to%20talk%20about%20a%20project.`;
const PAGE_URL = "https://theshirtlesshandyman.com/how-i-started";

const STORY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "How I Started — The Shirtless Handyman",
  url: PAGE_URL,
  description:
    "The origin story of The Shirtless Handyman — how Ryan Mena went from a New Orleans handyman fixing doors, drywall, and leaky faucets to a high-end seamless-surface craftsman installing microcement, tadelakt, and rockscape walls.",
  mainEntity: {
    "@type": "Person",
    "@id": "https://theshirtlesshandyman.com/about#ryan",
    name: "Ryan Mena",
    jobTitle: "Microcement & Seamless Surface Craftsman",
  },
};

const CHAPTERS = [
  {
    year: "The start",
    icon: Hammer,
    title: "A handyman with a truck and a phone",
    image: "/story/chapter-1-handyman.jpg",
    imageAlt: "The Shirtless Handyman illustration — Ryan Mena with a drill, tool belt, and heart tattoo",
    imageCaption: "The Shirtless Handyman, day one — one guy, one phone.",
    body:
      "The Shirtless Handyman didn't start as a high-end finish studio. It started with me — one guy, one truck, and a phone that wouldn't stop ringing. Doors that wouldn't close. Drywall a kid put a foot through. Leaky faucets. Ceiling fans nobody could figure out. If it was broken in a New Orleans house, I'd show up and fix it.",
  },
  {
    year: "The turn",
    icon: Wrench,
    title: "Bathrooms kept finding me",
    image: "/story/chapter-2-tile-bathroom.jpg",
    imageAlt: "A patterned encaustic-tile bathroom Ryan installed — glass shower door, decorative floor tile, wall niche",
    imageCaption: "One of my tile jobs — patterned encaustic floor, glass shower, wall niche.",
    secondImage: "/failures/mold-shower-door.jpg",
    secondImageAlt: "Black mold blooming around the caulk line at a shower door frame — water infiltration from a failed seal",
    secondImageCaption: "Same kind of bathroom, ten years later — mold blooming right at the caulk line. This is what humidity does to a seam.",
    body:
      "Handyman jobs led to bathroom jobs. Bathroom jobs led to tile work. I spent years installing tile across the metro — Lakeview, Uptown, Metairie, Bywater. Good work at fair prices. But every ten years I'd get called back to the same houses. Same story every time: black grout lines, peeling caulk, mold behind the drywall, humidity chewing through the seams. The tile was fine. Everything holding it together wasn't.",
  },
  {
    year: "The shift",
    icon: Layers,
    title: "I went and learned something better",
    image: "/story/chapter-3-microcement-mid-job.png",
    imageAlt: "A bathroom mid-installation — microcement walls, a hand-formed sink, terrazzo-look floor, and tools still on the ground",
    imageCaption: "Mid-job. Microcement walls, hand-formed sink, tools still on the floor.",
    body:
      "I started telling clients straight up: tile is the wrong material for this climate. They'd ask what to use instead — and I didn't have a real answer. So I found one. I trained on European microcement systems from Spain and Italy. I studied authentic Moroccan tadelakt the way it's been hand-burnished in hammams for 800 years. I learned Venetian plaster, sculpted rockscape walls, and how to make all of it work in old NOLA houses that shift, sink, and sweat.",
  },
  {
    year: "Today",
    icon: Sparkles,
    title: "Still one craftsman. Just a sharper craft.",
    image: "/story/chapter-4-finished-shower.jpg",
    imageAlt: "A finished seamless microcement shower with an LED-lit niche and a brick accent detail",
    imageCaption: "A recent finish — seamless microcement, LED niche, brick accent.",
    body:
      "Now this is all I do. Microcement, tadelakt, rockscape, seamless — full stop. Same phone. Same truck. Same guy showing up. The handyman roots are still here — I still help clients with smaller fixes while I'm on a bigger job — but the main work is high-end finish craft that outlasts the humidity and looks like nothing else in the city. If you called me five years ago to patch drywall and you call me today for a wet-room, you're still getting the same person on the other end.",
  },
];

export default function HowIStartedPage() {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="How I Started — From NOLA Handyman to Seamless-Surface Craftsman | The Shirtless Handyman"
        description="The origin story of The Shirtless Handyman. How Ryan Mena went from a New Orleans handyman fixing drywall and doors to a high-end microcement, tadelakt, and rockscape specialist."
        canonical={PAGE_URL}
        ogImage="https://theshirtlesshandyman.com/portfolio/shower-led-niche.jpg"
        ogType="article"
      >
        <script type="application/ld+json">{JSON.stringify(STORY_SCHEMA)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid="how-i-started-page">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 md:px-12 bg-[#0E0E0E] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img
              src="/portfolio/shower-led-niche.jpg"
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/85 to-transparent" />
          <div className="relative max-w-5xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-4">
              How I started · New Orleans, LA
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
              data-testid="how-i-started-h1"
            >
              I started as a handyman.<br />
              <span className="italic">Then the work got sharper.</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
              The Shirtless Handyman started with a truck, a phone, and every kind of small-fix job in New Orleans. It's now a high-end seamless-surface studio doing microcement, tadelakt, and custom rockscape work. Here's how that happened — in my own words.
            </p>
          </div>
        </section>

        {/* Story chapters — vertical timeline */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical rule */}
              <div className="absolute left-6 md:left-8 top-2 bottom-2 w-px bg-border/60" aria-hidden="true" />

              {CHAPTERS.map((c, i) => (
                <motion.article
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative pl-16 md:pl-20 pb-14 last:pb-0"
                  data-testid={`story-chapter-${i}`}
                >
                  <div className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1A3C34] flex items-center justify-center shadow-lg">
                    <c.icon className="w-5 h-5 md:w-6 md:h-6 text-[#D97757]" />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-2">
                    {c.year}
                  </p>
                  <h2
                    className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4 leading-tight"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {c.title}
                  </h2>
                  <p className="text-base text-foreground/75 leading-relaxed max-w-2xl">
                    {c.body}
                  </p>

                  {c.image && (
                    <figure
                      className="mt-6 max-w-2xl"
                      data-testid={`story-chapter-${i}-figure`}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-[#F5F1EA] shadow-sm">
                        <img
                          src={c.image}
                          alt={c.imageAlt}
                          loading="lazy"
                          className="block w-full h-auto"
                        />
                      </div>
                      {c.imageCaption && (
                        <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {c.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {c.secondImage && (
                    <figure
                      className="mt-6 max-w-2xl"
                      data-testid={`story-chapter-${i}-figure-2`}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-[#F5F1EA] shadow-sm">
                        <img
                          src={c.secondImage}
                          alt={c.secondImageAlt}
                          loading="lazy"
                          className="block w-full h-auto"
                        />
                      </div>
                      {c.secondImageCaption && (
                        <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {c.secondImageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </motion.article>
              ))}
            </div>

            {/* Signature */}
            <div className="pl-16 md:pl-20 mt-4">
              <p className="text-sm text-muted-foreground italic">
                — Ryan Mena, Founder
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 px-6 md:px-12 bg-[#F5F1EA] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nf'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nf)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-4">
              Same guy, better craft
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-5 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Ready to see what your space could become?
            </h2>
            <p className="text-base text-foreground/70 mb-8 max-w-xl mx-auto">
              Upload a photo of any room and The Seamless Studio will show you 3 finished designs in about 60 seconds. Or send me a text — I answer them all personally.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => navigate("/upload")}
                className="h-13 px-7 rounded-full bg-[#D97757] text-white font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                data-testid="story-cta-studio"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try The Seamless Studio
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <a href={SMS_LINK}>
                <Button
                  variant="outline"
                  className="h-13 px-7 rounded-full border-foreground/20 text-foreground hover:bg-foreground/5 font-medium"
                  data-testid="story-cta-text"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Text me — {PHONE}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
