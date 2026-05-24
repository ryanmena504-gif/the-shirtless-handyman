import { useEffect, useState, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { InstantQuoteForm } from "./InstantQuoteForm";

const STORAGE_KEY = "sh_exit_intent_seen";
const DELAY_MS = 12000; // also fire on long-scroll/idle, never more than once per session

/**
 * ExitIntentModal — single-field name+phone catcher.
 * Triggers on:
 *   - mouse leaving the top of the viewport (desktop)
 *   - 12s scroll-idle without a CTA click (mobile fallback)
 * Stores a sessionStorage flag so the user only ever sees it once per visit.
 */
export const ExitIntentModal = () => {
  const [open, setOpen] = useState(false);

  const trigger = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    // Don't stack on top of an already-visible Klaviyo signup form.
    const klaviyoOpen = document.querySelector(
      ".klaviyo-form-version-cid_1 [role='dialog'], .klaviyo-form [aria-modal='true']"
    );
    if (klaviyoOpen) {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e) => {
      // Detect intent to leave: mouse exits through top edge
      if (e.clientY <= 0) trigger();
    };

    const idleTimer = setTimeout(trigger, DELAY_MS);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [trigger]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0"
        data-testid="exit-intent-modal"
      >
        <div className="relative bg-[#0E0E0E] p-7">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white"
            aria-label="Close"
            data-testid="exit-intent-close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97757] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757]">
              Before you go
            </p>
          </div>
          <DialogTitle
            className="text-2xl font-light tracking-tight text-white mb-2 leading-snug"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Want a free quote, texted in under an hour?
          </DialogTitle>
          <DialogDescription className="text-sm text-white/55 mb-5">
            No call center. No emails. Ryan texts you back personally with a ballpark for your space.
          </DialogDescription>
          <InstantQuoteForm
            variant="dark"
            source="exit_intent_modal"
            onSubmitted={() => setTimeout(() => setOpen(false), 2400)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
