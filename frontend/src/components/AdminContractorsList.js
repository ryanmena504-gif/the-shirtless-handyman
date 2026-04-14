import { Badge } from "./ui/badge";
import { Mail, Phone, MapPin, Users } from "lucide-react";

export const AdminContractorsList = ({ contractors }) => {
  if (contractors.length === 0) {
    return (
      <div className="col-span-2 bg-white border border-border/40 rounded-2xl p-12 text-center">
        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No contractors registered yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="admin-contractors-list">
      {contractors.map((c) => (
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
      ))}
    </div>
  );
};
