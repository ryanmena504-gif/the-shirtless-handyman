import { motion } from "framer-motion";
import { OctagonX } from "lucide-react";

export const ViewTubeHardStop = ({ interrupt, onAcknowledge, onResume, acknowledging }) => {
  if (!interrupt) return null;
  const isHard = interrupt.kind === "hard_stop";
  const acked = Boolean(interrupt.acknowledged);

  return (
    <motion.div
      data-testid="viewtube-interrupt"
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: isHard
          ? "rgba(90, 8, 12, 0.88)"
          : "rgba(12, 12, 12, 0.78)",
      }}
    >
      <div className="max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <OctagonX className={`w-10 h-10 ${isHard ? "text-[#ff4d4d]" : "text-[#F5C16C]"}`} />
          <p className="text-xs uppercase tracking-[0.35em] font-bold text-white/70">
            {isHard ? "Hard stop" : interrupt.kind === "ask" ? "Hold on" : "Soft pause"}
          </p>
        </div>
        <h2
          className="text-3xl md:text-4xl font-light text-white leading-tight mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
          data-testid="viewtube-interrupt-line"
        >
          {interrupt.line?.text}
        </h2>
        <p className="text-sm text-white/70 mb-8">{interrupt.resume_hint}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!acked && (
            <button
              type="button"
              data-testid="viewtube-ack-btn"
              onClick={onAcknowledge}
              disabled={acknowledging}
              className="h-12 px-8 rounded-full bg-white text-black text-sm font-semibold"
            >
              I hear you
            </button>
          )}
          <button
            type="button"
            data-testid="viewtube-resume-btn"
            onClick={onResume}
            disabled={isHard && !acked}
            className="h-12 px-8 rounded-full border border-white/40 text-white text-sm font-semibold disabled:opacity-40"
          >
            Resume
          </button>
        </div>
      </div>
    </motion.div>
  );
};
