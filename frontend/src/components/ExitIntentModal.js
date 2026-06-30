import { useEffect, useState, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InstantQuoteForm } from "./InstantQuoteForm";

const STORAGE_KEY = "sh_exit_intent_seen";
const DELAY_MS = 12000; // also fire on long-scroll/idle, never more than once per session

/**
 * ExitIntentModal — single-field name+phone catcher.
 * Triggers on:
 *   - mouse leaving the top of the viewport (desktop)
 *   - 12s scroll-idle without a CTA click (mobile fallback)
 * Stores a sessionStorage flag so the user only ever sees it once per visit.
 *
 * Implemented as a plain fixed overlay (NOT Radix Dialog) so its backdrop
 * doesn't intercept pointer events on the ChatWidget launcher (z-9990) or any
 * other above-the-fold UI. Click on the dim backdrop dismisses the modal.
 */
export const ExitIntentModal = () => {
  const [open, setOpen] = useState(false);

  const trigger = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    // Don't show while the AI chat widget is open — chat has its own lead+booking flow.
    if (window.__SHH_CHAT_OPEN__) return;
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
      if (e.clientY <= 0) trigger();
    };
    const idleTimer = setTimeout(trigger, DELAY_MS);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [trigger]);

  // If the chat opens while this modal is showing, step out of the way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = setInterval(() => {
      if (open && window.__SHH_CHAT_OPEN__) setOpen(false);
    }, 250);
    return () => clearInterval(id);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — click to dismiss. z-[80] keeps it under the ChatWidget (z-9990). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            data-testid="exit-intent-backdrop"
          />
          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Free quote in under an hour"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-full max-w-md p-0 mx-4 rounded-2xl overflow-hidden shadow-2xl"
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
              <h2
                className="text-2xl font-light tracking-tight text-white mb-2 leading-snug"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Want a free quote, texted in under an hour?
              </h2>
              <p className="text-sm text-white/55 mb-5">
                No call center. No emails. Ryan texts you back personally with a ballpark for your space.
              </p>
              <InstantQuoteForm
                variant="dark"
                source="exit_intent_modal"
                onSubmitted={() => setTimeout(() => setOpen(false), 2400)}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
