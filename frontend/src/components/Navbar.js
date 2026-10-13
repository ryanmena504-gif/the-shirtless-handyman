import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Menu, X, Hammer } from "lucide-react";

// Header nav: Logo / Work / Finishes / Process / Pricing / About + "Start a Project" CTA.
const NAV_ITEMS = [
  { label: "Work", to: "/portfolio", testid: "nav-work" },
  { label: "Finishes", to: "/finishes", testid: "nav-finishes" },
  { label: "Process", to: "/#how-it-works", testid: "nav-process" },
  { label: "Pricing", to: "/#pricing", testid: "nav-pricing" },
  { label: "About", to: "/about", testid: "nav-about" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const goMobile = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center gap-2 text-foreground"
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

        {/* Desktop nav — 5 items + 1 CTA */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.testid}
              to={item.to}
              className="inline-flex items-center h-9 px-4 rounded-full text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid={item.testid}
            >
              {item.label}
            </Link>
          ))}
          <Button
            onClick={() => navigate("/upload")}
            className="ml-3 rounded-full bg-primary text-primary-foreground text-sm font-medium h-9 px-5"
            data-testid="nav-cta-btn"
          >
            Start a Project
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-border/40 p-4 flex flex-col gap-2 animate-fade-in">
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
            className="w-full rounded-lg bg-primary text-primary-foreground mt-1"
            onClick={() => goMobile("/upload")}
            data-testid="mobile-cta-btn"
          >
            Start a Project
          </Button>
        </div>
      )}
    </nav>
  );
};
