import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Flame, X } from "lucide-react";

const STORAGE_KEY = "shh_promo_radiant_heat_dismissed_v1";
const OPERATOR_PREFIXES = ["/admin", "/contractor"];

/**
 * PromoBanner — thin, dismissible top-of-page banner announcing the current
 * headline promotion. Sits above the Navbar so nothing else has to move.
 * Persists a "dismissed" flag in localStorage so it stays hidden after tap-X.
 * Hidden on operator routes (admin / contractor dashboards) so we don't push
 * a homeowner promo at professional users.
 */
export const PromoBanner = () => {
  const { pathname } = useLocation();
  const isOperatorRoute = OPERATOR_PREFIXES.some((p) => pathname.startsWith(p));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode — ignore */
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.promoBanner = visible ? "on" : "off";
  }, [visible]);

  if (!visible) return null;
  if (isOperatorRoute) return null;

  return (
    <div
      className="relative z-[60] bg-gradient-to-r from-[#D97757] via-[#C25A3E] to-[#D97757] text-white overflow-hidden"
      data-testid="promo-banner"
      role="region"
      aria-label="Current promotion"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-2.5 flex items-center gap-3">
        <Flame className="w-4 h-4 flex-shrink-0 hidden sm:block" aria-hidden="true" />
        <p className="flex-1 text-[12px] sm:text-sm font-medium leading-snug text-center sm:text-left">
          <span className="font-bold uppercase tracking-wider mr-2 hidden sm:inline">
            Limited-time:
          </span>
          <span>
            Book <strong>any flooring or seamless-surface package with flooring</strong> and I&rsquo;ll <strong>install radiant heat under it for FREE</strong>.
          </span>{" "}
          <a
            href="sms:5042644919?body=Hey%20Ryan%2C%20I%27d%20like%20to%20claim%20the%20free%20radiant%20heat%20install%20offer."
            className="underline underline-offset-2 font-semibold whitespace-nowrap hover:text-white/90"
            data-testid="promo-banner-cta"
          >
            Text Ryan to lock it in →
          </a>
        </p>
        <button
          onClick={dismiss}
          className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Dismiss promotion"
          data-testid="promo-banner-close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
