import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Mail, ArrowRight, Lock } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { trackEvent, identifyLead } from "../lib/tracking";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * EmailCaptureModal — fires on the Studio results page about 18 seconds after the
 * AI designs render. Goal: recover the ~70% of Studio users who admire the
 * designs but bounce without ever filling the "Build This" lead form.
 *
 * Strategy: ask for first name + email only (lowest possible friction), promise
 * to email the design + Ryan's bid range. Stored on /api/leads/quick with
 * source="studio_email_gate". Skipped if the user has already submitted a lead
 * during this session (sessionStorage flag).
 */
const STORAGE_KEY = "studio_email_gate_v1";
const SESSION_LEAD_FLAG = "lead_submitted_this_session";

export const EmailCaptureModal = ({ projectId, projectType, delayMs = 18000 }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Skip if already shown this session, or if user already gave us their info.
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (sessionStorage.getItem(SESSION_LEAD_FLAG)) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      trackEvent("studio_email_gate_shown", { project_id: projectId });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, projectId]);

  const close = () => {
    setOpen(false);
    trackEvent("studio_email_gate_dismissed", { project_id: projectId });
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      toast.error("Add your first name and a real email — that's all we need.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads/quick`, {
        name: name.trim(),
        phone: "",
        email: email.trim(),
        project_type: projectType || "",
        source: "studio_email_gate",
      });
      trackEvent("studio_email_gate_submitted", { project_id: projectId });
      identifyLead({ name: name.trim(), email: email.trim(), project_type: projectType, source: "studio_email_gate" });
      sessionStorage.setItem(SESSION_LEAD_FLAG, "1");
      setDone(true);
      toast.success("Designs sent. Check your inbox in a sec.");
      setTimeout(() => setOpen(false), 2200);
    } catch {
      toast.error("Couldn't send right now — try once more?");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6 animate-in fade-in duration-300"
      data-testid="email-capture-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-capture-title"
    >
      <div
        className="relative w-full sm:max-w-md bg-[#0E0E0E] text-white rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
          data-testid="email-capture-close"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="p-7 sm:p-9">
          <div className="w-12 h-12 rounded-2xl bg-[#D97757]/15 flex items-center justify-center mb-5">
            <Mail className="w-5 h-5 text-[#D97757]" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
            Don&apos;t lose these designs
          </p>
          <h2
            id="email-capture-title"
            className="text-2xl sm:text-3xl font-light leading-tight mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Want these designs and a real cost range emailed to you?
          </h2>
          <p className="text-sm text-white/55 leading-relaxed mb-6">
            We&apos;ll send your design picks + Ryan&apos;s honest cost range to your inbox.
            No spam, no daily emails — just this one design recap.
          </p>

          {done ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center" data-testid="email-capture-success">
              <p className="text-sm font-semibold text-white">Sent. Check your inbox in a minute.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3" data-testid="email-capture-form">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                aria-label="First name"
                className="h-12 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40"
                data-testid="email-capture-name"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Your email"
                inputMode="email"
                className="h-12 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/40"
                data-testid="email-capture-email"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#D97757] hover:bg-[#C56545] text-white font-medium text-sm"
                data-testid="email-capture-submit"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Email me my designs <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-white/35 mt-4 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Your email stays with Ryan. Never sold, never shared.
          </p>
        </div>
      </div>
    </div>
  );
};
