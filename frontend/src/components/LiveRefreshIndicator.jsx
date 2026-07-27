import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { fmtRelative } from "@/lib/formatters";

const POLL_MS = 8000;

export const LiveRefreshIndicator = () => {
  const [status, setStatus] = useState(null);
  const [manualPulse, setManualPulse] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await api.cacheStatus();
      setStatus(s);
    } catch {
      // silent — sidebar shouldn't be noisy
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const refresh = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setManualPulse(true);
    try {
      const s = await api.refreshCache();
      setStatus(s);
      toast.success(`Refreshed — ${s.count} records`);
    } catch {
      toast.error("Refresh failed");
    } finally {
      setTimeout(() => setManualPulse(false), 800);
    }
  };

  if (!status) {
    return (
      <div className="bh-surface-2 rounded p-3" data-testid="live-refresh">
        <div className="mono text-[9px] uppercase tracking-widest text-neutral-600">
          Loading source…
        </div>
      </div>
    );
  }

  const isLive = status.backend === "airtable";
  const isRefreshing = status.is_refreshing || manualPulse;
  const isStale = status.is_stale && !isRefreshing;
  const label = isLive ? "New Orleans permits" : "Sample data";

  const dotColor = isRefreshing
    ? "bg-amber-400"
    : isStale
      ? "bg-red-400"
      : "bg-emerald-400";

  const stateLabel = isRefreshing
    ? "Refreshing…"
    : isStale
      ? "Stale · click to refresh"
      : status.last_refresh
        ? `Updated ${fmtRelative(status.last_refresh)}`
        : "Ready";

  return (
    <button
      type="button"
      onClick={refresh}
      data-testid="live-refresh"
      className="w-full text-left bh-surface-2 rounded p-3 hover:bg-white/[0.05] transition-colors duration-150"
      title={
        isLive
          ? `Auto-refresh every ${status.ttl_seconds}s · click to refresh now`
          : "Running on sample data"
      }
    >
      <div className="flex items-center justify-between">
        <div className="mono text-[9px] uppercase tracking-widest text-neutral-500">
          Live Signal Source
        </div>
        <RefreshCw
          size={11}
          strokeWidth={2.25}
          className={
            "text-neutral-500 " +
            (isRefreshing ? "animate-spin text-amber-400" : "")
          }
        />
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-200">
        <span
          className={
            "w-1.5 h-1.5 rounded-full " +
            dotColor +
            (isRefreshing || !isStale ? " bh-pulse-dot" : "")
          }
          data-testid="live-refresh-dot"
        />
        {label}
      </div>
      <div
        className="mono text-[10px] text-neutral-500 mt-1"
        data-testid="live-refresh-state"
      >
        {stateLabel}
        {isLive && !isRefreshing && !isStale && status.count !== undefined && (
          <>
            {" · "}
            <span className="text-neutral-400">{status.count} records</span>
          </>
        )}
      </div>
    </button>
  );
};

export default LiveRefreshIndicator;
