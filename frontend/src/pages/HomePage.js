import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import { ArrowRight, Upload, Sparkles, DollarSign, Users, ChevronRight } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1704040686433-b1c45e9f4104?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwcmVub3ZhdGlvbiUyMGFmdGVyfGVufDB8fHx8MTc3MzUzMDM3OHww&ixlib=rb-4.1.0&q=85";

const CATEGORIES = [
  { name: "Kitchen", image: "https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MHx8fHwxNzczNTMwMzgwfDA&ixlib=rb-4.1.0&q=85" },
  { name: "Bathroom", image: "https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHJlbm92YXRpb258ZW58MHx8fHwxNzczNTMwMzgxfDA&ixlib=rb-4.1.0&q=85" },
  { name: "Patio", image: "https://images.unsplash.com/photo-1763479142678-8e29f4edb538?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxiYWNreWFyZCUyMHBhdGlvJTIwcG9vbCUyMGRlc2lnbnxlbnwwfHx8fDE3NzM1MzAzODF8MA&ixlib=rb-4.1.0&q=85" },
];

const STEPS = [
  { icon: Upload, title: "Upload Your Room", desc: "Snap a photo of any room you want to renovate" },
  { icon: Sparkles, title: "AI Generates Designs", desc: "See 3 stunning renovation styles for your space" },
  { icon: DollarSign, title: "Get Cost Estimate", desc: "Instant pricing based on your location and project" },
  { icon: Users, title: "Connect with Pros", desc: "Find and hire verified local contractors" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden" data-testid="hero-section">
        <img
          src={HERO_BG}
          alt="Modern renovated living room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest font-semibold text-white/70 mb-4 animate-fade-in-up opacity-0 stagger-1">
                AI-Powered Home Renovation
              </p>
              <h1
                className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] text-white mb-6 animate-fade-in-up opacity-0 stagger-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                See Your Renovated Room Before You Build It
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-white/80 mb-10 animate-fade-in-up opacity-0 stagger-3">
                Upload a photo, get AI-generated redesigns, cost estimates, and connect with local contractors — all in minutes.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up opacity-0 stagger-4">
                <Button
                  onClick={() => navigate("/upload")}
                  className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-black/20 hover:bg-[#C56545]"
                  data-testid="hero-cta-btn"
                >
                  Start My Renovation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById("how-it-works");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-14 px-10 rounded-full border-white/30 text-white hover:bg-white/10 text-base font-medium"
                  data-testid="hero-learn-btn"
                >
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 md:px-12" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
            Simple Process
          </p>
          <h2
            className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-16"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Four steps to your<br />dream renovation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-white border border-border/40 rounded-2xl p-8 hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-500 hover:-translate-y-1 group"
                data-testid={`step-card-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-[#D97757] mb-2">0{i + 1}</div>
                <h3 className="text-xl font-medium mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-[#F5F5F4] px-6 md:px-12" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
            Project Types
          </p>
          <h2
            className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-16"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            What would you like<br />to renovate?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("/upload", { state: { projectType: cat.name } })}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
                data-testid={`category-${cat.name.toLowerCase()}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <h3
                    className="text-2xl font-light text-white"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {cat.name}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#D97757] transition-colors duration-300">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* See Our Work CTA */}
      <section className="py-16 px-6 md:px-12 bg-white" data-testid="our-work-section">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
            Real Results
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            See our completed projects
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Browse real before and after photos from renovation jobs we've completed.
          </p>
          <Button
            onClick={() => navigate("/portfolio")}
            variant="outline"
            className="rounded-full h-12 px-8 border-[#D97757]/40 text-[#D97757] hover:bg-[#D97757]/5 text-sm font-medium"
            data-testid="home-see-our-work-btn"
          >
            See Our Work
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="cta-section">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center noise-overlay relative overflow-hidden">
            <div className="relative z-10">
              <h2
                className="text-4xl md:text-5xl font-light tracking-tight text-white mb-6"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Ready to transform your space?
              </h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                Join thousands of homeowners who've visualized their renovation before committing.
              </p>
              <Button
                onClick={() => navigate("/upload")}
                className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg hover:bg-[#C56545]"
                data-testid="cta-btn"
              >
                Start My Renovation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Seamless Bath. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button
              onClick={() => navigate("/contractor/register")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="footer-contractor-signup"
            >
              Contractor Sign Up
            </button>
            <button
              onClick={() => navigate("/contractor/login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="footer-contractor-login"
            >
              Contractor Login
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="footer-admin-link"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
