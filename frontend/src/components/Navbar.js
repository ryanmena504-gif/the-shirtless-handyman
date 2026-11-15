import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Menu, X, Hammer, Phone } from "lucide-react";
import { PHONE_DISPLAY, TEL_LINK, scrollToQuoteForm } from "../lib/contact";

// Header nav: Logo / Work / Finishes / Process / Pricing / About + "Start a Project" CTA.
const NAV_ITEMS = [
  { label: "Work", to: "/portfolio", testid: "nav-work" },
  { label: "Finishes", to: "/finishes", testid: "nav-finishes" },
  { label: "Process", to: "/#how-it-works", testid: "nav-process" },
  { label: "Pricing", to: "/#pricing", testid: "nav-pricing" },
  { label: "About", to: "/about", testid: "nav-about" },
  { label: "FAQ", to: "/faq", testid: "nav-faq" },
  { label: "Shop", to: "/shop", testid: "nav-shop" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const goMobile = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  // "Free Quote" scrolls to this page's quote form, or opens the homepage one.
  const goQuote = () => {
    setMobileOpen(false);
    if (!scrollToQuoteForm()) navigate("/#quote");
  };

  return (
    <nav
      data-testid="navbar"
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 whitespace-nowrap text-foreground"
          data-testid="navbar-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Hammer className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              The Shirtless Handyman
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium -mt-0.5">
              Seamless Surfaces
            </span>
          </div>
        </Link>

        {/* Desktop nav. Shop makes seven links, so the row starts at lg
            and padding stays tight until xl — otherwise the wordmark squishes. */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.testid}
              to={item.to}
              className="inline-flex items-center h-9 px-2.5 xl:px-4 rounded-full text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid={item.testid}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={TEL_LINK}
            className="ml-2 hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold text-foreground hover:bg-accent transition-colors whitespace-nowrap"
            data-testid="nav-call"
          >
            <Phone className="w-4 h-4 text-[#D97757]" />
            {PHONE_DISPLAY}
          </a>
          <Button
            onClick={goQuote}
            className="ml-2 rounded-full bg-[#D97757] text-white hover:bg-[#C56545] text-sm font-semibold h-9 px-5"
            data-testid="nav-cta-btn"
          >
            Free Quote
          </Button>
        </div>

        {/* Mobile: one-tap call + menu toggle */}
        <div className="lg:hidden flex items-center gap-1">
        <a
          href={TEL_LINK}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#D97757] text-white text-sm font-semibold"
          aria-label={`Call Ryan at ${PHONE_DISPLAY}`}
          data-testid="mobile-nav-call"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-card border-t border-border/40 p-4 flex flex-col gap-2 animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.testid}
              variant="ghost"
              className="w-full justify-start rounded-lg"
              onClick={() => goMobile(item.to)}
              data-testid={`mobile-${item.testid}`}
            >
              {item.label}
            </Button>
          ))}
          <Button
            className="w-full rounded-lg bg-[#D97757] text-white mt-1"
            onClick={goQuote}
            data-testid="mobile-cta-btn"
          >
            Get a Free Quote
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => goMobile("/upload")}
            data-testid="mobile-studio-btn"
          >
            Preview my room (free)
          </Button>
        </div>
      )}
    </nav>
  );
};
