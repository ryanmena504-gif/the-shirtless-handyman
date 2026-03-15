import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";

export const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel = "Before", afterLabel = "After" }) => {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => updatePosition(e.clientX);
    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, updatePosition]);

  if (!beforeImage || !afterImage) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-col-resize select-none border border-border/40 shadow-sm"
      onPointerDown={handlePointerDown}
      data-testid="before-after-slider"
    >
      {/* After image (full background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100vw", maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] z-10"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4 text-[#1A3C34]" />
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase z-10"
        style={{ backgroundColor: "rgba(26,60,52,0.85)", color: "white" }}
        data-testid="before-label"
      >
        {beforeLabel}
      </div>
      <div
        className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase z-10"
        style={{ backgroundColor: "rgba(217,119,87,0.9)", color: "white" }}
        data-testid="after-label"
      >
        {afterLabel}
      </div>
    </div>
  );
};
