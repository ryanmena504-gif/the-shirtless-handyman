import { ShieldCheck, Star, Clock, Award, MapPin } from "lucide-react";

/**
 * TrustStrip — high-density trust signals to display right under the hero.
 * Communicates: licensed, insured, local, responsive, well-reviewed.
 */
export const TrustStrip = ({ variant = "dark" }) => {
  const isDark = variant === "dark";
  const items = [
    { icon: ShieldCheck, label: "Licensed & Insured" },
    { icon: Star, label: "4.9★ Local Reviews" },
    { icon: MapPin, label: "Born in NOLA" },
    { icon: Clock, label: "Avg. response under 1 hr" },
    { icon: Award, label: "200+ NOLA Homes" },
  ];

  return (
    <div
      className={`border-y ${isDark ? "border-white/10 bg-black/40" : "border-border/40 bg-[#F5F5F4]"} backdrop-blur-sm`}
      data-testid="trust-strip"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className={`w-4 h-4 ${isDark ? "text-[#D97757]" : "text-[#D97757]"}`} />
            <span className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white/85" : "text-foreground"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
