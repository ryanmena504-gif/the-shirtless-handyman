import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const SAMPLES = [
  { name: "Jason", area: "Gretna", action: "requested a feature-wall quote" },
  { name: "Sarah", area: "Metairie", action: "previewed a microcement bathroom" },
  { name: "Marcus", area: "Lakeview", action: "booked a free consult" },
  { name: "Tina", area: "Uptown", action: "saved a tadelakt shower design" },
  { name: "Will", area: "Mid-City", action: "requested a kitchen counter quote" },
  { name: "Alicia", area: "Algiers", action: "previewed a rockscape accent wall" },
  { name: "Brett", area: "Westwego", action: "requested a pool deck refinish" },
  { name: "Janelle", area: "Carrollton", action: "saved a venetian plaster design" },
  { name: "Devin", area: "Marigny", action: "booked a Seamless Studio demo" },
];

function pickSample() {
  const idx = Math.floor(Math.random() * SAMPLES.length);
  const mins = Math.floor(Math.random() * 18) + 1;
  return { ...SAMPLES[idx], mins };
}

/**
 * SocialProofToast — bottom-left rotating toast simulating real recent activity.
 * Appears 6s after page load, rotates every ~14s, can be dismissed.
 * Pure UX/social-proof — does not claim real-time accuracy.
 */
export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sample, setSample] = useState(pickSample());

  useEffect(() => {
    if (dismissed) return;
    const showTimer = setTimeout(() => setVisible(true), 6000);
    const rotateTimer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSample(pickSample());
        setVisible(true);
      }, 600);
    }, 14000);
    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`hidden md:block fixed bottom-6 left-6 z-30 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      data-testid="social-proof-toast"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-border/60 shadow-xl max-w-[320px]">
        <div className="w-9 h-9 rounded-full bg-[#D97757]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#D97757]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs leading-snug text-foreground">
            <span className="font-semibold">{sample.name} in {sample.area}</span>{" "}
            <span className="text-muted-foreground">{sample.action}</span>
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sample.mins} min ago</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground/50 hover:text-foreground text-xs px-1"
          aria-label="Dismiss"
          data-testid="social-proof-dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
