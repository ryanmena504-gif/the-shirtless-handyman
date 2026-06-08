import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Download, Share2 } from "lucide-react";
import { trackEvent } from "../lib/tracking";

/**
 * ShareCard — renders a 1080x1350 Instagram-portrait share card with the user's
 * Studio design + branding, and exports it as a PNG via html-to-image.
 *
 * On mobile, uses Web Share API (Files) so the user can drop straight into
 * Instagram/Messages. On desktop, triggers a normal download.
 *
 * Props:
 *   afterImage   — the AI-generated design URL (data: or remote)
 *   beforeImage  — the user's original room photo
 *   designName   — e.g. "Microcement Modern"
 *   city         — e.g. "New Orleans"
 *   projectId    — for analytics
 */
export const ShareCard = ({ afterImage, beforeImage, designName, city = "New Orleans", projectId }) => {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const exportPng = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      // Wait one paint tick so any in-flight image decodes settle.
      await new Promise((r) => requestAnimationFrame(r));
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        cacheBust: true,
        width: 1080,
        height: 1350,
        backgroundColor: "#0E0E0E",
        // Skip remote images that taint the canvas; html-to-image inlines DOM-level data.
        skipFonts: false,
      });
      trackEvent("share_card_exported", { project_id: projectId, design: designName });

      // Try Web Share API with files on mobile
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `seamless-studio-${(designName || "design").toLowerCase().replace(/\s+/g, "-")}.png`, {
          type: "image/png",
        });
        if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Seamless Studio design",
            text: `Designed in The Seamless Studio — theshirtlesshandyman.com`,
          });
          trackEvent("share_card_native_shared", { project_id: projectId });
          return;
        }
      } catch {
        /* fall through to download */
      }

      // Desktop fallback: trigger a download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `seamless-studio-${(designName || "design").toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Share card downloaded — drop it on Instagram or text it to a friend.");
    } catch (e) {
      toast.error("Couldn't generate the share card. Try again?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="share-card-wrapper">
      {/* Offscreen 1080x1350 canvas — scaled down for preview, but exported at full size */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E0E]">
        <div
          ref={cardRef}
          style={{
            width: 1080,
            height: 1350,
            transformOrigin: "top left",
            transform: "scale(0.32)",
            marginBottom: 1350 * 0.32 - 1350,
            marginRight: 1080 * 0.32 - 1080,
            backgroundColor: "#0E0E0E",
            color: "white",
            position: "relative",
            fontFamily: "'Fraunces', serif",
          }}
          data-testid="share-card-canvas"
        >
          {/* Top brand bar */}
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 48,
              right: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#D97757",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 600,
                  fontSize: 28,
                }}
              >
                S
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.01em" }}>
                  The Shirtless Handyman
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", fontWeight: 700, marginTop: 2 }}>
                  Seamless Studio · {city}
                </div>
              </div>
            </div>
          </div>

          {/* Hero — single design image */}
          <div
            style={{
              position: "absolute",
              top: 152,
              left: 48,
              right: 48,
              height: 880,
              borderRadius: 28,
              overflow: "hidden",
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {afterImage ? (
              <img
                src={afterImage}
                alt={designName || "Seamless Studio design"}
                crossOrigin="anonymous"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : null}

            {/* Bottom gradient + before thumb */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(14,14,14,0.92) 0%, rgba(14,14,14,0.35) 35%, rgba(14,14,14,0) 60%)",
              }}
            />

            {beforeImage ? (
              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  left: 28,
                  width: 220,
                  height: 140,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "3px solid rgba(255,255,255,0.95)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={beforeImage}
                  alt="Before"
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "rgba(0,0,0,0.6)",
                    padding: "4px 10px",
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    borderRadius: 6,
                    color: "#fff",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Before
                </div>
              </div>
            ) : null}

            {/* Design name + AFTER tag */}
            <div
              style={{
                position: "absolute",
                bottom: 36,
                right: 36,
                textAlign: "right",
                color: "#fff",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#D97757",
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                After · {designName || "Design"}
              </div>
              <div style={{ fontSize: 42, fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                Designed in
                <br />
                <em style={{ color: "#D97757", fontStyle: "italic" }}>The Seamless Studio</em>
              </div>
            </div>
          </div>

          {/* Bottom band */}
          <div
            style={{
              position: "absolute",
              bottom: 48,
              left: 48,
              right: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Preview your space in 60s.
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.04em",
                  marginTop: 6,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Microcement · Tadelakt · Rockscape · No grout, no tile.
              </div>
            </div>
            <div
              style={{
                background: "#D97757",
                color: "#fff",
                padding: "16px 28px",
                borderRadius: 999,
                fontSize: 18,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              theshirtlesshandyman.com
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={exportPng}
          disabled={busy}
          className="h-12 px-6 rounded-full bg-[#D97757] text-white hover:bg-[#C56545] font-medium text-sm shadow-lg shadow-[#D97757]/30"
          data-testid="share-card-export-btn"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Rendering 1080×1350…
            </span>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Generate Share Card
            </>
          )}
        </Button>
        <Button
          onClick={exportPng}
          disabled={busy}
          variant="outline"
          className="h-12 px-6 rounded-full border-white/15 text-white/80 hover:bg-white/5 font-medium text-sm"
          data-testid="share-card-download-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>
      <p className="text-xs text-center text-white/40">
        1080 × 1350 — drops straight into an Instagram post or story.
      </p>
    </div>
  );
};
