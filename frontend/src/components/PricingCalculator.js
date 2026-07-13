import { useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Mail, MessageSquare, Sparkles, Calculator, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { trackEvent, identifyLead } from "../lib/tracking";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SMS_LINK = "sms:5042644919?body=Hey%20Ryan%2C%20I%20just%20priced%20a%20project%20on%20your%20site%20and%20want%20to%20talk.";

/**
 * FINISHES — single source of truth for pricing.
 *
 * Numbers come straight from Ryan's published ranges (same ranges the AI chat
 * uses). DO NOT invent values outside these — the bot, calculator, and lead
 * notifications all reference these to keep quotes consistent.
 *
 * - perSqFt: [low, high] applied to slider sq ft.
 * - flat:    fixed [low, high] price range, independent of sq ft (rockscape).
 * - floor:   minimum quote (a half-day's labor essentially) — small jobs round up.
 */
const FINISHES = [
  {
    id: "microcement",
    label: "Microcement",
    sub: "Showers, floors, walls — seamless & waterproof",
    perSqFt: [18, 35],
    floor: [1200, 1800],
    sizeMin: 25,
    sizeMax: 500,
    sizeDefault: 80,
    sizeLabel: "Square feet of finished surface",
  },
  {
    id: "tadelakt",
    label: "Tadelakt",
    sub: "Hand-burnished Moroccan lime plaster — waterproof showers & feature walls",
    perSqFt: [22, 40],
    floor: [1800, 2600],
    sizeMin: 25,
    sizeMax: 350,
    sizeDefault: 60,
    sizeLabel: "Square feet of tadelakt surface",
  },
  {
    id: "venetian",
    label: "Venetian Plaster",
    sub: "Mirror-polished Italian lime — accent walls, dining, halls, powder baths",
    perSqFt: [14, 28],
    floor: [900, 1500],
    sizeMin: 30,
    sizeMax: 600,
    sizeDefault: 120,
    sizeLabel: "Square feet of wall to finish",
  },
  {
    id: "rockscape",
    label: "Rockscape Feature Wall",
    sub: "Sculpted stone-look accent wall, optional LED backlighting",
    flat: [800, 2500],
    sizeMin: 20,
    sizeMax: 120,
    sizeDefault: 40,
    sizeLabel: "Wall size (sq ft) — informational only",
  },
  {
    id: "pool_deck",
    label: "Pool Deck & Outdoor Resurfacing",
    sub: "Microterrazzo + cocciopesto — UV-stable, slip-resistant",
    perSqFt: [7, 15],
    floor: [2200, 3000],
    sizeMin: 100,
    sizeMax: 1200,
    sizeDefault: 350,
    sizeLabel: "Pool deck / patio square footage",
  },
];

function fmt(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

function calcRange(finish, sqft) {
  if (finish.flat) return finish.flat;
  let low = sqft * finish.perSqFt[0];
  let high = sqft * finish.perSqFt[1];
  if (finish.floor) {
    low = Math.max(low, finish.floor[0]);
    high = Math.max(high, finish.floor[1]);
  }
  // Round to nearest 50
  return [Math.round(low / 50) * 50, Math.round(high / 50) * 50];
}

export function PricingCalculator() {
  const [finishId, setFinishId] = useState("microcement");
  const finish = useMemo(() => FINISHES.find((f) => f.id === finishId), [finishId]);

  const [sqft, setSqft] = useState(finish.sizeDefault);
  // Reset sqft to the new finish's default whenever finish changes
  const handleFinish = (id) => {
    setFinishId(id);
    const next = FINISHES.find((f) => f.id === id);
    if (next) setSqft(next.sizeDefault);
  };

  const [low, high] = useMemo(() => calcRange(finish, sqft), [finish, sqft]);

  // Lead capture state
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim() || !contact.trim()) {
      toast.error("Just your name + phone or email — that's it.");
      return;
    }
    const looksLikeEmail = contact.includes("@");
    const cleanedContact = contact.trim();
    setSubmitting(true);
    try {
      await axios.post(`${API}/leads/quick`, {
        name: name.trim(),
        phone: looksLikeEmail ? "" : cleanedContact,
        email: looksLikeEmail ? cleanedContact : "",
        project_type: finish.label,
        source: "pricing_calculator",
        // Include the calculated quote in the description so Ryan sees the
        // estimate that the lead is responding to.
        project_description: `Pricing Calculator: ${finish.label} · ${sqft} sq ft · estimate ${fmt(low)}–${fmt(high)}`,
      });
      trackEvent("pricing_calculator_lead", { finish: finish.id, sqft, low, high });
      identifyLead({
        name: name.trim(),
        phone: looksLikeEmail ? "" : cleanedContact,
        email: looksLikeEmail ? cleanedContact : "",
        project_type: finish.label,
        source: "pricing_calculator",
      });
      try { sessionStorage.setItem("lead_submitted_this_session", "1"); } catch (e) { /* ignore */ }
      setDone(true);
      toast.success("Quote on its way. I'll follow up shortly.");
    } catch (err) {
      toast.error("Something went sideways — text me at 504-264-4919.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="py-20 md:py-28 px-6 md:px-12 bg-[#0E0E0E] text-white relative overflow-hidden"
      data-testid="pricing-calculator-section"
      id="quote"
    >
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D97757]/15 border border-[#D97757]/30 px-3 py-1 mb-5">
            <Calculator className="w-3.5 h-3.5 text-[#D97757]" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#D97757]">
              Instant Estimate
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.05] mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            What does this <span className="italic text-[#D97757]">actually</span> cost?
          </h2>
          <p className="text-sm md:text-base text-white/55 leading-relaxed">
            Drag the slider, pick a finish, see a real number — drawn from the same ranges Ryan uses on real jobs.
            No &ldquo;call for pricing&rdquo; runaround.
          </p>
        </div>

        <div className="bg-[#141414] rounded-3xl border border-white/10 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Inputs */}
          <div className="lg:col-span-3 space-y-7">
            {/* Finish picker */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
                1. Pick a finish
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFinish(f.id)}
                    data-testid={`calc-finish-${f.id}`}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      f.id === finishId
                        ? "bg-[#D97757]/15 border-[#D97757]/60"
                        : "bg-white/[0.02] border-white/10 hover:border-white/25"
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{f.label}</p>
                    <p className="text-[11px] text-white/50 mt-0.5 leading-snug">{f.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Size slider */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
                2. How big is the project?
              </p>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-light text-white tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                  {sqft}
                </span>
                <span className="text-sm text-white/40">sq ft</span>
                <span className="text-xs text-white/40 ml-auto">{finish.sizeLabel}</span>
              </div>
              <input
                type="range"
                min={finish.sizeMin}
                max={finish.sizeMax}
                step={finish.sizeMax > 300 ? 10 : 5}
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full accent-[#D97757] h-2"
                aria-label="Square footage"
                data-testid="calc-sqft-slider"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1.5">
                <span>{finish.sizeMin} sq ft</span>
                <span>{finish.sizeMax} sq ft</span>
              </div>
            </div>
          </div>

          {/* Live price + lead capture */}
          <div className="lg:col-span-2 lg:border-l lg:border-white/10 lg:pl-10">
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
              Your estimate
            </p>

            <motion.div
              key={`${finishId}-${sqft}`}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-6"
              data-testid="calc-price-range"
            >
              <p
                className="text-4xl md:text-5xl font-light leading-tight tracking-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {fmt(low)}
                <span className="text-white/40 mx-1.5">–</span>
                {fmt(high)}
              </p>
              <p className="text-xs text-white/45 mt-2 leading-relaxed">
                Honest range. Includes prep, materials, labor, and topcoat sealing.
                Final quote after Ryan walks the space.
              </p>
            </motion.div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 mb-5">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/60 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D97757]" />
                What&apos;s included
              </p>
              <ul className="text-[12px] text-white/65 space-y-1 leading-relaxed">
                <li>· Substrate prep + bonding primer</li>
                <li>· Material + premium pigment</li>
                <li>· 5–7 hand-applied layers</li>
                <li>· Topcoat sealing for a 10-year finish</li>
              </ul>
            </div>

            {done ? (
              <div className="rounded-2xl bg-[#D97757]/15 border border-[#D97757]/30 p-5" data-testid="calc-lead-success">
                <p className="text-sm font-semibold text-white mb-1">Quote sent.</p>
                <p className="text-xs text-white/65 leading-relaxed">
                  {contact.includes("@")
                    ? "Check your inbox in a minute — your estimate is on its way. "
                    : "Ryan got your quote and will text you within the hour. "}
                  Want him sooner? Text{" "}
                  <a href={SMS_LINK} className="text-[#D97757] underline">504-264-4919</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-2.5" data-testid="calc-lead-form">
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757] mb-1">
                  3. Save this quote
                </p>
                <p className="text-[11px] text-white/55 leading-relaxed -mt-0.5 mb-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  Ryan typically replies within an hour · 7 days a week
                </p>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  aria-label="First name"
                  className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40"
                  data-testid="calc-name-input"
                />
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone or email"
                  aria-label="Phone or email"
                  className="h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40"
                  data-testid="calc-contact-input"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-[#D97757] hover:bg-[#C56545] text-white font-medium text-sm"
                  data-testid="calc-submit-btn"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 mr-1.5" /> Email me my quote <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </Button>
                <a
                  href={SMS_LINK}
                  className="block w-full text-center h-11 leading-[2.75rem] rounded-xl border border-white/15 text-white/85 hover:bg-white/5 text-sm font-medium"
                  data-testid="calc-text-ryan-btn"
                >
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Or text me now
                </a>
                <p className="text-[10px] text-white/35 mt-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-2.5 h-2.5" /> Goes to Ryan only. No spam, no sharing.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
