import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

/**
 * TrustToast — a truthful, static trust badge.
 *
 * Replaces the previous fabricated "social proof" rotator, which invented
 * customer names, neighborhoods, and booking activity. That pattern created
 * privacy, consent, and honesty risks. This component ONLY renders a static,
 * verifiable service statement — no invented events, no simulated names, no
 * fake timestamps, and no auto-wired lead data.
 *
 * Export name kept as `SocialProofToast` for compatibility with LeadGenWidgets.
 */
export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 4500);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`hidden md:block fixed bottom-6 left-6 z-30 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      data-testid="trust-toast"
    >
      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white border border-border/60 shadow-xl max-w-[320px]">
        <div className="w-9 h-9 rounded-full bg-[#D97757]/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-[#D97757]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs leading-snug text-foreground">
            Serving homeowners across the New Orleans area with grout-free
            bathrooms, microcement, and specialty finishes.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground/50 hover:text-foreground text-xs px-1"
          aria-label="Dismiss"
          data-testid="trust-toast-dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
