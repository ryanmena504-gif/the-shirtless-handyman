import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowRight, ImageIcon, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
      setItems(res.data.items || []);
    } catch {
      // Portfolio load failure is non-critical — empty state handles it
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
              Our Work
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Real Transformations
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Browse before and after photos from actual renovation projects completed by our team. See the quality of work firsthand.
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
                We're adding photos from our completed renovation projects. Check back soon to see real before and after transformations.
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

          {/* Portfolio Items */}
          {!loading && items.length > 0 && (
            <div className="space-y-16" data-testid="portfolio-items">
              {items.map((item, i) => (
                <div key={item.id} data-testid={`portfolio-item-${i}`}>
                  {/* Item header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        className="text-xl md:text-2xl font-medium text-foreground"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    {item.room_type && (
                      <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                        {item.room_type}
                      </Badge>
                    )}
                  </div>

                  {/* Before/After slider */}
                  <BeforeAfterSlider
                    beforeImage={item.before_image}
                    afterImage={item.after_image}
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                </div>
              ))}
            </div>
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
