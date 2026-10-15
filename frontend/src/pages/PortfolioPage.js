import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { FilmstripGallery } from "../components/FilmstripGallery";
import { Button } from "../components/ui/button";
import { ArrowRight, ImageIcon, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Static fallback — Ryan's actual project photos shipped with the site.
// Used when the portfolio API is unreachable or returns nothing.
const STATIC_PORTFOLIO = [
  {
    id: "static-1",
    after_image: "/portfolio/shower-led-niche.jpg",
    title: "Seamless Shower with LED Niche",
    room_type: "Bathroom",
    description: "Microcement shower with integrated LED niche — no grout, no mold.",
  },
  {
    id: "static-2",
    after_image: "/portfolio/microcement-vanity-bathroom.jpg",
    title: "Microcement Vanity Bathroom",
    room_type: "Bathroom",
    description: "Full microcement bathroom — walls, vanity, seamless finish.",
  },
  {
    id: "static-5",
    after_image: "/portfolio/third-job.jpg",
    title: "Custom Renovation",
    room_type: "Bathroom",
    description: "Seamless surface transformation by Ryan Mena.",
  },
];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${API}/portfolio`);
      const apiItems = res.data.items || [];
      // Fall back to static photos when the API has nothing
      setItems(apiItems.length > 0 ? apiItems : STATIC_PORTFOLIO);
    } catch {
      // API unreachable — show Ryan's static portfolio photos
      setItems(STATIC_PORTFOLIO);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="portfolio-page">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
              My Work
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Real Transformations
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Browse before and after photos from actual renovation projects — every job installed personally by Ryan. See the quality of work firsthand.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading portfolio...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3
                className="text-xl font-medium text-foreground mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Portfolio Coming Soon
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                I&rsquo;m adding photos from recent renovation projects. Check back soon to see real before and after transformations.
              </p>
              <Button
                onClick={() => navigate("/upload")}
                className="rounded-full bg-primary text-primary-foreground btn-pill"
                data-testid="portfolio-start-project-btn"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Portfolio filmstrip */}
          {!loading && items.length > 0 && (
            <FilmstripGallery items={items} />
          )}

          {/* CTA at bottom */}
          {!loading && items.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10 md:p-14">
                <h2
                  className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Ready for your own transformation?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Upload a photo of your room and let The Seamless Studio show you what's possible.
                </p>
                <Button
                  onClick={() => navigate("/upload")}
                  className="h-12 px-8 rounded-full bg-[#D97757] text-white hover:bg-[#C56545] btn-pill shadow-lg shadow-[#D97757]/20"
                  data-testid="portfolio-cta-btn"
                >
                  Start My Renovation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
