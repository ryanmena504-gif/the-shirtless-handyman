import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";
import { Navbar } from "../components/Navbar";
import { AdminLeadsList } from "../components/AdminLeadsList";
import { AdminContractorsList } from "../components/AdminContractorsList";
import { AdminPortfolioTab } from "../components/AdminPortfolioTab";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import {
  Shield, Lock, FileText, Briefcase,
  LogOut, Camera
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const { adminAuth, loginAdmin, logoutAdmin, checkAdminAuth } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("leads");
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const opts = { withCredentials: true };
      const [statsRes, leadsRes, contractorsRes, portfolioRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, opts),
        axios.get(`${API}/admin/leads`, opts),
        axios.get(`${API}/admin/contractors`, opts),
        axios.get(`${API}/admin/portfolio`, opts),
      ]);
      setStats(statsRes.data);
      setLeads(leadsRes.data.leads || []);
      setContractors(contractorsRes.data.contractors || []);
      setPortfolio(portfolioRes.data.items || []);
    } catch {
      toast.error("Session expired");
      await logoutAdmin();
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [logoutAdmin]);

  useEffect(() => {
    const init = async () => {
      const valid = await checkAdminAuth();
      if (valid) {
        setAuthenticated(true);
        fetchAll();
      }
    };
    if (adminAuth) {
      setAuthenticated(true);
      fetchAll();
    } else {
      init();
    }
  }, [adminAuth, checkAdminAuth, fetchAll]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await loginAdmin(password);
      setAuthenticated(true);
      toast.success("Welcome, Admin");
      fetchAll();
    } catch {
      toast.error("Invalid admin password");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setStats(null);
    setLeads([]);
    setContractors([]);
    setPortfolio([]);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background" data-testid="admin-login-page">
        <Navbar />
        <div className="pt-24 pb-16 px-6 md:px-12 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1
                className="text-3xl font-light tracking-tight text-foreground mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">Enter admin password to continue</p>
            </div>
            <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-pw">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-pw"
                      data-testid="admin-password-input"
                      type="password"
                      placeholder="Admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 rounded-lg"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground btn-pill shadow-lg shadow-primary/20"
                  data-testid="admin-login-btn"
                >
                  {loggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-[#D97757]" />
                <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757]">Admin Panel</p>
              </div>
              <h1
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Renovation Leads Dashboard
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full text-sm text-muted-foreground"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Log Out
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8" data-testid="admin-stats">
              <div className="bg-white border border-border/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Leads</p>
                <p className="text-3xl font-semibold text-foreground">{stats.total_leads}</p>
              </div>
              <div className="bg-[#D97757]/10 border border-[#D97757]/20 rounded-xl p-4">
                <p className="text-xs text-[#D97757] uppercase tracking-wide mb-1">New Leads</p>
                <p className="text-3xl font-semibold text-[#D97757]">{stats.new_leads}</p>
              </div>
              <div className="bg-white border border-border/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contractors</p>
                <p className="text-3xl font-semibold text-foreground">{stats.total_contractors}</p>
              </div>
              <div className="bg-white border border-border/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Projects</p>
                <p className="text-3xl font-semibold text-foreground">{stats.total_projects}</p>
              </div>
              <div className="bg-white border border-border/40 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completed</p>
                <p className="text-3xl font-semibold text-foreground">{stats.completed_projects}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={tab === "leads" ? "default" : "ghost"}
              className={`rounded-full text-sm ${tab === "leads" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setTab("leads")}
              data-testid="admin-tab-leads"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Leads ({leads.length})
            </Button>
            <Button
              variant={tab === "contractors" ? "default" : "ghost"}
              className={`rounded-full text-sm ${tab === "contractors" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setTab("contractors")}
              data-testid="admin-tab-contractors"
            >
              <Briefcase className="w-4 h-4 mr-1.5" />
              Contractors ({contractors.length})
            </Button>
            <Button
              variant={tab === "portfolio" ? "default" : "ghost"}
              className={`rounded-full text-sm ${tab === "portfolio" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setTab("portfolio")}
              data-testid="admin-tab-portfolio"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              Portfolio ({portfolio.length})
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-sm ml-auto"
              onClick={() => (window.location.href = "/admin/schedule")}
              data-testid="admin-goto-schedule"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Schedule Blocker
            </Button>
          </div>

          <Separator className="mb-8" />

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && tab === "leads" && <AdminLeadsList leads={leads} />}
          {!loading && tab === "contractors" && <AdminContractorsList contractors={contractors} />}
          {!loading && tab === "portfolio" && <AdminPortfolioTab portfolio={portfolio} onRefresh={fetchAll} />}
        </div>
      </div>
    </div>
  );
}
