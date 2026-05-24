import { useLocation } from "react-router-dom";
import { ExitIntentModal } from "./ExitIntentModal";
import { StickyMobileCTA } from "./StickyMobileCTA";
import { SocialProofToast } from "./SocialProofToast";

// Routes where lead-gen widgets should appear (homeowner-facing pages).
const LEADGEN_ROUTES = ["/", "/upload", "/portfolio"];
const LEADGEN_PREFIXES = ["/results", "/analysis", "/share"];

/**
 * LeadGenWidgets — global overlay that mounts the sticky CTA, exit-intent modal,
 * and social-proof toast on homeowner-facing pages only. Admin/contractor routes
 * are intentionally excluded so we don't bug logged-in operators.
 */
export const LeadGenWidgets = () => {
  const { pathname } = useLocation();
  const onLeadGenRoute =
    LEADGEN_ROUTES.includes(pathname) ||
    LEADGEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (!onLeadGenRoute) return null;

  return (
    <>
      <StickyMobileCTA />
      <SocialProofToast />
      <ExitIntentModal />
    </>
  );
};
