import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { ViewTubeWordmark } from "../components/viewtube/ViewTubeWordmark";
import { VIEWTUBE } from "../lib/viewtube";
import { ViewTubeCoachPortrait } from "../components/viewtube/ViewTubeCoachPortrait";
import { Eye, OctagonX, Smartphone, Volume2 } from "lucide-react";

const COACH_STILLS = [
  {
    id: "cole",
    name: "Cole",
    line: "Calm. A little cocky. Stops you when the part is backwards.",
  },
  {
    id: "avery",
    name: "Avery",
    line: "Sharp. Encouraging. Catches the board before it goes on backwards.",
  },
];

const BEATS = [
  {
    icon: Smartphone,
    title: "Phone on a stand",
    copy: "Clamp it so the bench is in frame. Hands stay free.",
  },
  {
    icon: Eye,
    title: "A coach who can see",
    copy: "The camera stays on. Cole or Avery glances while you work. Check me is a real look. They only freeze you when they are sure.",
  },
  {
    icon: OctagonX,
    title: "A real stop",
    copy: "Wrong orientation, stuck blade guard — the session freezes. Missing glasses will not.",
  },
  {
    icon: Volume2,
    title: "You pick the AI voice",
    copy: "Cole or Avery. Generated speech. Nothing recorded by a person — including you.",
  },
];

export default function ViewTubeLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white" data-testid="viewtube-landing">
      <SeoHead
        title="viewTube | The DIY coach that watches you — and stops you"
        description="YouTube shows you how. viewTube watches you do it. Pick Cole or Avery, point the phone at the bench, and get a live stop if the part is backwards."
        canonical="https://theshirtlesshandyman.com/viewtube"
      />
      <Navbar />

      <section className="relative pt-28 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 viewtube-scanlines pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.p
            className="text-[11px] uppercase tracking-[0.38em] text-[#D97757] font-bold mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Live · On the bench · Not a video
          </motion.p>
          <ViewTubeWordmark size="xl" invert testId="viewtube-hero-wordmark" />
          <h1
            className="mt-8 max-w-3xl text-3xl md:text-5xl font-light leading-[1.1]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {VIEWTUBE.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-white/65 text-lg leading-relaxed">
            {VIEWTUBE.promise} Six structured projects. AI voices. They only stop you when they are sure.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              data-testid="viewtube-start-btn"
              onClick={() => navigate("/viewtube/setup")}
              className="h-14 px-10 rounded-full bg-[#D97757] text-white text-base font-semibold"
            >
              Pick a coach
            </button>
            <button
              type="button"
              data-testid="viewtube-how-btn"
              onClick={() => document.getElementById("viewtube-how")?.scrollIntoView({ behavior: "smooth" })}
              className="h-14 px-10 rounded-full border border-white/20 text-white text-base font-medium"
            >
              How the stop works
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
          {COACH_STILLS.map((coach, i) => (
            <motion.figure
              key={coach.name}
              className="relative overflow-hidden rounded-3xl min-h-[420px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
            >
              <ViewTubeCoachPortrait coachId={coach.id} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <figcaption className="absolute bottom-0 p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-[#D97757] font-bold mb-2">Coach</p>
                <p className="text-4xl font-light" style={{ fontFamily: "'Fraunces', serif" }}>{coach.name}</p>
                <p className="mt-3 text-white/75 max-w-sm">{coach.line}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section id="viewtube-how" className="px-6 md:px-12 pb-28">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D97757] font-bold mb-4">The loop</p>
          <h2
            className="text-3xl md:text-5xl font-light max-w-2xl mb-14"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Gemini can chat about a leaky faucet. viewTube can freeze the session — without making you wait on a spinner.
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {BEATS.map((beat) => (
              <div key={beat.title} className="border border-white/10 rounded-2xl p-6 bg-white/[0.03]">
                <beat.icon className="w-5 h-5 text-[#D97757] mb-5" />
                <h3 className="text-lg font-medium mb-2">{beat.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{beat.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
