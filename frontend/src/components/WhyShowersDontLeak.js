import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./cinematic";

/**
 * Why our showers don't leak — shared by the homepage and the shower /
 * bathroom service pages. Copy is the approved marketing language.
 * No prices, warranty terms, or licensing claims live here.
 */

const STEPS = [
  {
    title: "A custom one-piece shower pan.",
    body: "The drain is where most showers fail, so ours has no joints there to fail. It’s one piece, made for your space.",
  },
  {
    title: "A BaseCrete base layer.",
    body: "It’s waterproof on its own before anything else goes on top.",
  },
  {
    title: "A membrane plus sealer.",
    body: "That’s a third barrier before the microcement finish even goes down.",
  },
];

// Visual order is top → bottom, which is also the DOM order so a screen
// reader follows the same path as the eye. Layer 1 is the pan at the bottom.
const STACK = [
  {
    id: "finish",
    kicker: "Finish",
    title: "Seamless microcement",
    body: "No grout, no seams, no mold.",
    className: "bg-[#E7E0D4] text-[#1A3C34]",
  },
  {
    id: "membrane",
    kicker: "Layer 3",
    title: "Membrane and sealer",
    body: "A third line of defense.",
    className: "bg-[#7A3B2E] text-[#FFF8F3]",
  },
  {
    id: "basecrete",
    kicker: "Layer 2",
    title: "BaseCrete",
    body: "A waterproof foundation all on its own.",
    className: "bg-[#3E524A] text-[#F4F1EA]",
  },
  {
    id: "pan",
    kicker: "Layer 1",
    title: "Custom one-piece pan",
    body: "No drain joints, so nothing leaks where showers usually fail.",
    className: "bg-[#1A3C34] text-[#F4F1EA]",
  },
];

export function WhyShowersDontLeak() {
  const captionId = useId();
  const descId = useId();

  return (
    <section
      id="why-showers-dont-leak"
      className="py-20 md:py-28 px-6 md:px-12 bg-[#F5F1EA]"
      data-testid="why-showers-dont-leak"
      aria-labelledby="why-showers-heading"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <ScrollReveal className="lg:col-span-7 min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
            Under the finish
          </p>
          <h2
            id="why-showers-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[#1A3C34] leading-[1.1] mb-6"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Why our showers don’t leak
          </h2>
          <p className="text-base md:text-lg text-[#1A3C34]/80 leading-relaxed mb-8">
            Most bathroom disasters start where you can’t see them: behind the tile, under the pan, and around the drain. That’s why we build every shower from the studs out with a three-layer system most installers skip.
          </p>

          <ol className="list-none m-0 p-0 space-y-6 mb-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4 min-w-0" data-testid={`why-showers-step-${i + 1}`}>
                <span
                  className="shrink-0 text-2xl font-light text-[#D97757] leading-none pt-0.5 w-8"
                  style={{ fontFamily: "'Fraunces', serif" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-[#1A3C34] leading-snug">{step.title}</h3>
                  <p className="text-base text-[#1A3C34]/75 leading-relaxed mt-1">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-4 text-base text-[#1A3C34]/80 leading-relaxed mb-8">
            <p>
              Then comes the part you see: seamless microcement. There’s no grout to crack, no seams to open, and nowhere for mold to move in.
            </p>
            <p>
              It costs more than the quick version. It’s supposed to. You’re paying for the bathroom you won’t have to tear out again.
            </p>
            <p>
              And you won’t just take our word for it. Ryan walks you through every layer on your own job, so you know exactly what’s behind your walls and why.
            </p>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1A3C34] text-white text-base font-medium hover:bg-[#142F29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A3C34] w-full sm:w-auto"
            data-testid="why-showers-book-btn"
          >
            Book a site visit
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-5 min-w-0" delay={0.08}>
          <figure className="m-0" data-testid="shower-layer-diagram" aria-labelledby={captionId}>
            <p id={descId} className="sr-only">
              Cross-section of a shower, read from the finish at the top down to the pan at the bottom. The shower is built in the opposite order: the pan goes in first.
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A3C34]/55 mb-3">
              Top — the surface you touch
            </p>
            <div className="relative pl-3 sm:pl-4">
              <div
                aria-hidden="true"
                className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-[#1A3C34]/20"
              />
              <ol
                className="m-0 p-0 list-none flex flex-col rounded-2xl overflow-hidden border border-[#1A3C34]/10 shadow-[0_20px_40px_-16px_rgba(26,60,52,0.35)]"
                aria-describedby={descId}
              >
                {STACK.map((layer) => (
                  <li
                    key={layer.id}
                    className={`px-4 py-4 sm:px-5 sm:py-5 ${layer.className}`}
                    data-testid={`shower-layer-${layer.id}`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1">
                      {layer.kicker}
                    </p>
                    <h3
                      className="text-lg sm:text-xl font-medium leading-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {layer.title}
                    </h3>
                    <p className="text-sm leading-relaxed mt-1">{layer.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A3C34]/55 mt-3 mb-4">
              Bottom — against the studs
            </p>
            <figcaption
              id={captionId}
              className="text-sm md:text-base text-[#1A3C34] leading-relaxed font-medium"
              data-testid="shower-layer-caption"
            >
              Three layers of waterproofing. One seamless finish. Most installers stop at one.
            </figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
