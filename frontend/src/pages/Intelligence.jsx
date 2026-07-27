import React from "react";
import TopHeader from "@/components/TopHeader";
import { Radar, TrendingUp, Map, LineChart } from "lucide-react";

const Tile = ({ icon: Icon, title, body }) => (
  <div className="bh-surface rounded p-5">
    <div className="w-9 h-9 rounded bh-surface-2 flex items-center justify-center">
      <Icon size={16} className="text-amber-400" />
    </div>
    <div className="mt-3 font-display text-lg font-semibold text-neutral-100">
      {title}
    </div>
    <p className="mt-1 text-sm text-neutral-400 leading-relaxed">{body}</p>
  </div>
);

const Intelligence = () => (
  <>
    <TopHeader
      pageTitle="Intelligence"
      subtitle="Patterns, markets, and forecasts"
    />
    <div className="px-4 lg:px-8 py-6 space-y-6">
      <section className="bh-surface rounded p-6 border-t border-t-amber-500/60">
        <div className="mono text-[10px] uppercase tracking-widest text-amber-400">
          Coming soon
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold text-neutral-100 tracking-tight max-w-2xl">
          Where is the next wave of demand forming?
        </h2>
        <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Weekly permit velocity, neighborhood heat maps, category trend lines,
          and a running record of which signal types convert best for you.
        </p>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Tile
          icon={LineChart}
          title="Signal Trends"
          body="Volume by source over time — spot the permit spikes before your competitors do."
        />
        <Tile
          icon={Map}
          title="Neighborhood Heat"
          body="Which ZIPs are lighting up this week and how they compare to your win-rate profile."
        />
        <Tile
          icon={TrendingUp}
          title="Win-Rate Explainer"
          body="Which project types, sizes, and sources you actually close best."
        />
        <Tile
          icon={Radar}
          title="Radar"
          body="Anomaly detection on the permit feed — surface unusual filings the moment they appear."
        />
      </section>

      <section className="bh-surface rounded p-6">
        <div className="mono text-[10px] uppercase tracking-widest text-neutral-500">
          Preview / New Orleans this week
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Permits filed", v: "184", d: "+12% vs last week" },
            { l: "Residential", v: "128", d: "70% share" },
            { l: "Median value", v: "$78K", d: "up from $65K" },
            { l: "Owner-filed %", v: "41%", d: "highest since Nov" },
          ].map((s) => (
            <div key={s.l}>
              <div className="mono text-[10px] uppercase tracking-widest text-neutral-500">
                {s.l}
              </div>
              <div className="mt-1 font-display text-3xl font-bold text-neutral-100 tabular-nums">
                {s.v}
              </div>
              <div className="mono text-[10px] text-emerald-400 mt-0.5">
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </>
);

export default Intelligence;
