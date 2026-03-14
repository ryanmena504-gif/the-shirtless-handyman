import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { UserPlus, Building2, Mail, Lock, Phone, MapPin } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SPECIALTY_OPTIONS = ["Bathroom", "Shower", "Kitchen", "Pool Deck", "Patio"];

export default function ContractorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    company_name: "",
    phone: "",
    description: "",
    service_zip_codes: "",
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSpecialty = (s) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.company_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/contractors/register`, {
        ...form,
        specialties,
        service_zip_codes: form.service_zip_codes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      localStorage.setItem("contractor_token", res.data.token);
      localStorage.setItem("contractor_info", JSON.stringify(res.data.contractor));
      toast.success("Registration successful! Welcome aboard.");
      navigate("/contractor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="contractor-register-page">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#D97757] flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1
              className="text-3xl font-light tracking-tight text-foreground mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Join as a Contractor
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your profile and start receiving renovation leads
            </p>
          </div>

          <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reg-company">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-company"
                    data-testid="register-company-input"
                    placeholder="Your Company LLC"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="h-12 pl-10 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      data-testid="register-email-input"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-12 pl-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      data-testid="register-password-input"
                      type="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-12 pl-10 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      data-testid="register-phone-input"
                      placeholder="(555) 123-4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-12 pl-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-zip">Service ZIP Codes</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-zip"
                      data-testid="register-zip-input"
                      placeholder="10001, 10002"
                      value={form.service_zip_codes}
                      onChange={(e) => setForm({ ...form, service_zip_codes: e.target.value })}
                      className="h-12 pl-10 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-3">
                  {SPECIALTY_OPTIONS.map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer"
                      data-testid={`specialty-${s.toLowerCase().replace(" ", "-")}`}
                    >
                      <Checkbox
                        checked={specialties.includes(s)}
                        onCheckedChange={() => toggleSpecialty(s)}
                      />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-desc">Company Description</Label>
                <Textarea
                  id="reg-desc"
                  data-testid="register-description-input"
                  placeholder="Tell homeowners about your experience and services..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground btn-pill shadow-lg shadow-primary/20"
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/contractor/login"
              className="text-primary font-medium hover:underline"
              data-testid="goto-login-link"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
