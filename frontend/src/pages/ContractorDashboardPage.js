import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import {
  LayoutDashboard, User, FileText, Save, LogOut,
  Mail, Phone, MapPin, Calendar, Building2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("contractor_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, leadsRes] = await Promise.all([
        axios.get(`${API}/contractors/me`, { headers }),
        axios.get(`${API}/leads/all`, { headers }),
      ]);
      setProfile(profileRes.data);
      setLeads(leadsRes.data.leads || []);
    } catch {
      toast.error("Failed to load dashboard data");
      localStorage.removeItem("contractor_token");
      navigate("/contractor/login");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/contractor/login");
      return;
    }
    fetchData();
  }, [token, navigate, fetchData]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/contractors/me`, {
        company_name: profile.company_name,
        phone: profile.phone,
        description: profile.description,
        specialties: profile.specialties,
        service_zip_codes: profile.service_zip_codes,
      }, { headers });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("contractor_token");
    localStorage.removeItem("contractor_info");
    navigate("/contractor/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="contractor-dashboard">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1
                className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.company_name}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full text-sm text-muted-foreground"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Log Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-border/40 rounded-xl p-4" data-testid="stat-leads">
              <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
              <p className="text-2xl font-semibold text-foreground">{leads.length}</p>
            </div>
            <div className="bg-white border border-border/40 rounded-xl p-4" data-testid="stat-new-leads">
              <p className="text-sm text-muted-foreground mb-1">New Leads</p>
              <p className="text-2xl font-semibold text-[#D97757]">
                {leads.filter((l) => l.status === "new").length}
              </p>
            </div>
            <div className="bg-white border border-border/40 rounded-xl p-4" data-testid="stat-specialties">
              <p className="text-sm text-muted-foreground mb-1">Specialties</p>
              <p className="text-2xl font-semibold text-foreground">{profile?.specialties?.length || 0}</p>
            </div>
            <div className="bg-white border border-border/40 rounded-xl p-4" data-testid="stat-areas">
              <p className="text-sm text-muted-foreground mb-1">Service Areas</p>
              <p className="text-2xl font-semibold text-foreground">{profile?.service_zip_codes?.length || 0}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={tab === "profile" ? "default" : "ghost"}
              className={`rounded-full text-sm ${tab === "profile" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setTab("profile")}
              data-testid="tab-profile"
            >
              <User className="w-4 h-4 mr-1.5" />
              Profile
            </Button>
            <Button
              variant={tab === "leads" ? "default" : "ghost"}
              className={`rounded-full text-sm ${tab === "leads" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setTab("leads")}
              data-testid="tab-leads"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Leads ({leads.length})
            </Button>
          </div>

          <Separator className="mb-8" />

          {/* Profile Tab */}
          {tab === "profile" && profile && (
            <div className="bg-white border border-border/40 rounded-2xl p-8" data-testid="profile-form">
              <div className="flex items-center gap-2 mb-6">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-medium" style={{ fontFamily: "'Fraunces', serif" }}>
                  Company Profile
                </h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        data-testid="dash-company-input"
                        value={profile.company_name}
                        onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                        className="h-11 pl-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        data-testid="dash-email-input"
                        value={profile.email}
                        disabled
                        className="h-11 pl-10 rounded-lg bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        data-testid="dash-phone-input"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="h-11 pl-10 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Service ZIP Codes</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        data-testid="dash-zip-input"
                        value={profile.service_zip_codes?.join(", ")}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            service_zip_codes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="h-11 pl-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties?.map((s) => (
                      <Badge key={s} className="bg-accent text-accent-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="dash-description-input"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="rounded-lg resize-none"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-full bg-primary text-primary-foreground h-11 px-8 btn-pill shadow-lg shadow-primary/20"
                  data-testid="save-profile-btn"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {tab === "leads" && (
            <div className="space-y-4" data-testid="leads-list">
              {leads.length === 0 ? (
                <div className="bg-white border border-border/40 rounded-2xl p-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads yet. They'll appear here when homeowners request quotes.</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-border/40 rounded-2xl p-6 hover:shadow-sm transition-shadow"
                    data-testid={`lead-card-${lead.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{lead.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={lead.status === "new" ? "bg-[#D97757] text-white" : "bg-accent text-accent-foreground"}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                    {lead.project_description && (
                      <p className="text-sm text-muted-foreground mb-2">{lead.project_description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> ZIP: {lead.zip_code}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
