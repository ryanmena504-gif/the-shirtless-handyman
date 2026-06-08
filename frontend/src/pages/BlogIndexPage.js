import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { TrustStrip } from "../components/TrustStrip";
import { BLOG_POSTS } from "../blog/posts";
import { ArrowRight, Clock, Calendar } from "lucide-react";

const PAGE_URL = "https://theshirtlesshandyman.com/blog";
const POSTS_PER_PAGE = 12;

const BLOG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${PAGE_URL}#blog`,
  name: "The Shirtless Handyman Journal",
  url: PAGE_URL,
  description:
    "Practical guides on seamless surfaces, microcement, tadelakt, and renovation cost in New Orleans — written by Ryan Mena.",
  publisher: {
    "@type": "HomeAndConstructionBusiness",
    name: "The Shirtless Handyman",
    url: "https://theshirtlesshandyman.com",
  },
  blogPost: BLOG_POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.publishedAt,
    url: `https://theshirtlesshandyman.com/blog/${p.slug}`,
    author: { "@type": "Person", name: "Ryan Mena" },
  })),
};

// ItemList helps Google understand the post ordering & relationships
const BLOG_ITEMLIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${PAGE_URL}#itemlist`,
  itemListOrder: "https://schema.org/ItemListOrderDescending",
  numberOfItems: BLOG_POSTS.length,
  itemListElement: BLOG_POSTS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `https://theshirtlesshandyman.com/blog/${p.slug}`,
    name: p.title,
  })),
};

// rel="prev"/"next" pagination hints — future-proof for when posts exceed POSTS_PER_PAGE.
// Computed once at module-load so the SeoHead can ship them with the initial render.
function getPaginationLinks() {
  const totalPages = Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE));
  return { totalPages, prev: null, next: totalPages > 1 ? `${PAGE_URL}/page/2` : null };
}

export default function BlogIndexPage() {
  const { prev, next } = getPaginationLinks();
  return (
    <>
      <SeoHead
        title="The Shirtless Handyman Journal | Microcement, Tadelakt & Renovation Guides for New Orleans"
        description="Practical guides on seamless surfaces, microcement, tadelakt, and renovation cost in New Orleans — written by Ryan Mena."
        canonical={PAGE_URL}
        ogImage="https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?w=1200&h=630&fit=crop&fm=jpg&q=85"
        ogType="website"
        prev={prev}
        next={next}
      >
        <script type="application/ld+json">{JSON.stringify(BLOG_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BLOG_ITEMLIST_SCHEMA)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid="blog-index">
        <Navbar />

        <section className="pt-32 pb-12 px-6 md:px-12 bg-[#0E0E0E] text-white">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#D97757] mb-4">
              The Shirtless Handyman Journal
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-5 max-w-3xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Real guides for real renovations.
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-2xl leading-relaxed">
              Written by Ryan from the jobsite. No fluff. No paid promotion. Just the truth about cost,
              craft, and what actually works in New Orleans humidity.
            </p>
          </div>
        </section>

        <TrustStrip variant="dark" />

        <section className="py-16 px-6 md:px-12 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-white border border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  data-testid={`blog-card-${post.slug}`}
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={post.heroImage}
                      alt={`${post.title} — The Shirtless Handyman, New Orleans`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTimeMin} min read
                      </span>
                    </div>
                    <h2
                      className="text-xl md:text-2xl font-light text-foreground mb-2 leading-snug"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D97757] group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
