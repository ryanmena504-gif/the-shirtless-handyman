import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Phone } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { trackEvent, identifyLead } from "../lib/tracking";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * InstantQuoteForm — name + phone, single-step, goes straight to Ryan's inbox.
 * Designed to sit next to "Show Us Your Room" in the hero or inside modals.
 * Variants: `dark` (on dark hero), `light` (on white sections).
 */
export const InstantQuoteForm = ({
  variant = "dark",
  source = "hero_form",
  defaultProjectType = "",
  className = "",
  onSubmitted,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim() || !phone.trim()) {
      toast.error("Add your name and phone — that's all I need.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads/quick`, {
        name: name.trim(),
        phone: phone.trim(),
        project_type: defaultProjectType,
        source,
      });
      trackEvent("quick_lead_submitted", { source });
      identifyLead({ name: name.trim(), phone: phone.trim(), project_type: defaultProjectType, source });
      setDone(true);
      toast.success("Got it! Ryan will text you within an hour.");
      onSubmitted?.();
    } catch {
      toast.error("Something glitched — try again or text 504-264-4919.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";

  if (done) {
    return (
      <div
        className={`rounded-2xl p-5 text-center ${
          isDark ? "bg-white/10 border border-white/20" : "bg-[#1A3C34]/5 border border-[#1A3C34]/20"
        } ${className}`}
        data-testid="instant-quote-success"
      >
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
          ✓ You're on Ryan's list.
        </p>
        <p className={`text-xs mt-1 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
          Expect a text from <span className="font-semibold">{name.split(" ")[0]}</span> in under an hour.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl p-4 sm:p-5 backdrop-blur-md ${
        isDark
          ? "bg-white/10 border border-white/20"
          : "bg-white border border-border/60 shadow-lg"
      } ${className}`}
      data-testid={`instant-quote-form-${source}`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-[0.18em] mb-3 ${
          isDark ? "text-[#D97757]" : "text-[#D97757]"
        }`}
      >
        Not ready to upload? Skip to a quote.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className={`h-12 rounded-lg flex-1 ${
            isDark
              ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
              : "bg-white border-border/60"
          }`}
          data-testid="instant-quote-name"
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          inputMode="tel"
          aria-label="Phone number"
          className={`h-12 rounded-lg flex-1 ${
            isDark
              ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
              : "bg-white border-border/60"
          }`}
          data-testid="instant-quote-phone"
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-lg bg-[#D97757] text-white hover:bg-[#C56545] font-medium whitespace-nowrap"
          data-testid="instant-quote-submit"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Phone className="w-4 h-4 mr-1.5" />
              Get a Quote
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
      <p className={`text-[11px] mt-2.5 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
        Direct to Ryan's phone. No spam, no call center. Avg response under 1 hr.
      </p>
    </form>
  );
};
