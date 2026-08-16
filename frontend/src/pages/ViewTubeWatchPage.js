import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ViewTubeWordmark } from "../components/viewtube/ViewTubeWordmark";
import { ViewTubeHardStop } from "../components/viewtube/ViewTubeHardStop";
import {
  LOOKING_LINE,
  SAW_THAT_LINE,
  captureFrame,
  fetchViewTubeSession,
  peekViewTubeSpeakCache,
  postViewTubeEvent,
  prefetchViewTubeLines,
  sampleFrameSignals,
  speakViewTubeLine,
} from "../lib/viewtube";
import {
  SENSE,
  analyzeFrame,
  createSenseState,
  motionMatters,
  reduceSense,
  sampleVideo,
} from "../lib/viewtubeSense";
import { playViewTubeUrl, stopViewTubeVoice, unlockViewTubeVoice } from "../lib/viewtubeVoice";
import { ViewTubeCoachPortrait } from "../components/viewtube/ViewTubeCoachPortrait";
import { toast } from "sonner";

export default function ViewTubeWatchPage() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastSpoken = useRef("");
  const busyRef = useRef(false);
  const glanceInFlight = useRef(false);
  const genRef = useRef(0);
  const mutedRef = useRef(false);
  const sessionRef = useRef(null);
  const lookingRef = useRef(false);
  const [session, setSession] = useState(null);
  const [camError, setCamError] = useState("");
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [senseMode, setSenseMode] = useState("idle");

  mutedRef.current = muted;
  lookingRef.current = looking;
  sessionRef.current = session;

  const playUrl = useCallback(async (url) => {
    if (!url || mutedRef.current) return;
    try {
      await playViewTubeUrl(url);
    } catch {
      // Autoplay can fail until a tap. The next user action retries.
    }
  }, []);

  useEffect(() => {
    fetchViewTubeSession(sessionId)
      .then((data) => {
        setSession(data);
        prefetchViewTubeLines(data.coach_id, data.prefetch_lines || []);
      })
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
      stopViewTubeVoice();
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
        if (cancelled) return;
        await playUrl(url);
      } catch (err) {
        toast.error(err?.response?.data?.detail || "AI voice could not speak that line");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.coach_line?.text, session?.coach_id, muted, playUrl]);

  const send = useCallback(
    async (type, extraSignals = {}) => {
      if (!sessionId || busyRef.current) return;
      unlockViewTubeVoice();
      busyRef.current = true;
      genRef.current += 1;
      setBusy(true);
      const shouldLook = type === "check_me";
      if (shouldLook) {
        setLooking(true);
        const coachId = sessionRef.current?.coach_id;
        const filler = coachId ? peekViewTubeSpeakCache(coachId, LOOKING_LINE) : "";
        if (filler) playUrl(filler);
      }
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
        if (next?.prefetch_lines) {
          prefetchViewTubeLines(next.coach_id, next.prefetch_lines);
        }
      } catch (err) {
        toast.error(err?.response?.data?.detail || "The coach could not take that");
      } finally {
        setLooking(false);
        setBusy(false);
        busyRef.current = false;
      }
    },
    [sessionId, playUrl],
  );

  const glance = useCallback(async (extraSignals = {}) => {
    if (!sessionId || busyRef.current || glanceInFlight.current || lookingRef.current) return;
    const sess = sessionRef.current;
    if (!sess || sess.status !== "live" || sess.interrupt) return;
    glanceInFlight.current = true;
    const gen = genRef.current;
    try {
      const frameSignals = sampleFrameSignals(videoRef.current);
      const frame = captureFrame(videoRef.current, 480, 0.55);
      if (!frame) return;
      const next = await postViewTubeEvent(
        sessionId,
        "glance",
        { ...frameSignals, ...extraSignals },
        frame,
      );
      if (busyRef.current || gen !== genRef.current) return;
      setSession(next);
    } catch {
      // Background looks fail closed and stay quiet.
    } finally {
      glanceInFlight.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (session?.status !== "live" || session?.interrupt) return;
    if (!motionMatters(session.watch)) return;
    const id = setInterval(() => {
      glance({ look_source: "heartbeat" });
    }, SENSE.heartbeatMs);
    return () => clearInterval(id);
  }, [session?.status, session?.interrupt, session?.watch, glance]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SENSE.width;
    canvas.height = SENSE.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let prevGray = null;
    let sense = createSenseState();
    let raf = 0;
    let lastTick = 0;
    let lastHud = "idle";

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (t - lastTick < SENSE.sampleMs) return;
      lastTick = t;
      const sess = sessionRef.current;
      if (!sess || sess.status === "completed" || sess.status === "hard_stop") return;
      const pixels = sampleVideo(videoRef.current, canvas, ctx);
      if (!pixels) return;
      const sample = analyzeFrame(pixels, prevGray, SENSE.width, SENSE.height);
      prevGray = sample.gray;
      sense = reduceSense(sense, sample, Date.now());
      if (sense.mode !== lastHud) {
        lastHud = sense.mode;
        setSenseMode(sense.mode);
      }
      const edge = sense.lastEdge;
      if (!edge) return;
      const watch = sess.watch || sess.project?.steps?.[sess.step_index]?.watch || "ambient";
      const care = motionMatters(watch);

      if (edge === "shock") {
        if (!care) return;
        const url = peekViewTubeSpeakCache(sess.coach_id, SAW_THAT_LINE);
        if (url && !mutedRef.current) playViewTubeUrl(url).catch(() => {});
        postViewTubeEvent(sessionId, "sense", {
          edge,
          brightness: sample.brightness,
          motion: sample.motion,
          skin: sample.skin,
          face: sample.face,
          watch,
        }, "").catch(() => {});
        return;
      }

      if (edge === "settled") {
        if (!care) return;
        glance({ look_source: "settled" });
        return;
      }

      if (edge === "lost" || edge === "face" || edge === "found") {
        genRef.current += 1;
        postViewTubeEvent(sessionId, "sense", {
          edge,
          brightness: sample.brightness,
          motion: sample.motion,
          skin: sample.skin,
          face: sample.face,
        }, "")
          .then((next) => {
            setSession(next);
          })
          .catch(() => {});
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sessionId, glance]);

  const step = session?.project?.steps?.[session?.step_index];
  const stopped = Boolean(session?.interrupt) && !session?.interrupt?.auto_recover;
  const lastLook = session?.last_look;
  const watching = motionMatters(step?.watch) && ["stirring", "shock", "settled"].includes(senseMode);

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
              unlockViewTubeVoice();
              setMuted((m) => {
                if (!m) stopViewTubeVoice();
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
              Clamp it so I see the bench, not your face. Hands free. Tap I&apos;m set — I start talking. I watch motion on this phone. The cloud only looks when you move.
            </p>
          </div>
        </div>
      )}

      {(looking || watching) && (
        <div className="absolute top-20 right-5 z-30 text-[10px] uppercase tracking-[0.28em] text-white/70" data-testid="viewtube-looking">
          {looking ? "Looking at the bench" : senseMode === "shock" ? "I saw that" : "Watching the bench"}
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
                  {looking ? " · looking" : watching ? " · watching" : ""}
                </p>
                <p className="text-sm text-white/90 leading-snug mt-1" data-testid="viewtube-coach-line">
                  {session.coach_line?.text}
                </p>
                {lastLook?.note && lastLook.source !== "glance" && lastLook.source !== "heartbeat" && lastLook.source !== "settled" && (
                  <p className="mt-2 text-[11px] text-white/45" data-testid="viewtube-last-look">
                    Last look · {lastLook.note}
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
