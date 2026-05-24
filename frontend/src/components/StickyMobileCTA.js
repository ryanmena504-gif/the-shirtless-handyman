import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Sparkles } from "lucide-react";

const SMS_LINK = "sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.";
const TEL_LINK = "tel:5042644919";

/**
 * Sticky bottom CTA bar — visible on mobile only.
 * Phone | Text | AI Studio — always one thumb away.
 */
export const StickyMobileCTA = () => {
  const navigate = useNavigate();
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex items-stretch gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      data-testid="sticky-mobile-cta"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={TEL_LINK}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-white/5 text-white active:bg-white/10"
        data-testid="sticky-cta-call"
      >
        <Phone className="w-4 h-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Call</span>
      </a>
      <a
        href={SMS_LINK}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-white/5 text-white active:bg-white/10"
        data-testid="sticky-cta-text"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Text</span>
      </a>
      <button
        onClick={() => navigate("/upload")}
        className="flex-[1.4] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#D97757] text-white font-semibold active:bg-[#C56545]"
        data-testid="sticky-cta-studio"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-xs">See My Room</span>
      </button>
    </div>
  );
};
