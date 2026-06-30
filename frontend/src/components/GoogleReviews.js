import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * GoogleReviews — fetches Place Details from the backend (cached 12h) and
 * renders 3 review cards + the aggregate rating. Self-hides if the backend
 * returns no reviews (e.g. API key not yet configured), so it's safe to mount
 * on any page.
 */
export function GoogleReviews({ variant = "light" }) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/google-reviews`, { timeout: 8000 })
      .then((r) => {
        if (!alive) return;
        setData(r.data);
        setLoaded(true);
      })
      .catch(() => {
        if (!alive) return;
        setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!loaded) return null;
  // Graceful hide when backend can't fetch (no API key, no place_id, etc.)
  if (!data || !data.rating || !data.reviews || data.reviews.length === 0) {
    return null;
  }

  const isDark = variant === "dark";
  const top3 = data.reviews.slice(0, 3);

  return (
    <section
      className={`py-20 px-6 md:px-12 ${isDark ? "bg-[#0E0E0E] text-white" : "bg-[#FAFAF9] text-foreground"}`}
      data-testid="google-reviews-section"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <p
              className={`text-[11px] uppercase tracking-[0.22em] font-bold mb-3 ${isDark ? "text-[#D97757]" : "text-[#D97757]"}`}
            >
              What clients say on Google
            </p>
            <h2
              className={`text-3xl md:text-4xl font-light tracking-tight leading-snug ${isDark ? "text-white" : "text-foreground"}`}
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {data.rating.toFixed(1)} stars · {data.review_count || top3.length}+ verified reviews.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Stars rating={data.rating} />
            <a
              href={data.maps_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`inline-flex items-center gap-1 text-sm font-medium ${isDark ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"} transition-colors`}
              data-testid="google-reviews-cta"
            >
              See all on Google <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3.map((rev, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`p-6 rounded-2xl border ${
                isDark
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-white border-border/40 hover:shadow-sm"
              } transition-all`}
              data-testid={`google-review-card-${idx}`}
            >
              <Stars rating={rev.rating} size="sm" />
              <p
                className={`mt-3 text-sm leading-relaxed line-clamp-6 ${isDark ? "text-white/80" : "text-foreground/85"}`}
              >
                &ldquo;{rev.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                {rev.author_photo_url ? (
                  <img
                    src={rev.author_photo_url}
                    alt={rev.author_name}
                    loading="lazy"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${isDark ? "bg-[#D97757]/20 text-[#D97757]" : "bg-[#D97757]/10 text-[#D97757]"}`}
                  >
                    {(rev.author_name || "G")[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-foreground"}`}
                  >
                    {rev.author_name}
                  </p>
                  <p
                    className={`text-xs ${isDark ? "text-white/40" : "text-muted-foreground"}`}
                  >
                    {rev.relative_time}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars({ rating, size = "md" }) {
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const full = Math.round(rating || 0);
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${dim} ${i < full ? "fill-[#F5B83F] text-[#F5B83F]" : "text-[#F5B83F]/30"}`}
        />
      ))}
    </div>
  );
}
