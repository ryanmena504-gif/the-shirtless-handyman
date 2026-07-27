import React, { useEffect, useState } from "react";
import TopHeader from "@/components/TopHeader";
import { api } from "@/lib/api";
import { Database, Zap, ShieldCheck, Radio } from "lucide-react";

const Row = ({ icon: Icon, title, subtitle, right }) => (
  <div className="bh-surface rounded p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded bh-surface-2 flex items-center justify-center">
      <Icon size={16} className="text-amber-400" />
    </div>
    <div className="flex-1">
      <div className="font-medium text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div>
    </div>
    {right}
  </div>
);

const Pill = ({ tone, children }) => (
  <span
    className={
      "mono text-[10px] uppercase tracking-widest px-2 py-1 rounded border " +
      (tone === "on"
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
        : "bg-amber-500/10 text-amber-300 border-amber-500/25")
    }
  >
    {children}
  </span>
);

const Settings = () => {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    api.config().then(setCfg);
  }, []);

  const airtableOn = cfg?.airtable_configured;

  return (
    <>
      <TopHeader pageTitle="Settings" subtitle="Configure your operator profile" />
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-4xl">
        <section>
          <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            Section / 01 · Data Sources
          </div>
          <div className="space-y-2">
            <Row
              icon={Database}
              title="Airtable"
              subtitle={
                airtableOn
                  ? `Connected · backend: ${cfg?.backend}`
                  : "Not activated. Bloodhound is running on sample data."
              }
              right={<Pill tone={airtableOn ? "on" : "off"}>{airtableOn ? "Live" : "Sample"}</Pill>}
            />
            <Row
              icon={Radio}
              title="New Orleans Permits"
              subtitle="Primary discovery source · daily refresh via Make.com"
              right={<Pill tone="on">Live</Pill>}
            />
            <Row
              icon={Zap}
              title="OpenAI Analysis"
              subtitle="Prioritization, evidence summary, next best action"
              right={<Pill tone="on">Active</Pill>}
            />
          </div>
        </section>

        <section>
          <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            Section / 02 · Airtable Connection
          </div>
          <div className="bh-surface rounded p-5 space-y-3">
            <p className="text-sm text-neutral-400 leading-relaxed">
              Bloodhound is designed to read opportunities from Airtable through
              a server-side data layer — no keys are ever shipped to the browser.
              To activate the live connection, set the following environment
              variables on the backend and restart the service.
            </p>
            <div className="bh-surface-2 rounded p-4 mono text-xs text-neutral-300 space-y-1">
              <div><span className="text-amber-300">AIRTABLE_API_KEY</span>=your-personal-access-token</div>
              <div><span className="text-amber-300">AIRTABLE_BASE_ID</span>=appXXXXXXXXXXXXXX</div>
              <div><span className="text-amber-300">AIRTABLE_OPPORTUNITIES_TABLE</span>=Opportunities</div>
              <div><span className="text-amber-300">AIRTABLE_ENABLED</span>=true</div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed flex items-start gap-2">
              <ShieldCheck size={12} className="text-emerald-400 mt-0.5" />
              Credentials never leave the server. The FastAPI layer is the only
              component that talks to Airtable.
            </p>
          </div>
        </section>

        <section>
          <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            Section / 03 · Operator Preferences
          </div>
          <div className="bh-surface rounded p-5 space-y-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                Operator name
              </div>
              <input
                defaultValue="Ryan C."
                data-testid="settings-name"
                className="w-full bg-transparent border bh-hairline rounded h-9 px-3 text-sm text-neutral-100 focus:border-amber-500/50 outline-none"
              />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                Primary market
              </div>
              <input
                defaultValue="New Orleans, LA"
                data-testid="settings-market"
                className="w-full bg-transparent border bh-hairline rounded h-9 px-3 text-sm text-neutral-100 focus:border-amber-500/50 outline-none"
              />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                Ideal project range
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  defaultValue="$40,000"
                  data-testid="settings-min"
                  className="w-full bg-transparent border bh-hairline rounded h-9 px-3 text-sm text-neutral-100 mono focus:border-amber-500/50 outline-none"
                />
                <input
                  defaultValue="$300,000"
                  data-testid="settings-max"
                  className="w-full bg-transparent border bh-hairline rounded h-9 px-3 text-sm text-neutral-100 mono focus:border-amber-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Settings;
