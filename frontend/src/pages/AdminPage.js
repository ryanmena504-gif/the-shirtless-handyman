import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import {
  Shield, Lock, BarChart3, FileText, Users, Briefcase,
  Mail, Phone, MapPin, Calendar, Paintbrush, Image as ImageIcon,
  LogOut, ChevronDown, ChevronUp
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("leads");
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedLead, setExpandedLead] = useState(null);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (token) {
      setAuthenticated(true);
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem("admin_token", res.data.token);
      setAuthenticated(true);
      toast.success("Welcome, Admin");
      fetchAll();
    } catch {
      toast.error("Invalid admin password");
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    const t = localStorage.getItem("admin_token");
    const headers = { Authorization: `Bearer ${t}` };
    try {
      const [statsRes, leadsRes, contractorsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/leads`, { headers }),
        axios.get(`${API}/admin/contractors`, { headers }),
      ]);
      setStats(statsRes.data);
      setLeads(leadsRes.data.leads || []);
      setContractors(contractorsRes.data.contractors || []);
    } catch {
      toast.error("Failed to load admin data");
      localStorage.removeItem("admin_token");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthenticated(false);
    setStats(null);
    setLeads([]);
    setContractors([]);
  };

  // Login screen
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

  // Dashboard
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
          </div>

          <Separator className="mb-8" />

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Leads Tab */}
          {!loading && tab === "leads" && (
            <div className="space-y-3" data-testid="admin-leads-list">
              {leads.length === 0 ? (
                <div className="bg-white border border-border/40 rounded-2xl p-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No renovation leads yet.</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-border/40 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
                    data-testid={`admin-lead-${lead.id}`}
                  >
                    <button
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {lead.room_photo ? (
                          <img src={lead.room_photo} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-foreground truncate">{lead.name}</h3>
                            <Badge className={lead.status === "new" ? "bg-[#D97757] text-white" : "bg-accent text-accent-foreground"}>
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />ZIP {lead.zip_code}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {expandedLead === lead.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>

                    {expandedLead === lead.id && (
                      <div className="px-5 pb-5 pt-0 border-t border-border/40 animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Phone</p>
                            <p className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Design Style</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Paintbrush className="w-3 h-3 text-[#D97757]" />
                              {lead.selected_design_style || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                            <p className="text-sm font-medium">{lead.contractor_name || lead.contractor_id || "General"}</p>
                          </div>
                        </div>
                        {lead.project_description && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                            <p className="text-sm">{lead.project_description}</p>
                          </div>
                        )}
                        {lead.room_photo && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Room Photo</p>
                            <img src={lead.room_photo} alt="Room" className="w-32 h-24 rounded-lg object-cover border border-border/40" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Contractors Tab */}
          {!loading && tab === "contractors" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="admin-contractors-list">
              {contractors.length === 0 ? (
                <div className="col-span-2 bg-white border border-border/40 rounded-2xl p-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contractors registered yet.</p>
                </div>
              ) : (
                contractors.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-border/40 rounded-2xl p-5"
                    data-testid={`admin-contractor-${c.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{c.company_name}</h3>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {c.specialties?.map((s) => (
                        <Badge key={s} className="text-xs bg-accent text-accent-foreground">{s}</Badge>
                      ))}
                    </div>
                    {c.service_zip_codes?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>Service: {c.service_zip_codes.join(", ")}</span>
                      </div>
                    )}
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
