import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";

const PHONE = "504-264-4919";

/**
 * In-app 404. Direct requests to unknown URLs are served by public/404.html
 * with an HTTP 404 from the static host. This page covers client-side
 * navigations that never hit the server.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="not-found-page">
      <SeoHead
        title="Page not found | The Shirtless Handyman"
        description="That page isn't on theshirtlesshandyman.com. Call or text 504-264-4919."
        canonical="https://www.theshirtlesshandyman.com/"
        robots="noindex, follow"
      />
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-xs uppercase tracking-[0.22em] font-bold text-[#D97757] mb-4">404</p>
        <h1 className="text-4xl font-light text-foreground mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          That page isn't here.
        </h1>
        <p className="text-muted-foreground mb-8">
          The link may be old. The homepage, the shower page, and a real person at {PHONE} are.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="inline-flex h-12 items-center px-6 rounded-full bg-[#D97757] text-white font-medium">
            Back home
          </Link>
          <a href="tel:+15042644919" className="inline-flex h-12 items-center px-6 rounded-full border border-border text-foreground">
            Call {PHONE}
          </a>
        </div>
      </main>
    </div>
  );
}
