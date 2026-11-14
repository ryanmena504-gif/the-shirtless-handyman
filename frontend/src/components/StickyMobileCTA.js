import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { TEL_LINK, smsLink, scrollToQuoteForm } from "../lib/contact";
import { trackEvent } from "../lib/tracking";

const SMS_HREF = smsLink("Hey Ryan, I'm interested in a seamless surface project.");

/**
 * Sticky bottom CTA bar — mobile only. Call | Text | Free Quote, always one
 * thumb away. "Free Quote" scrolls to the quote form on the current page, or
 * opens the homepage form if this page doesn't have one.
 * A spacer is rendered so the bar never covers the footer.
 */
export const StickyMobileCTA = () => {
  const navigate = useNavigate();
  const goQuote = () => {
    trackEvent("sticky_cta_quote", {});
    if (!scrollToQuoteForm()) navigate("/#quote");
  };
  return (
    <>
      <div className="md:hidden h-20" aria-hidden="true" />
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex items-stretch gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        data-testid="sticky-mobile-cta"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <a
          href={TEL_LINK}
          onClick={() => trackEvent("sticky_cta_call", {})}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-white/10 text-white active:bg-white/20"
          data-testid="sticky-cta-call"
        >
          <Phone className="w-4 h-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Call</span>
        </a>
        <a
          href={SMS_HREF}
          onClick={() => trackEvent("sticky_cta_text", {})}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-white/10 text-white active:bg-white/20"
          data-testid="sticky-cta-text"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Text</span>
        </a>
        <button
          type="button"
          onClick={goQuote}
          className="flex-[1.4] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#D97757] text-white font-semibold active:bg-[#C56545]"
          data-testid="sticky-cta-quote"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Free Quote</span>
        </button>
      </div>
    </>
  );
};
