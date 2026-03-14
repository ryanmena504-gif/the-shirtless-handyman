import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const LeadCaptureModal = ({ open, onOpenChange, contractor, projectId, zipCode }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    project_description: "",
    zip_code: zipCode || "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads`, {
        ...form,
        project_id: projectId || "",
        contractor_id: contractor?.id || "",
      });
      setSubmitted(true);
      toast.success("Quote request sent successfully!");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: "", phone: "", email: "", project_description: "", zip_code: zipCode || "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="lead-capture-modal">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Fraunces', serif" }}>
            {submitted ? "Request Sent!" : "Request a Quote"}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? "A contractor will reach out to you shortly."
              : contractor
              ? `Get a quote from ${contractor.company_name}`
              : "Fill in your details and we'll connect you with a contractor"}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 gap-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              We've sent your information to the contractor. They'll contact you within 24 hours.
            </p>
            <Button
              onClick={handleClose}
              className="rounded-full bg-primary text-primary-foreground btn-pill"
              data-testid="lead-close-btn"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Full Name *</Label>
              <Input
                id="lead-name"
                data-testid="lead-name-input"
                placeholder="John Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lead-email">Email *</Label>
                <Input
                  id="lead-email"
                  data-testid="lead-email-input"
                  type="email"
                  placeholder="john@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-phone">Phone *</Label>
                <Input
                  id="lead-phone"
                  data-testid="lead-phone-input"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-zip">ZIP Code</Label>
              <Input
                id="lead-zip"
                data-testid="lead-zip-input"
                placeholder="10001"
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                className="h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-desc">Project Description</Label>
              <Textarea
                id="lead-desc"
                data-testid="lead-description-input"
                placeholder="Tell us about your renovation project..."
                value={form.project_description}
                onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                className="rounded-lg resize-none"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full bg-primary text-primary-foreground h-11 btn-pill shadow-lg shadow-primary/20"
              disabled={loading}
              data-testid="lead-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Quote Request
                </span>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
