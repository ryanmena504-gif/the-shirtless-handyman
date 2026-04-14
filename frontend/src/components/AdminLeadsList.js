import { useState } from "react";
import { Badge } from "./ui/badge";
import {
  FileText, Mail, Phone, MapPin, Calendar, Paintbrush,
  Image as ImageIcon, ChevronDown, ChevronUp
} from "lucide-react";

export const AdminLeadsList = ({ leads }) => {
  const [expandedLead, setExpandedLead] = useState(null);

  if (leads.length === 0) {
    return (
      <div className="bg-white border border-border/40 rounded-2xl p-12 text-center">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No renovation leads yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="admin-leads-list">
      {leads.map((lead) => (
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
      ))}
    </div>
  );
};
