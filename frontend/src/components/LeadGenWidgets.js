import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ExitIntentModal } from "./ExitIntentModal";
import { StickyMobileCTA } from "./StickyMobileCTA";
import { SocialProofToast } from "./SocialProofToast";

// Routes where lead-gen widgets should appear (homeowner-facing pages).
const LEADGEN_ROUTES = [
  "/", "/upload", "/portfolio", "/blog", "/about",
  "/microcement-new-orleans",
  "/microcement-metairie",
  "/tadelakt-new-orleans",
  "/rockscape-walls-new-orleans",
  "/pool-deck-resurfacing-new-orleans",
  // Neighborhood micro-pages
  "/lakeview-handyman",
  "/uptown-handyman",
  "/mid-city-handyman",
  "/bywater-handyman",
  "/french-quarter-handyman",
  "/garden-district-handyman",
];
const LEADGEN_PREFIXES = ["/results", "/analysis", "/share", "/blog/"];

// Routes where ANY 3rd-party homeowner-targeted overlay (Klaviyo signup, etc.) must be hidden.
const OPERATOR_PREFIXES = ["/admin", "/contractor"];

/**
 * LeadGenWidgets — global overlay that mounts the sticky CTA, exit-intent modal,
 * and social-proof toast on homeowner-facing pages only.
 *
 * Also gates the Klaviyo signup form by toggling a body data-attribute so CSS
 * can hide Klaviyo's auto-injected overlays on operator (admin/contractor) routes
 * and while our own ExitIntentModal is open.
 */
export const LeadGenWidgets = () => {
  const { pathname } = useLocation();
  const onLeadGenRoute =
    LEADGEN_ROUTES.includes(pathname) ||
    LEADGEN_PREFIXES.some((p) => pathname.startsWith(p));
  const onOperatorRoute = OPERATOR_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // Tag the body with the current scope so CSS in App.css can suppress Klaviyo
    // signup forms on operator routes without removing the analytics tracking.
    if (typeof document === "undefined") return;
    document.body.dataset.scope = onOperatorRoute ? "operator" : "homeowner";
    return () => {
      // No teardown needed — next route will overwrite it.
    };
  }, [onOperatorRoute]);

  if (!onLeadGenRoute) return null;

  return (
    <>
      <StickyMobileCTA />
      <SocialProofToast />
      <ExitIntentModal />
    </>
  );
};
