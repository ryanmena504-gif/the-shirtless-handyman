import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import { ArrowRight, Upload, Sparkles, DollarSign, Users, ChevronRight, MessageCircle, Phone, Droplets, ShieldCheck, Paintbrush } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxkYXJrJTIwbW9vZHklMjBzZWFtbGVzcyUyMGNvbmNyZXRlJTIwc2hvd2VyJTIwYmF0aHJvb20lMjByZW5vdmF0aW9ufGVufDB8fHx8MTc3NjQ1MjM2OHww&ixlib=rb-4.1.0&q=85";

const SURFACE_BG = "https://images.unsplash.com/photo-1762117360868-d4e757073d45?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25jcmV0ZSUyMHdhbGwlMjBsdXh1cnklMjBpbnRlcmlvciUyMHJlbm92YXRpb258ZW58MHx8fHwxNzc2NDUyMzQ5fDA&ixlib=rb-4.1.0&q=85";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const TEL_LINK = "tel:5042644919";

const BENEFITS = [
  { icon: Droplets, title: "100% Waterproof", desc: "Shower walls, pool decks, kitchens — sealed tight with zero grout to fail." },
  { icon: ShieldCheck, title: "Zero Grout. Zero Mold.", desc: "One continuous surface means nothing to scrub, nothing to replace." },
  { icon: Paintbrush, title: "High-End Modern Look", desc: "Microcement, tadelakt, venetian plaster — luxury finishes that last." },
];

const SERVICES = [
  { title: "Seamless Surfaces", items: ["Microcement walls & floors", "Tadelakt showers", "Venetian plaster", "Rockscape accent walls", "Microterrazzo patios", "Pool deck resurfacing"] },
  { title: "Handyman Services", items: ["Drywall & patching", "Fixture installs", "Door & trim work", "Pressure washing", "Painting", "General repairs"] },
];

const STEPS = [
  { icon: Upload, title: "Upload Your Room", desc: "Snap a photo of any space you want transformed" },
  { icon: Sparkles, title: "AI Generates Designs", desc: "See 3 seamless surface renovation styles for your room" },
  { icon: DollarSign, title: "Get Cost Estimate", desc: "Instant pricing based on your project and location" },
  { icon: Users, title: "Connect with Ryan", desc: "Text your project directly — no middleman" },
];

const CATEGORIES = [
  { name: "Kitchen", image: "https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MHx8fHwxNzczNTMwMzgwfDA&ixlib=rb-4.1.0&q=85" },
  { name: "Bathroom", image: "https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHJlbm92YXRpb258ZW58MHx8fHwxNzczNTMwMzgxfDA&ixlib=rb-4.1.0&q=85" },
  { name: "Patio", image: "https://images.unsplash.com/photo-1763479142678-8e29f4edb538?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxiYWNreWFyZCUyMHBhdGlvJTIwcG9vbCUyMGRlc2lnbnxlbnwwfHx8fDE3NzM1MzAzODF8MA&ixlib=rb-4.1.0&q=85" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-[95vh] overflow-hidden" data-testid="hero-section">
        <img
          src={HERO_BG}
          alt="Seamless microcement shower wall"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

        <div className="relative z-10 h-full flex items-center min-h-[95vh]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-6 animate-fade-in-up opacity-0 stagger-1">
                The Shirtless Handyman — New Orleans, LA
              </p>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.08] text-white mb-6 animate-fade-in-up opacity-0 stagger-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Walls Without Grout.<br />
                Surfaces Without Limits.
              </h1>

              <p className="text-base md:text-lg leading-relaxed text-white/75 mb-8 max-w-lg animate-fade-in-up opacity-0 stagger-3">
                We coat bathrooms, kitchens, pool decks, and entire rooms in seamless microcement and luxury plaster finishes — waterproof, grout-free, and built to last. Plus full handyman services for everything else.
              </p>

              {/* Benefits pills */}
              <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up opacity-0 stagger-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <Droplets className="w-3.5 h-3.5 text-[#D97757]" /> Waterproof
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97757]" /> Zero Grout
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <Paintbrush className="w-3.5 h-3.5 text-[#D97757]" /> Modern Luxury
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up opacity-0 stagger-4">
                <a href={SMS_LINK} data-testid="hero-text-cta">
                  <Button className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Text Your Project
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => navigate("/upload")}
                  className="h-14 px-10 rounded-full border-white/30 text-white hover:bg-white/10 text-base font-medium"
                  data-testid="hero-visualize-btn"
                >
                  See It Before You Build It
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-white/40 mt-6 animate-fade-in-up opacity-0 stagger-4">
                Or call directly: <a href={TEL_LINK} className="text-white/60 hover:text-white underline underline-offset-2">{PHONE}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="benefits-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            Why Seamless
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-white mb-14"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Grout is dead. The future is seamless.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="group" data-testid={`benefit-${b.title.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="w-12 h-12 rounded-xl bg-[#D97757]/15 flex items-center justify-center mb-5 group-hover:bg-[#D97757] transition-colors duration-300">
                  <b.icon className="w-5 h-5 text-[#D97757] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{b.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            What We Do
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-14"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            High-end surfaces.<br />Everyday handyman work.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((svc) => (
              <div
                key={svc.title}
                className="bg-white border border-border/40 rounded-2xl p-8 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-500"
              >
                <h3
                  className="text-xl font-medium text-foreground mb-6"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {svc.title}
                </h3>
                <ul className="space-y-3">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI VISUALIZER ===== */}
      <section className="relative py-20 md:py-28 px-6 md:px-12 overflow-hidden" data-testid="visualizer-section">
        <img src={SURFACE_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            AI Renovation Visualizer
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            See your room in seamless surfaces<br />before we touch a wall.
          </h2>
          <p className="text-muted-foreground mb-14 max-w-xl">
            Upload a photo, pick your room type, and our AI generates 3 seamless surface designs — microcement, tadelakt, venetian plaster, and more.
          </p>

          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-500 hover:-translate-y-1 group"
                data-testid={`step-card-${i}`}
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#D97757] mb-2">0{i + 1}</div>
                <h3 className="text-base font-semibold mb-1.5 text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              onClick={() => navigate("/upload")}
              className="h-14 px-10 rounded-full bg-primary text-primary-foreground text-base font-medium btn-pill shadow-lg shadow-primary/20"
              data-testid="visualizer-cta-btn"
            >
              Try the AI Visualizer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 md:py-28 bg-[#F5F5F4] px-6 md:px-12" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            Project Types
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-14"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            What would you like<br />to transform?
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
                  <h3 className="text-2xl font-light text-white" style={{ fontFamily: "'Fraunces', serif" }}>
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

      {/* ===== OUR WORK ===== */}
      <section className="py-16 px-6 md:px-12 bg-white" data-testid="our-work-section">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
            Real Results
          </p>
          <h2
            className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            See our completed projects
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Real before and after photos from jobs we've done — no renders, no stock photos.
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

      {/* ===== BOTTOM CTA ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="cta-section">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0E0E0E] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Got a project? Text it to Ryan.
              </h2>
              <p className="text-base text-white/50 mb-10 max-w-lg mx-auto">
                Send a photo, a description, or just an idea. No sales pitch — just straight answers on what it'll take and what it'll cost.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href={SMS_LINK} data-testid="cta-text-btn">
                  <Button className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Text {PHONE}
                  </Button>
                </a>
                <a href={TEL_LINK} data-testid="cta-call-btn">
                  <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 text-base font-medium">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Instead
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/40 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} The Shirtless Handyman. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Serving Greater New Orleans &middot; {PHONE}
            </p>
          </div>
          <div className="flex gap-6">
            <button onClick={() => navigate("/portfolio")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-portfolio">Our Work</button>
            <button onClick={() => navigate("/contractor/register")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-contractor-signup">Contractor Sign Up</button>
            <button onClick={() => navigate("/contractor/login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-contractor-login">Contractor Login</button>
            <button onClick={() => navigate("/admin")} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-admin-link">Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
