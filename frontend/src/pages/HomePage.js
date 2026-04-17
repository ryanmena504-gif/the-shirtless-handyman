import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import { ArrowRight, Upload, Sparkles, DollarSign, ChevronRight, MessageCircle, Phone, Droplets, ShieldCheck, Paintbrush, AlertCircle, Layers, CalendarCheck } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1587023705112-34a9b4fe8317?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxkYXJrJTIwbW9vZHklMjBzZWFtbGVzcyUyMGNvbmNyZXRlJTIwc2hvd2VyJTIwYmF0aHJvb20lMjByZW5vdmF0aW9ufGVufDB8fHx8MTc3NjQ1MjM2OHww&ixlib=rb-4.1.0&q=85";

const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const TEL_LINK = "tel:5042644919";

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
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

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
                See Your Space In<br />
                Seamless Surfaces — Instantly.
              </h1>

              <p className="text-base md:text-lg leading-relaxed text-white/75 mb-8 max-w-lg animate-fade-in-up opacity-0 stagger-3">
                Upload a photo of any room — bathroom, kitchen, floors, walls, pool deck, patio — and watch our AI transform it with seamless microcement, tadelakt, and luxury plaster finishes. No grout. No limits. No guesswork.
              </p>

              {/* Benefits pills */}
              <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up opacity-0 stagger-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <Droplets className="w-3.5 h-3.5 text-[#D97757]" /> 100% Waterproof
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97757]" /> Zero Grout Lines
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/90">
                  <Paintbrush className="w-3.5 h-3.5 text-[#D97757]" /> Modern Luxury Finish
                </span>
              </div>

              {/* CTAs — AI tool is primary */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up opacity-0 stagger-4">
                <Button
                  onClick={() => navigate("/upload")}
                  className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                  data-testid="hero-cta-btn"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your Photo — See the Transformation
                </Button>
                <a href={SMS_LINK} data-testid="hero-text-cta">
                  <Button variant="outline" className="h-14 px-10 rounded-full border-white/30 text-white hover:bg-white/10 text-base font-medium">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Text Your Project
                  </Button>
                </a>
              </div>

              <p className="text-sm text-white/40 mt-6 animate-fade-in-up opacity-0 stagger-4">
                Or call Ryan directly: <a href={TEL_LINK} className="text-white/60 hover:text-white underline underline-offset-2">{PHONE}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="problem-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Pain points */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
                Sound Familiar?
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-8 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                You know your space needs work.<br />
                You just can't see the finish line.
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Can't picture the upgrade</h3>
                    <p className="text-sm text-white/45 leading-relaxed">You know you want something better — but choosing materials from a swatch book doesn't tell you how it'll actually look in your space.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Scared of wasting money</h3>
                    <p className="text-sm text-white/45 leading-relaxed">Renovations aren't cheap. Committing thousands without seeing the result? That keeps people stuck for years.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">Tired of grout, mold, and outdated finishes</h3>
                    <p className="text-sm text-white/45 leading-relaxed">Scrubbing grout lines that turn black. Caulk that peels. Tile that looks like it's from 2005. You deserve better.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution transition */}
            <div className="bg-gradient-to-br from-[#D97757]/10 to-[#D97757]/5 border border-[#D97757]/20 rounded-3xl p-10 md:p-12">
              <div className="w-14 h-14 rounded-2xl bg-[#D97757] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3
                className="text-2xl md:text-3xl font-light tracking-tight text-white mb-4 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Now you can see your upgrade before you commit a single dollar.
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8">
                Our AI takes a photo of your actual space and shows you exactly what it looks like coated in seamless microcement, tadelakt, venetian plaster, or any of our premium finishes. Three design options. Real cost estimates. In about 60 seconds.
              </p>
              <Button
                onClick={() => navigate("/upload")}
                className="h-12 px-8 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                data-testid="problem-cta-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload a Photo — See It Transformed
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT ARE SEAMLESS SURFACES ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12" data-testid="seamless-explainer-section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
              The Future of Surfaces
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-4 leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              What are seamless surfaces?<br />
              And why is this what our AI shows you?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seamless surfaces use microcement, tadelakt, and luxury plaster coatings applied directly over your existing walls, floors, and counters. No demolition. No grout lines. Just one smooth, continuous, waterproof surface — and that's exactly what our AI renovation tool designs for your space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { title: "Bathrooms & Showers", desc: "Waterproof micro quartz and tadelakt replace every tile and grout line with a single seamless shell. Walk-in showers, tub surrounds, vanity walls — all one surface.", icon: Droplets },
              { title: "Floors & Walls", desc: "Microcement flows wall-to-wall, room-to-room. No joints, no transitions, no seams. Warm underfoot, cool to the eye. Works on concrete, tile, even wood subfloors.", icon: Layers },
              { title: "Kitchens & Counters", desc: "Beton cire countertops with waterfall edges. Venetian plaster backsplashes that go from counter to ceiling. Zero grout to scrub, ever.", icon: ShieldCheck },
              { title: "Outdoor & Pool Areas", desc: "Microterrazzo pool decks. Cocciopesto patios. Rockscape accent walls made from sculpted foam and microaggregate. Built for sun, rain, and bare feet.", icon: Paintbrush },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-border/40 rounded-2xl p-7 hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1 group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-[#D97757] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Surface types */}
          <div className="bg-[#F5F5F4] rounded-3xl p-8 md:p-12">
            <h3
              className="text-xl font-medium text-foreground mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Finishes we install — and what the AI shows you
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                "Microcement", "Tadelakt", "Venetian Plaster", "Roman Clay", "Marmorino",
                "Stucco Lustro", "Grassello di Calce", "Beton Cire", "Cocciopesto", "Microterrazzo",
                "Micro Quartz", "Lime Wash", "Seamless Epoxy", "Rockscape Walls", "Solid Surface",
              ].map((finish) => (
                <div key={finish} className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-border/40">
                  <span className="w-2 h-2 rounded-full bg-[#D97757] flex-shrink-0" />
                  <span className="text-sm text-foreground font-medium">{finish}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ROCKSCAPE FEATURE WALLS ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E] overflow-hidden" data-testid="rockscape-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1738585608732-49294c24ece0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHx0ZXh0dXJlZCUyMHN0b25lJTIwYWNjZW50JTIwd2FsbCUyMGludGVyaW9yJTIwbHV4dXJ5JTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwwfHx8fDE3NzY0NTM1Njd8MA&ixlib=rb-4.1.0&q=85"
                alt="Sculpted rockscape accent wall with dramatic backlighting"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1.5 rounded-full bg-[#D97757] text-white text-xs font-bold uppercase tracking-wider">
                  Signature Service
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-4">
                Custom Rockscape Walls
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-tight text-white mb-6 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                A wall that stops people<br />in their tracks.
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-6">
                Our rockscape walls are hand-sculpted from shaped foam blocks, coated in microaggregate to create a surface that looks and feels like carved natural stone. Backlit, textured, and completely custom — each one is a one-of-a-kind statement piece.
              </p>
              <p className="text-base text-white/60 leading-relaxed mb-8">
                Behind the bed. Behind the bar. Around the fireplace. In the entryway. Anywhere you want jaws to drop.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  "Hand-sculpted to your space — no two are alike",
                  "Microaggregate finish for authentic rock texture",
                  "LED backlighting for dramatic effect",
                  "Bedrooms, living rooms, restaurants, lobbies",
                  "Preview it first with our AI renovation tool",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] flex-shrink-0" />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/upload")}
                  className="h-12 px-8 rounded-full bg-[#D97757] text-white text-sm font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
                  data-testid="rockscape-visualize-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Preview a Rockscape Wall in Your Space
                </Button>
                <a href={SMS_LINK} data-testid="rockscape-text-btn">
                  <Button variant="outline" className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request a Custom Design
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HANDYMAN (secondary) ===== */}
      <section className="py-14 px-6 md:px-12 bg-[#FAFAF9] border-y border-border/40" data-testid="handyman-section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground/60 mb-2">
              Also Available
            </p>
            <h3
              className="text-xl md:text-2xl font-light tracking-tight text-foreground mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Need a handyman? We do that too.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Drywall patches, fixture installs, door and trim work, painting, pressure washing, and general repairs. Our main focus is seamless surfaces — but we're happy to help with the small stuff while we're there.
            </p>
          </div>
          <a href={SMS_LINK} className="flex-shrink-0" data-testid="handyman-text-btn">
            <Button variant="outline" className="h-11 px-6 rounded-full border-border/60 text-foreground hover:bg-accent text-sm font-medium">
              <MessageCircle className="w-4 h-4 mr-2" />
              Text Ryan — {PHONE}
            </Button>
          </a>
        </div>
      </section>

      {/* ===== HOW IT WORKS (simplified) ===== */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              How It Works
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Four steps. That's it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0">
            {[
              { num: "01", icon: Upload, title: "Upload your space", desc: "Snap a photo of any room, wall, floor, or outdoor area." },
              { num: "02", icon: Sparkles, title: "See it redesigned", desc: "AI shows you 3 seamless surface options — instantly." },
              { num: "03", icon: DollarSign, title: "Get a quote", desc: "Real cost estimates based on your project and location." },
              { num: "04", icon: CalendarCheck, title: "Schedule the build", desc: "Text Ryan, lock in a date, and we make it real." },
            ].map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center px-6 py-8" data-testid={`step-${i}`}>
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-[52px] left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border/60" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5 relative z-10">
                  <step.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xs font-bold text-[#D97757] mb-2">{step.num}</span>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate("/upload")}
              className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-medium btn-pill shadow-lg shadow-[#D97757]/30 hover:bg-[#C56545]"
              data-testid="how-it-works-cta"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your Photo Now
            </Button>
          </div>
        </div>
      </section>

      {/* ===== GALLERY — What the AI shows = what we build ===== */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E]" data-testid="gallery-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#D97757] mb-3">
              From Screen to Reality
            </p>
            <h2
              className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              What you see in the tool<br />can be built in real life.
            </h2>
            <p className="text-sm text-white/45 max-w-lg mx-auto">
              Our AI designs with the exact same finishes we install. Every surface you preview is something we can put on your walls, floors, and counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Bathrooms",
                desc: "Tadelakt showers, micro quartz wet zones, seamless vanity walls",
                image: "https://images.unsplash.com/photo-1738748444626-08b04513bcac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxwb2xpc2hlZCUyMGNvbmNyZXRlJTIwbHV4dXJ5JTIwYmF0aHJvb20lMjBtaW5pbWFsfGVufDB8fHx8MTc3NjQ1MjM2Mnww&ixlib=rb-4.1.0&q=85",
                type: "Bathroom",
              },
              {
                title: "Floors",
                desc: "Microcement, beton cire, and microterrazzo — wall to wall, no seams",
                image: "https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxwb2xpc2hlZCUyMGNvbmNyZXRlJTIwZmxvb3IlMjBpbnRlcmlvciUyMG9wZW4lMjBwbGFuJTIwbW9kZXJufGVufDB8fHx8MTc3NjQ1Mzc3Mnww&ixlib=rb-4.1.0&q=85",
                type: "Living Room",
              },
              {
                title: "Feature Walls",
                desc: "Rockscape, venetian plaster, marmorino — the focal point of any room",
                image: "https://images.unsplash.com/photo-1738585608732-49294c24ece0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwyfHx0ZXh0dXJlZCUyMHN0b25lJTIwYWNjZW50JTIwd2FsbCUyMGludGVyaW9yJTIwbHV4dXJ5JTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwwfHx8fDE3NzY0NTM1Njd8MA&ixlib=rb-4.1.0&q=85",
                type: "Bedroom",
              },
              {
                title: "Outdoor Spaces",
                desc: "Pool decks, patios, outdoor kitchens — sealed against sun and rain",
                image: "https://images.unsplash.com/photo-1762811054950-b74e0a055c80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvdXRkb29yJTIwcGF0aW8lMjBjb25jcmV0ZSUyMHBvb2wlMjBkZWNrJTIwbHV4dXJ5fGVufDB8fHx8MTc3NjQ1Mzc2Nnww&ixlib=rb-4.1.0&q=85",
                type: "Pool Deck",
              },
            ].map((cat) => (
              <button
                key={cat.title}
                onClick={() => navigate("/upload", { state: { projectType: cat.type } })}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
                data-testid={`gallery-${cat.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3
                    className="text-xl font-medium text-white mb-1.5"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">{cat.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D97757]">
                    <Upload className="w-3.5 h-3.5" />
                    Try in AI Tool
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
