import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

/**
 * FilmstripGallery — horizontal swipe-through portfolio.
 * Large full-height photos with title/room overlaid, snap scrolling,
 * arrow navigation on desktop. Replaces the before/after slider.
 */
export function FilmstripGallery({ items }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    const card = track.children[clamped];
    if (card) {
      track.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
    }
    setIndex(clamped);
  };

  // Keep the counter in sync when the user swipes manually.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const cards = Array.from(track.children);
        let best = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - 24 - track.scrollLeft);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setIndex(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div data-testid="filmstrip-gallery" className="relative">
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:-mx-12 md:px-12"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <figure
            key={item.id || i}
            data-testid={`filmstrip-card-${i}`}
            className="snap-start shrink-0 w-[82vw] sm:w-[60vw] md:w-[44vw] lg:w-[36vw]"
          >
            <div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/5] group">
              <img
                src={item.after_image || item.before_image}
                alt={item.title || `Project ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={i < 2 ? "eager" : "lazy"}
              />
              {/* Bottom gradient + caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 pt-16">
                {item.room_type && (
                  <Badge
                    variant="secondary"
                    className="mb-2 text-[11px] bg-white/15 text-white border-0 backdrop-blur-sm"
                  >
                    {item.room_type}
                  </Badge>
                )}
                <figcaption
                  className="text-white text-xl md:text-2xl font-medium tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {item.title || `Project ${i + 1}`}
                </figcaption>
                {item.description && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              {/* Index number */}
              <span
                className="absolute top-4 right-5 text-white/60 text-sm font-medium tabular-nums"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </figure>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => scrollTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            data-testid="filmstrip-prev"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollTo(index + 1)}
            disabled={index === items.length - 1}
            aria-label="Next photo"
            data-testid="filmstrip-next"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
