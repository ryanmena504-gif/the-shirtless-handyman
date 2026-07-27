import React from "react";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

export const MetricCard = ({
  label,
  value,
  hint,
  accent = false,
  onClick,
  testId,
  icon: Icon,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={clsx(
      "group relative text-left w-full bh-surface rounded-md p-4 lg:p-5",
      "hover:bg-white/[0.03] transition-colors duration-150",
      "border-t",
      accent ? "border-t-amber-500/60" : "border-t-white/10",
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 text-neutral-400">
        {Icon ? <Icon size={13} strokeWidth={2} /> : null}
        <div className="mono uppercase tracking-[0.2em] text-[10px]">{label}</div>
      </div>
      <ArrowUpRight
        size={14}
        className="text-neutral-600 group-hover:text-amber-400 transition-colors duration-150"
        strokeWidth={2}
      />
    </div>
    <div className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-neutral-100 tabular-nums">
      {value}
    </div>
    {hint ? (
      <div className="mt-1.5 text-xs text-neutral-500">{hint}</div>
    ) : null}
  </button>
);

export default MetricCard;
