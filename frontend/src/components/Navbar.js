import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Button } from "../components/ui/button";
import { Menu, X, Hammer, LogIn, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { contractorAuth } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50" data-testid="navbar-wrap">
      <nav
        data-testid="navbar"
        className="glass-card border-b border-border/40"
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/upload")}
            data-testid="nav-start-btn"
          >
            Start Project
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/portfolio")}
            data-testid="nav-portfolio-btn"
          >
            My Work
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/blog")}
            data-testid="nav-blog-btn"
          >
            Journal
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/about")}
            data-testid="nav-about-btn"
          >
            About Ryan
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/book")}
            data-testid="nav-book-btn"
          >
            Book
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium"
            onClick={() => navigate("/faq")}
            data-testid="nav-faq-btn"
          >
            FAQ
          </Button>
          {contractorAuth ? (
            <Button
              variant="ghost"
              className="rounded-full text-sm font-medium"
              onClick={() => navigate("/contractor/dashboard")}
              data-testid="nav-dashboard-btn"
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="rounded-full text-sm font-medium"
              onClick={() => navigate("/contractor/login")}
              data-testid="nav-contractor-login-btn"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Contractor Login
            </Button>
          )}
          <Button
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 btn-pill"
            onClick={() => navigate("/upload")}
            data-testid="nav-cta-btn"
          >
            Request an Assessment
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
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/upload"); setMobileOpen(false); }}
            data-testid="mobile-start-btn"
          >
            Start Project
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/portfolio"); setMobileOpen(false); }}
            data-testid="mobile-portfolio-btn"
          >
            My Work
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/blog"); setMobileOpen(false); }}
            data-testid="mobile-blog-btn"
          >
            Journal
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/about"); setMobileOpen(false); }}
            data-testid="mobile-about-btn"
          >
            About Ryan
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/book"); setMobileOpen(false); }}
            data-testid="mobile-book-btn"
          >
            Book Appointment
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg"
            onClick={() => { navigate("/faq"); setMobileOpen(false); }}
            data-testid="mobile-faq-btn"
          >
            FAQ
          </Button>
          {contractorAuth ? (
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg"
              onClick={() => { navigate("/contractor/dashboard"); setMobileOpen(false); }}
              data-testid="mobile-dashboard-btn"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg"
              onClick={() => { navigate("/contractor/login"); setMobileOpen(false); }}
              data-testid="mobile-contractor-login-btn"
            >
              Contractor Login
            </Button>
          )}
          <Button
            className="w-full rounded-lg bg-primary text-primary-foreground"
            onClick={() => { navigate("/upload"); setMobileOpen(false); }}
            data-testid="mobile-cta-btn"
          >
            Request an Assessment
          </Button>
        </div>
      )}
      </nav>
    </div>
  );
};
