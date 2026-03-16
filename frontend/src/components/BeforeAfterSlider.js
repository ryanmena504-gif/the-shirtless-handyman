import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeftRight, Layers } from "lucide-react";
import { MaterialExplorer } from "./MaterialExplorer";

export const BeforeAfterSlider = ({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After",
  designName = "",
  contractors = [],
  onRequestQuote = () => {},
  onSaveMaterialsList = () => {}
}) => {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [showMaterialExplorer, setShowMaterialExplorer] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = useCallback((e) => {
    // Don't start dragging if material explorer is active
    if (showMaterialExplorer) return;
    e.preventDefault();
    setDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition, showMaterialExplorer]);

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
    <div className="relative">
      {/* Material Explorer Toggle */}
      <button
        onClick={() => setShowMaterialExplorer(!showMaterialExplorer)}
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
          showMaterialExplorer 
            ? "bg-[#D97757] text-white shadow-lg" 
            : "bg-white/90 text-foreground hover:bg-white shadow-md backdrop-blur-sm"
        }`}
        data-testid="material-explorer-toggle"
      >
        <Layers className="w-3.5 h-3.5" />
        {showMaterialExplorer ? "Hide Materials" : "Explore Materials"}
      </button>

      <div
        ref={containerRef}
        className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden select-none border border-border/40 shadow-sm ${
          showMaterialExplorer ? "cursor-pointer" : "cursor-col-resize"
        }`}
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

        {/* Before image (clipped) - hidden when exploring materials */}
        {!showMaterialExplorer && (
          <div
            className="absolute inset-0 overflow-hidden transition-opacity duration-300"
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
        )}

        {/* Slider line - hidden when exploring materials */}
        {!showMaterialExplorer && (
          <div
            className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] z-10 transition-opacity duration-300"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-[#1A3C34]" />
            </div>
          </div>
        )}

        {/* Labels - adjust based on mode */}
        {!showMaterialExplorer && (
          <>
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
          </>
        )}

        {/* Material Explorer Overlay */}
        <MaterialExplorer
          designImage={afterImage}
          designName={designName}
          contractors={contractors}
          onRequestQuote={onRequestQuote}
          onSaveMaterialsList={onSaveMaterialsList}
          isVisible={showMaterialExplorer}
        />
      </div>
    </div>
  );
};
