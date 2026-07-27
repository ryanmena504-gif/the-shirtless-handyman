import React from "react";
import clsx from "clsx";
import { fmtMoney } from "@/lib/formatters";

const stageAccent = {
  New: "border-t-blue-500/60",
  "Needs research": "border-t-amber-500/60",
  Ready: "border-t-emerald-500/60",
  "Conversation started": "border-t-sky-500/60",
  "Estimate requested": "border-t-indigo-500/60",
  "Estimate sent": "border-t-violet-500/60",
  Won: "border-t-emerald-400",
  Lost: "border-t-red-500/60",
  Disqualified: "border-t-neutral-500/60",
};

export const StatusPipeline = ({ stages, onSelect }) => {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div
      data-testid="status-pipeline"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2"
    >
      {stages.map((s) => (
        <button
          key={s.status}
          onClick={() => onSelect?.(s.status)}
          data-testid={`pipeline-stage-${s.status}`}
          className={clsx(
            "text-left bh-surface rounded p-3 border-t hover:bg-white/[0.03] transition-colors duration-150",
            stageAccent[s.status] || "border-t-white/10",
          )}
        >
          <div className="mono text-[9px] uppercase tracking-widest text-neutral-500 truncate">
            {s.status}
          </div>
          <div className="mt-1.5 font-display text-2xl font-bold text-neutral-100 tabular-nums leading-none">
            {s.count}
          </div>
          <div className="mono text-[10px] text-neutral-500 mt-1">
            {fmtMoney(s.value)}
          </div>
          <div className="mt-2 h-0.5 bg-white/[0.06] rounded overflow-hidden">
            <div
              className="h-full bg-amber-500/70"
              style={{ width: `${(s.count / maxCount) * 100}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default StatusPipeline;
