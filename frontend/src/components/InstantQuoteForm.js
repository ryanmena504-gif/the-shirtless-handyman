import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Phone, MessageCircle, Mail } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { trackEvent, identifyLead } from "../lib/tracking";
import { tagLeadSource } from "../utils/leadSource";
import {
  PHONE_DISPLAY, TEL_LINK, HOURS_LABEL, PROJECT_TYPES, smsLink, mailtoLink,
} from "../lib/contact";

const API = `${process.env.REACT_APP_BACKEND_URL || "https://design-reveal.preview.emergentagent.com"}/api`;

/**
 * InstantQuoteForm — name + phone (+ optional project type), single step.
 * Posts to the SAME endpoint as before (POST /api/leads/quick → Mongo + email
 * notification + Make/Airtable webhook). Nothing about delivery changed.
 *
 * Reliability: if the backend is unreachable or errors, the visitor is NOT left
 * with a dead "something glitched" toast. They get a one-tap fallback that
 * opens a pre-written text (or email) to Ryan with their name, phone, and
 * project already filled in, so the lead is never lost.
 *
 * Variants: `dark` (on dark hero), `light` (on white sections).
 */
export const InstantQuoteForm = ({
  variant = "dark",
  source = "hero_form",
  defaultProjectType = "",
  className = "",
  heading = "Free quote — just your name & number",
  showProjectType = true,
  id,
  onSubmitted,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState(defaultProjectType);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  const isDark = variant === "dark";

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim() || !phone.trim()) {
      toast.error("Add your name and phone — that's all I need.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Double-check that phone number — I need all 10 digits to text you back.");
      return;
    }
    setLoading(true);
    const taggedSource = tagLeadSource(source);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      project_type: projectType || defaultProjectType,
      source: taggedSource,
    };
    try {
      await axios.post(`${API}/leads/quick`, payload, { timeout: 15000 });
      trackEvent("quick_lead_submitted", { source: taggedSource });
      identifyLead(payload);
      try { sessionStorage.setItem("lead_submitted_this_session", "1"); } catch (err) { /* ignore */ }
      setDone(true);
      toast.success("Got it! I'll text you back personally.");
      onSubmitted?.();
    } catch {
      trackEvent("quick_lead_failed", { source: taggedSource });
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const fallbackBody =
    `Hi Ryan, I'd like a free quote.\nName: ${name.trim()}\nPhone: ${phone.trim()}` +
    (projectType ? `\nProject: ${projectType}` : "") +
    `\n(sent from your website)`;

  if (done) {
    return (
      <div
        id={id}
        data-quote-form
        className={`rounded-2xl p-5 text-center ${
          isDark ? "bg-white/10 border border-white/20" : "bg-[#1A3C34]/5 border border-[#1A3C34]/20"
        } ${className}`}
        data-testid="instant-quote-success"
      >
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
          ✓ Got it, {name.trim().split(" ")[0]}. You're on my list.
        </p>
        <p className={`text-xs mt-1 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
          Expect a text from Ryan at {phone.trim()}. In a hurry? Call{" "}
          <a href={TEL_LINK} className="underline underline-offset-2 font-semibold">{PHONE_DISPLAY}</a>.
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <div
        id={id}
        data-quote-form
        className={`rounded-2xl p-5 ${
          isDark ? "bg-white/10 border border-white/20" : "bg-white border border-border/60 shadow-lg"
        } ${className}`}
        data-testid="instant-quote-fallback"
        role="alert"
      >
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
          My form hiccuped — don't worry, one tap still gets you to me.
        </p>
        <p className={`text-xs mt-1 mb-3 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
          Your details are already written into the message. Just hit send.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={smsLink(fallbackBody)}
            onClick={() => trackEvent("quick_lead_fallback_sms", { source })}
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-[#D97757] text-white font-semibold hover:bg-[#C56545]"
            data-testid="instant-quote-fallback-sms"
          >
            <MessageCircle className="w-4 h-4" /> Text it to Ryan
          </a>
          <a
            href={TEL_LINK}
            onClick={() => trackEvent("quick_lead_fallback_call", { source })}
            className={`flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-lg font-semibold ${
              isDark ? "bg-white/10 text-white border border-white/20" : "bg-[#1A3C34] text-white"
            }`}
            data-testid="instant-quote-fallback-call"
          >
            <Phone className="w-4 h-4" /> Call {PHONE_DISPLAY}
          </a>
        </div>
        <a
          href={mailtoLink("Free quote request", fallbackBody)}
          className={`mt-3 inline-flex items-center gap-1.5 text-xs underline underline-offset-2 ${isDark ? "text-white/60" : "text-muted-foreground"}`}
          data-testid="instant-quote-fallback-email"
        >
          <Mail className="w-3.5 h-3.5" /> Or email it instead
        </a>
      </div>
    );
  }

  const fieldClass = `h-12 rounded-lg ${
    isDark
      ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
      : "bg-white border-border/60"
  }`;

  return (
    <form
      id={id}
      data-quote-form
      onSubmit={handleSubmit}
      className={`rounded-2xl p-4 sm:p-5 backdrop-blur-md ${
        isDark
          ? "bg-white/10 border border-white/20"
          : "bg-white border border-border/60 shadow-lg"
      } ${className}`}
      data-testid={`instant-quote-form-${source}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-[#D97757]">
        {heading}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          name="name"
          className={`${fieldClass} flex-1`}
          data-testid="instant-quote-name"
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          name="phone"
          aria-label="Phone number"
          className={`${fieldClass} flex-1`}
          data-testid="instant-quote-phone"
        />
      </div>
      {showProjectType && (
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          aria-label="What's the project? (optional)"
          className={`mt-2 w-full h-12 rounded-lg px-3 text-sm border ${
            isDark
              ? "bg-[#1b1b1b] border-white/20 text-white"
              : "bg-white border-border/60 text-foreground"
          }`}
          data-testid="instant-quote-project-type"
        >
          <option value="">What's the project? (optional)</option>
          {defaultProjectType && !PROJECT_TYPES.includes(defaultProjectType) && (
            <option value={defaultProjectType}>{defaultProjectType}</option>
          )}
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="mt-2 w-full h-12 px-6 rounded-lg bg-[#D97757] text-white hover:bg-[#C56545] font-semibold whitespace-nowrap"
        data-testid="instant-quote-submit"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Get my free quote
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </>
        )}
      </Button>
      <p className={`text-[11px] mt-2.5 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
        Goes straight to me — no call center, no spam. {HOURS_LABEL}. Rather talk?{" "}
        <a href={TEL_LINK} className="underline underline-offset-2">Call {PHONE_DISPLAY}</a>
      </p>
    </form>
  );
};
