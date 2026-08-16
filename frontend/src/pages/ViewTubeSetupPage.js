import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";
import { ViewTubeWordmark } from "../components/viewtube/ViewTubeWordmark";
import { createViewTubeSession, fetchViewTubeCatalog, prefetchViewTubeLines, speakViewTubeLine } from "../lib/viewtube";
import { ViewTubeCoachPortrait } from "../components/viewtube/ViewTubeCoachPortrait";
import { toast } from "sonner";

export default function ViewTubeSetupPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [coachId, setCoachId] = useState("avery");
  const [projectId, setProjectId] = useState("flatpack-shelf");
  const [starting, setStarting] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    fetchViewTubeCatalog()
      .then(setCatalog)
      .catch(() => toast.error("Could not load viewTube catalog"));
  }, []);

  const previewVoice = async () => {
    const coach = catalog?.coaches?.find((c) => c.id === coachId);
    if (!coach) return;
    setPreviewing(true);
    try {
      const url = await speakViewTubeLine(coachId, `I'm ${coach.name}. This is an AI voice. Prop the phone so I can see the bench.`);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "AI voice preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const start = async () => {
    setStarting(true);
    try {
      const session = await createViewTubeSession(coachId, projectId);
      prefetchViewTubeLines(session.coach_id, session.prefetch_lines || []);
      navigate(`/viewtube/watch/${session.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not start the session");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white" data-testid="viewtube-setup">
      <SeoHead
        title="Pick a coach | viewTube"
        description="Choose Cole or Avery and a structured DIY project. viewTube watches the bench and stops you if the part is backwards."
        canonical="https://theshirtlesshandyman.com/viewtube/setup"
      />
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-20">
        <ViewTubeWordmark size="md" invert />
        <h1
          className="mt-6 text-4xl md:text-5xl font-light"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Who is in your ear?
        </h1>
        <p className="mt-3 text-white/60 max-w-xl">
          AI voices. Nothing recorded — not by a voice actor, not by you. The stop button does not care who you picked.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-4" data-testid="viewtube-coach-grid">
          {(catalog?.coaches || []).map((coach) => {
            const selected = coachId === coach.id;
            return (
              <button
                type="button"
                key={coach.id}
                data-testid={`viewtube-coach-${coach.id}`}
                onClick={() => setCoachId(coach.id)}
                className={`text-left rounded-3xl overflow-hidden border ${
                  selected ? "border-[#D97757]" : "border-white/10"
                }`}
              >
                <div className="relative h-64 bg-[#141414]">
                  <ViewTubeCoachPortrait coachId={coach.id} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-3xl font-light" style={{ fontFamily: "'Fraunces', serif" }}>{coach.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">{coach.pronouns} · AI voice</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-white/75">{coach.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        <h2
          className="mt-16 text-3xl font-light"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          What are we building?
        </h2>
        <p className="mt-2 text-white/55 text-sm mb-6">
          Structured projects only. Open-world DIY is how you get a false green light on a live circuit.
        </p>
        <div className="grid md:grid-cols-2 gap-4" data-testid="viewtube-project-grid">
          {(catalog?.projects || []).map((project) => {
            const selected = projectId === project.id;
            return (
              <button
                type="button"
                key={project.id}
                data-testid={`viewtube-project-${project.id}`}
                onClick={() => setProjectId(project.id)}
                className={`text-left rounded-2xl overflow-hidden border ${
                  selected ? "border-[#D97757]" : "border-white/10"
                }`}
              >
                <div className="h-40 overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-lg font-medium">{project.title}</p>
                    <span className="text-[10px] uppercase tracking-widest text-white/45">{project.difficulty}</span>
                  </div>
                  <p className="text-sm text-white/60">{project.blurb}</p>
                  <p className="mt-3 text-xs text-white/40">{project.duration} · {project.steps.length} watched steps</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            data-testid="viewtube-preview-voice-btn"
            onClick={previewVoice}
            disabled={previewing || !catalog}
            className="h-14 px-10 rounded-full border border-white/20 text-white font-semibold disabled:opacity-50"
          >
            {previewing ? "Speaking…" : "Hear this AI voice"}
          </button>
          <button
            type="button"
            data-testid="viewtube-go-live-btn"
            onClick={start}
            disabled={starting || !catalog}
            className="h-14 px-10 rounded-full bg-[#D97757] text-white font-semibold disabled:opacity-50"
          >
            {starting ? "Going live…" : "Go live"}
          </button>
        </div>
      </div>
    </div>
  );
}
