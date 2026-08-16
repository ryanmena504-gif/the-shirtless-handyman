import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ViewTubeWordmark } from "../components/viewtube/ViewTubeWordmark";
import { ViewTubeHardStop } from "../components/viewtube/ViewTubeHardStop";
import {
  captureFrame,
  fetchViewTubeSession,
  postViewTubeEvent,
  sampleFrameSignals,
  speakViewTubeLine,
} from "../lib/viewtube";
import { ViewTubeCoachPortrait } from "../components/viewtube/ViewTubeCoachPortrait";
import { toast } from "sonner";

export default function ViewTubeWatchPage() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastSpoken = useRef("");
  const audioRef = useRef(null);
  const audioUrlRef = useRef("");
  const [session, setSession] = useState(null);
  const [camError, setCamError] = useState("");
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    fetchViewTubeSession(sessionId)
      .then(setSession)
      .catch(() => toast.error("Session not found"));
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCamError(err?.message || "Camera permission is required");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const text = session?.coach_line?.text;
    const coachId = session?.coach_id;
    if (!text || !coachId || muted || text === lastSpoken.current) return;
    lastSpoken.current = text;
    let cancelled = false;

    (async () => {
      try {
        const url = await speakViewTubeLine(coachId, text);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        await audioRef.current.play();
      } catch (err) {
        toast.error(err?.response?.data?.detail || "AI voice could not speak that line");
      }
    })();

    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [session?.coach_line?.text, session?.coach_id, muted]);

  const send = useCallback(
    async (type, extraSignals = {}) => {
      if (!sessionId || busy) return;
      setBusy(true);
      const shouldLook = ["check_me", "confirm_setup", "confirm_safety"].includes(type);
      if (shouldLook) setLooking(true);
      try {
        const frameSignals = sampleFrameSignals(videoRef.current);
        const frame = shouldLook ? captureFrame(videoRef.current) : "";
        const next = await postViewTubeEvent(
          sessionId,
          type,
          { ...frameSignals, ...extraSignals },
          frame,
        );
        setSession(next);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "The coach could not take that");
      } finally {
        setLooking(false);
        setBusy(false);
      }
    },
    [sessionId, busy],
  );

  const step = session?.project?.steps?.[session?.step_index];
  const stopped = Boolean(session?.interrupt);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" data-testid="viewtube-watch">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="viewtube-camera"
      />
      <div className="absolute inset-0 viewtube-scanlines pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 pt-5">
        <Link to="/viewtube" className="flex items-center gap-3">
          <ViewTubeWordmark size="sm" invert />
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-[#ff4d4d] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ff4d4d] viewtube-rec" />
            Live
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="viewtube-mute-btn"
            onClick={() => {
              setMuted((m) => {
                if (!m) audioRef.current?.pause();
                return !m;
              });
            }}
            className="h-9 px-3 rounded-full border border-white/20 text-xs"
          >
            {muted ? "Voice off" : "Voice on"}
          </button>
          <Link to="/viewtube/setup" className="h-9 px-3 rounded-full border border-white/20 text-xs flex items-center">
            End
          </Link>
        </div>
      </header>

      {camError && (
        <div className="relative z-20 mx-5 mt-6 rounded-2xl border border-white/15 bg-black/70 p-5" data-testid="viewtube-cam-error">
          <p className="text-sm text-white/80">{camError}. Grant camera access so the coach can see the bench. The session still runs if you continue.</p>
        </div>
      )}

      {session && session.status === "setup" && !stopped && (
        <div className="absolute inset-x-0 top-20 z-20 px-5" data-testid="viewtube-tripod-hint">
          <div className="max-w-md rounded-2xl border border-white/15 bg-black/70 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#D97757] font-bold mb-2">Phone on a stand</p>
            <p className="text-sm text-white/80 leading-relaxed">
              Clamp it so I see the bench, not your face. Hands free. Then tap I&apos;m set — I will look at a still before we start.
            </p>
          </div>
        </div>
      )}

      {looking && (
        <div className="absolute top-20 right-5 z-30 text-[10px] uppercase tracking-[0.28em] text-white/70" data-testid="viewtube-looking">
          Looking at the bench
        </div>
      )}

      {session && (
        <>
          <div className="absolute left-5 bottom-36 z-20 max-w-sm">
            <div className="flex items-end gap-3">
              <ViewTubeCoachPortrait
                coachId={session.coach_id}
                className="w-16 h-20 rounded-xl border border-white/20 overflow-hidden"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#D97757] font-bold">
                  {session.coach.name}
                  {looking ? " · looking" : ""}
                </p>
                <p className="text-sm text-white/90 leading-snug mt-1" data-testid="viewtube-coach-line">
                  {session.coach_line?.text}
                </p>
                {session.last_look?.note && (
                  <p className="mt-2 text-[11px] text-white/45" data-testid="viewtube-last-look">
                    Last look · {session.last_look.note}
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="absolute right-5 top-20 z-20 w-56 hidden md:block">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40 mb-3">Steps</p>
            <ol className="space-y-2">
              {session.project.steps.map((s, i) => (
                <li
                  key={s.id}
                  className={`text-xs leading-snug ${
                    i === session.step_index ? "text-white" : i < session.step_index ? "text-[#D97757]" : "text-white/35"
                  }`}
                >
                  {i + 1}. {s.title}
                </li>
              ))}
            </ol>
            {session.status === "completed" && (
              <p className="mt-4 text-sm text-[#D97757]" data-testid="viewtube-complete">Session complete.</p>
            )}
          </aside>

          <footer className="absolute inset-x-0 bottom-0 z-20 p-4">
            <div className="max-w-3xl mx-auto">
              {step && (
                <p className="text-xs uppercase tracking-[0.22em] text-white/50 mb-3">
                  {session.project.title} · {step.title}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {session.status === "setup" && (
                  <button type="button" data-testid="viewtube-set-btn" disabled={busy} onClick={() => send("confirm_setup")} className="viewtube-action">
                    I&apos;m set
                  </button>
                )}
                {step?.optional && session.status !== "setup" && session.status !== "completed" && (
                  <button
                    type="button"
                    data-testid="viewtube-skip-optional-btn"
                    disabled={busy}
                    onClick={() => send("bypass_safety")}
                    className="viewtube-action-ghost"
                  >
                    Skip this
                  </button>
                )}
                {session.project.requires_ppe && !session.safety_cleared && !step?.optional && session.status !== "setup" && (
                  <button type="button" data-testid="viewtube-safe-btn" disabled={busy} onClick={() => send("bypass_safety")} className="viewtube-action-ghost">
                    Skip glasses
                  </button>
                )}
                {session.status !== "setup" && session.status !== "completed" && (
                  <>
                    <button type="button" data-testid="viewtube-check-btn" disabled={busy || stopped} onClick={() => send("check_me")} className="viewtube-action">
                      {looking ? "Looking…" : "Check me"}
                    </button>
                    <button type="button" data-testid="viewtube-done-btn" disabled={busy || stopped} onClick={() => send("complete_step")} className="viewtube-action-ghost">
                      Done with this step
                    </button>
                    <button
                      type="button"
                      data-testid="viewtube-wrong-btn"
                      disabled={busy || stopped}
                      onClick={() => send("flag_wrong")}
                      className="viewtube-action-danger"
                    >
                      That&apos;s wrong
                    </button>
                  </>
                )}
              </div>
            </div>
          </footer>

          <ViewTubeHardStop
            interrupt={session.interrupt}
            acknowledging={busy}
            onAcknowledge={() => send("acknowledge_interrupt")}
            onResume={() => send("resume")}
            onBypass={() => send("bypass_safety")}
          />
        </>
      )}
    </div>
  );
}
