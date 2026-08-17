import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SeoHead } from "../components/SeoHead";
import { ViewTubeWordmark } from "../components/viewtube/ViewTubeWordmark";
import { ViewTubeCoachPortrait } from "../components/viewtube/ViewTubeCoachPortrait";
import { VIEWTUBE } from "../lib/viewtube";

const RESET = {
  titleOn: true,
  stopOn: false,
  flipped: false,
  hud: "",
  coachName: "Cole",
  line: "Prop the phone. Grab a book.",
  step: "Feel the stop · Show me the front",
  btn: "I'm set",
  btnDim: false,
  caption: "The 30-second product",
};

export default function ViewTubeShowPage() {
  const [scene, setScene] = useState(RESET);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const at = useCallback((ms, patch) => {
    timers.current.push(setTimeout(() => setScene((prev) => ({ ...prev, ...patch })), ms));
  }, []);

  const play = useCallback(() => {
    clearTimers();
    setScene({ ...RESET, titleOn: false, caption: "Phone on a stand" });
    at(600, {
      line: "Thirty seconds. Grab a book, a box, anything with a front. Hold it so I see that face.",
      btn: "I'm set",
    });
    at(2800, {
      btn: "Check me",
      line: "That still is the right way. Tap Check me once.",
      step: "Feel the stop · Show me the front",
    });
    at(4600, {
      hud: "Looking at the bench",
      coachName: "Cole · looking",
      btn: "Looking…",
    });
    at(6200, {
      hud: "",
      coachName: "Cole",
      line: "Got it. Now flip it. Set it on the bench. Don't tap. I will see the motion.",
      step: "Feel the stop · Now flip it",
      btnDim: true,
      btn: "Check me",
    });
    at(9000, {
      flipped: true,
      caption: "Motion on the phone — no cloud yet",
    });
    at(10000, {
      hud: "I saw that",
      coachName: "Cole · watching",
      line: "Hold. I saw that.",
    });
    at(12400, {
      hud: "Looking at the bench",
      caption: "One look against the reference still",
    });
    at(14800, {
      stopOn: true,
      caption: "That's the product",
    });
  }, [at, clearTimers]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimers();
    };
  }, [play, clearTimers]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4 py-6" data-testid="viewtube-show">
      <SeoHead
        title="Feel the stop | viewTube"
        description="Fifteen seconds. Cole watches a book get flipped backwards and freezes the session. No camera. No API."
        canonical="https://theshirtlesshandyman.com/viewtube/show"
      />

      <div className="w-full max-w-[390px] h-[min(844px,92vh)] rounded-[36px] overflow-hidden relative bg-[#111] shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="absolute inset-0 viewtube-show-cam">
          <div className="absolute inset-[18%_8%_22%] rounded-lg viewtube-show-wood" />
          <div
            className={`absolute left-1/2 top-[42%] w-[148px] h-[198px] -ml-[74px] -mt-[99px] rounded-[4px_10px_10px_4px] shadow-[8px_18px_30px_rgba(0,0,0,0.45)] viewtube-book ${
              scene.flipped ? "is-flipped" : ""
            }`}
            data-testid="viewtube-show-book"
          >
            {scene.flipped ? null : (
              <span className="block p-4 text-[22px] font-light leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
                The
                <br />
                right
                <br />
                way
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-0 viewtube-scanlines pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

        <header className="relative z-10 flex justify-between items-center px-5 pt-5">
          <Link to="/viewtube" className="leading-none">
            <ViewTubeWordmark size="sm" invert />
          </Link>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#ff4d4d] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ff4d4d] viewtube-rec" />
            Live
          </p>
        </header>

        <p className="absolute top-[88px] right-5 z-10 text-[10px] uppercase tracking-[0.28em] text-white/70" data-testid="viewtube-show-hud">
          {scene.hud}
        </p>

        <div className="absolute left-5 bottom-[118px] z-10 flex gap-3 items-end max-w-[78%]">
          <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0">
            <ViewTubeCoachPortrait coachId="cole" className="w-full h-full" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#D97757] font-bold mb-1.5">{scene.coachName}</p>
            <p className="text-sm leading-snug text-white/90" data-testid="viewtube-show-line">{scene.line}</p>
          </div>
        </div>

        <footer className="absolute left-0 right-0 bottom-0 z-10 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2.5">{scene.step}</p>
          <button
            type="button"
            className="h-11 px-5 rounded-full border border-white/20 bg-[#D97757] text-white text-sm font-semibold"
            style={{ opacity: scene.btnDim ? 0.4 : 1 }}
          >
            {scene.btn}
          </button>
        </footer>

        {scene.stopOn && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center p-7 text-center bg-[rgba(90,8,12,0.9)]"
            data-testid="viewtube-show-stop"
          >
            <div>
              <div className="w-11 h-11 mx-auto mb-2 border-[3px] border-[#ff4d4d] rounded-[10px] rotate-[22deg]" />
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/70 font-bold">Hard stop</p>
              <h2
                className="text-[34px] font-light leading-tight my-4"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                That's backwards. That's the whole product. Flip it.
              </h2>
              <p className="text-sm text-white/70 mb-6">No spinner. The phone saw the motion. Then it looked.</p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  data-testid="viewtube-show-replay"
                  onClick={play}
                  className="h-12 px-6 rounded-full bg-white text-black text-sm font-semibold"
                >
                  Play it again
                </button>
                <Link
                  to="/viewtube/setup?project=the-stop"
                  data-testid="viewtube-show-live"
                  className="h-12 px-6 rounded-full border border-white/40 text-white text-sm font-semibold flex items-center justify-center"
                >
                  Do it with your camera
                </Link>
              </div>
            </div>
          </div>
        )}

        {scene.titleOn && (
          <div className="absolute inset-0 z-30 bg-[#0B0B0B] flex flex-col justify-end px-7 pb-12" data-testid="viewtube-show-title">
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#D97757] font-bold mb-4">Live · On the bench · Not a video</p>
            <ViewTubeWordmark size="md" invert />
            <h1
              className="mt-6 text-[34px] font-light leading-tight mb-8"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {VIEWTUBE.tagline}
            </h1>
            <button
              type="button"
              data-testid="viewtube-show-play"
              onClick={play}
              className="h-[52px] px-7 rounded-full bg-[#D97757] text-white font-bold text-base self-start"
            >
              Play the stop
            </button>
            <p className="mt-4 text-xs text-white/40">Loads with no camera and no API. Fifteen seconds.</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/35 text-center" data-testid="viewtube-show-caption">
        {scene.caption}
      </p>
    </div>
  );
}
