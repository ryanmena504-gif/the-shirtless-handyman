import { useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Calendar, MessageCircle, FileText, CheckCircle2, Clock,
  Search, Sparkles,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
];

function telLink(phone) {
  return `tel:${(phone || "").replace(/[^\d+]/g, "")}`;
}
function smsLink(phone, name) {
  const body = `Hey ${(name || "").split(" ")[0] || "there"}, this is Ryan from The Shirtless Handyman — saw your quote request. When's a good time to chat?`;
  return `sms:${(phone || "").replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}
function emailLink(email, name) {
  const subject = "Your quote request — The Shirtless Handyman";
  const body = `Hey ${(name || "").split(" ")[0] || "there"},\n\nThanks for reaching out about your renovation project. I'd love to learn more — when works for a quick 5-minute call?\n\n— Ryan\nThe Shirtless Handyman`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function StatusBadge({ status }) {
  const map = {
    new: { bg: "bg-[#D97757]", text: "text-white", label: "New" },
    contacted: { bg: "bg-[#1A3C34]", text: "text-white", label: "Contacted" },
    closed: { bg: "bg-muted", text: "text-muted-foreground", label: "Closed" },
  };
  const cfg = map[status] || map.new;
  return (
    <Badge className={`${cfg.bg} ${cfg.text} text-[10px] uppercase tracking-wider font-bold px-2 py-0.5`}>
      {cfg.label}
    </Badge>
  );
}

/**
 * LeadsInbox — mobile-first contractor lead inbox with tap-to-call/text/email,
 * status filtering, search, and inline status updates.
 */
export const LeadsInbox = ({ leads, onLeadUpdated }) => {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState({});

  const counts = useMemo(() => ({
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    closed: leads.filter((l) => l.status === "closed").length,
  }), [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return (
        (l.name || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.zip_code || "").toLowerCase().includes(q) ||
        (l.project_description || "").toLowerCase().includes(q)
      );
    });
  }, [leads, filter, query]);

  const updateStatus = async (leadId, status) => {
    setUpdating((u) => ({ ...u, [leadId]: status }));
    try {
      await axios.patch(`${API}/leads/${leadId}/status`, { status }, { withCredentials: true });
      toast.success(`Marked ${status}`);
      onLeadUpdated?.(leadId, status);
    } catch {
      toast.error("Couldn't update status. Try again.");
    } finally {
      setUpdating((u) => {
        const next = { ...u };
        delete next[leadId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-4" data-testid="leads-inbox">
      {/* Search + filter pills — sticky on mobile */}
      <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-md py-3 -mx-2 px-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, ZIP…"
            className="h-11 pl-10 rounded-full bg-white"
            data-testid="leads-search-input"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-2 px-2 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 h-9 rounded-full text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-[#1A3C34] text-white"
                  : "bg-white text-muted-foreground border border-border/60 hover:border-[#1A3C34]/30"
              }`}
              data-testid={`leads-filter-${f.key}`}
            >
              {f.label} · {counts[f.key]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border/40 rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {query || filter !== "all"
              ? "No leads match those filters."
              : "No leads yet. They'll appear here the moment homeowners request a quote."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 list-none">
          {filtered.map((lead) => (
            <li
              key={lead.id}
              className="bg-white border border-border/40 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
              data-testid={`lead-card-${lead.id}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-base truncate">{lead.name || "Unknown"}</h3>
                    <StatusBadge status={lead.status || "new"} />
                    {lead.source && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        · {String(lead.source).replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                    {lead.zip_code && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {lead.zip_code}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    {lead.selected_design_style && (
                      <span className="flex items-center gap-1 text-[#D97757] font-medium">
                        <Sparkles className="w-3 h-3" /> {lead.selected_design_style}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {lead.project_description && (
                <p className="text-sm text-foreground/80 mb-3 line-clamp-3">{lead.project_description}</p>
              )}

              {/* Tap-to-contact actions — touch-target sized */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <a
                  href={telLink(lead.phone)}
                  className="flex items-center justify-center gap-1.5 h-11 rounded-lg bg-[#D97757] text-white text-xs font-semibold active:bg-[#C56545]"
                  data-testid={`lead-call-${lead.id}`}
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={smsLink(lead.phone, lead.name)}
                  className="flex items-center justify-center gap-1.5 h-11 rounded-lg bg-[#1A3C34] text-white text-xs font-semibold active:bg-[#0E2A24]"
                  data-testid={`lead-text-${lead.id}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Text
                </a>
                <a
                  href={emailLink(lead.email, lead.name)}
                  className="flex items-center justify-center gap-1.5 h-11 rounded-lg bg-white border border-border text-foreground text-xs font-semibold active:bg-muted"
                  data-testid={`lead-email-${lead.id}`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>

              {/* Status update row */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mr-1">
                  Mark as:
                </span>
                <Button
                  size="sm"
                  variant={lead.status === "contacted" ? "default" : "ghost"}
                  className="h-7 px-2 text-xs rounded-full"
                  disabled={updating[lead.id] === "contacted" || lead.status === "contacted"}
                  onClick={() => updateStatus(lead.id, "contacted")}
                  data-testid={`lead-mark-contacted-${lead.id}`}
                >
                  <Clock className="w-3 h-3 mr-1" /> Contacted
                </Button>
                <Button
                  size="sm"
                  variant={lead.status === "closed" ? "default" : "ghost"}
                  className="h-7 px-2 text-xs rounded-full"
                  disabled={updating[lead.id] === "closed" || lead.status === "closed"}
                  onClick={() => updateStatus(lead.id, "closed")}
                  data-testid={`lead-mark-closed-${lead.id}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Closed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
