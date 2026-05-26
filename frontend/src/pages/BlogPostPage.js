import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { Button } from "../components/ui/button";
import { InstantQuoteForm } from "../components/InstantQuoteForm";
import { BLOG_POSTS_BY_SLUG, BLOG_POSTS } from "../blog/posts";
import { ArrowLeft, ArrowRight, Calendar, Clock, Upload, MessageCircle } from "lucide-react";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:${PHONE.replace(/-/g, "")}?body=Hey%20Ryan%2C%20I%20read%20your%20blog%20post%20and%20want%20a%20quote.`;

function SectionRenderer({ section, navigate }) {
  switch (section.type) {
    case "p":
      return <p className="text-base text-foreground/85 leading-relaxed">{section.content}</p>;
    case "h2":
      return (
        <h2
          className="text-2xl md:text-3xl font-light tracking-tight text-foreground mt-12 mb-4 leading-snug"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {section.content}
        </h2>
      );
    case "h3":
      return <h3 className="text-xl font-semibold text-foreground mt-8 mb-2">{section.content}</h3>;
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-2 text-base text-foreground/85">
          {section.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#D97757] pl-5 italic text-foreground/85 my-6">
          {section.content}
        </blockquote>
      );
    case "cta":
      return (
        <div className="my-8 p-6 bg-[#1A3C34] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <p className="font-medium">{section.text}</p>
          <Button
            onClick={() => navigate(section.href)}
            className="h-11 px-6 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545] whitespace-nowrap"
          >
            {section.href === "/upload" ? <Upload className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            {section.href === "/upload" ? "Try Free" : "Learn more"}
          </Button>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS_BY_SLUG[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 px-6 md:px-12 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-light mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Post not found
          </h1>
          <p className="text-muted-foreground mb-6">That article doesn't exist — let's get you back.</p>
          <Link to="/blog" className="text-[#D97757] underline">Back to the journal</Link>
        </div>
      </div>
    );
  }

  const pageUrl = `https://theshirtlesshandyman.com/blog/${post.slug}`;
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        headline: post.title,
        description: post.description,
        image: post.heroImage,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { "@type": "Person", name: "Ryan Mena", url: "https://theshirtlesshandyman.com" },
        publisher: {
          "@type": "HomeAndConstructionBusiness",
          name: "The Shirtless Handyman",
          url: "https://theshirtlesshandyman.com",
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        keywords: post.tags?.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://theshirtlesshandyman.com" },
          { "@type": "ListItem", position: 2, name: "Journal", item: "https://theshirtlesshandyman.com/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <SeoHead
        title={`${post.title} | The Shirtless Handyman`}
        description={post.description}
        canonical={pageUrl}
        ogImage={post.ogImage || post.heroImage}
        ogType="article"
      >
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </SeoHead>

      <div className="min-h-screen bg-background" data-testid={`blog-post-${post.slug}`}>
        <Navbar />

        <article className="pt-32 pb-16 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> The Journal
            </Link>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.1] text-foreground mb-5"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMin} min read
              </span>
              <span>by Ryan Mena</span>
            </div>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-10 bg-muted">
              <img
                src={post.heroImage}
                alt={`${post.title} — The Shirtless Handyman, New Orleans`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-5">
              {post.sections.map((section, idx) => (
                <SectionRenderer key={idx} section={section} navigate={navigate} />
              ))}
            </div>

            {/* Quick lead capture at end of every article */}
            <div className="mt-14 pt-10 border-t border-border/40">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-3">
                Ready when you are
              </p>
              <h3
                className="text-2xl font-light text-foreground mb-3"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Want a real quote on your project?
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Drop your name and phone — Ryan texts you back personally within an hour.
              </p>
              <InstantQuoteForm variant="light" source={`blog_${post.slug}`} />
            </div>

            {/* Mobile-friendly secondary CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/upload")}
                className="h-12 px-6 rounded-full bg-[#D97757] text-white font-medium hover:bg-[#C56545]"
                data-testid={`blog-cta-upload-${post.slug}`}
              >
                <Upload className="w-4 h-4 mr-2" /> Try the Seamless Studio
              </Button>
              <a href={SMS_LINK}>
                <Button variant="outline" className="h-12 px-6 rounded-full font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" /> Text Ryan
                </Button>
              </a>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="py-16 px-6 md:px-12 bg-[#FAFAF9]">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-2xl md:text-3xl font-light text-foreground mb-8"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Keep reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="group bg-white border border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={rp.heroImage} alt={rp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground leading-snug mb-1.5">{rp.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
