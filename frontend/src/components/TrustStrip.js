import { UserCheck, ShieldCheck, Flame, CalendarCheck } from "lucide-react";

/**
 * ProofBar — the single-line trust strip that sits right under the hero.
 * Four sharp statements. No fluff, no fabricated counts.
 * Kept exported as `TrustStrip` for backwards compatibility with existing imports.
 */
export const TrustStrip = ({ variant = "dark" }) => {
  const isDark = variant === "dark";
  const items = [
    // Every item here must be literally true. Do not add insurance, review
    // counts, or ratings until they exist and can be verified.
    { icon: UserCheck, label: "Owner-installed, start to finish" },
    { icon: ShieldCheck, label: "Louisiana LLC · locally owned" },
    { icon: CalendarCheck, label: "Free site visit + written quote" },
    { icon: Flame, label: "Free heated floors with a full bathroom" },
  ];

  return (
    <div
      className={`border-y ${isDark ? "border-white/10 bg-black/40" : "border-border/40 bg-[#F5F5F4]"} backdrop-blur-sm`}
      data-testid="proof-bar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className="w-3.5 h-3.5 text-[#D97757] flex-shrink-0" />
            <span className={`text-xs sm:text-sm font-medium tracking-tight ${isDark ? "text-white/85" : "text-foreground"}`}>
              {item.label}
            </span>
            {i < items.length - 1 && (
              <span className={`hidden sm:inline ml-6 text-xs ${isDark ? "text-white/25" : "text-muted-foreground/50"}`}>|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
