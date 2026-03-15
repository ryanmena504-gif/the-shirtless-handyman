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
import { toast } from "sonner";
import { Send, CheckCircle, Image as ImageIcon, Paintbrush } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const LeadCaptureModal = ({ open, onOpenChange, contractor, projectId, zipCode, selectedDesignStyle, roomPhoto }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
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
        selected_design_style: selectedDesignStyle || "",
        room_photo: roomPhoto || "",
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
    setForm({ name: "", phone: "", email: "", zip_code: zipCode || "" });
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
            {/* Attached context: design style + room photo thumbnail */}
            {(selectedDesignStyle || roomPhoto) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 border border-border/40" data-testid="lead-context-preview">
                {roomPhoto && (
                  <img
                    src={roomPhoto}
                    alt="Your room"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    data-testid="lead-room-photo-preview"
                  />
                )}
                <div className="min-w-0">
                  {selectedDesignStyle && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Paintbrush className="w-3.5 h-3.5 text-[#D97757] flex-shrink-0" />
                      <span className="truncate">{selectedDesignStyle}</span>
                    </div>
                  )}
                  {roomPhoto && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <ImageIcon className="w-3 h-3 flex-shrink-0" />
                      <span>Room photo attached</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                placeholder="70115"
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                className="h-11 rounded-lg"
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
