/**
 * Cinematic UX primitives for The Shirtless Handyman.
 *
 * Reusable building blocks for the "Cinematic Editorial" homepage layer:
 *   - <RevealText>  — letter-by-letter / word-by-word reveal on mount
 *   - <ScrollReveal> — fade-up section on scroll into view
 *   - <MagneticButton> — subtle cursor pull on hover
 *   - <CustomCursor> — page-level cursor that morphs into a pill on cursor-aware elements
 *
 * Mark any element with `data-cursor="view"` to trigger the morph cursor.
 *
 * All effects respect `prefers-reduced-motion`.
 */
import { motion, useReducedMotion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// <RevealText> — splits text by word and staggers each word's fade-up.
// Use as a drop-in replacement for the inner text of an <h1>/<h2>.
// ---------------------------------------------------------------------------
export function RevealText({ text, as = "span", className = "", delay = 0, stagger = 0.05 }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[as] || motion.span;
  if (reduce) return <MotionTag className={className}>{text}</MotionTag>;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        hidden: {},
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: "0.25em" }}
          variants={{
            hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
            visible: {
              opacity: 1, y: 0, filter: "blur(0px)",
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
}

// ---------------------------------------------------------------------------
// <ScrollReveal> — fade-up wrapper that triggers when the element enters view.
// ---------------------------------------------------------------------------
export function ScrollReveal({ children, className = "", delay = 0, y = 24, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// <MagneticButton> — wraps any clickable child; pulls subtly toward the cursor.
// ---------------------------------------------------------------------------
export function MagneticButton({ children, strength = 0.35, className = "", ...props }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y, display: "inline-block" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// <CustomCursor> — site-wide cursor that grows into a pill when hovering
// any element with [data-cursor="view"]. Falls back to native cursor on touch.
// Place once at App root.
// ---------------------------------------------------------------------------
export function CustomCursor() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [label, setLabel] = useState("View");
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });

  useEffect(() => {
    if (reduce) return;
    // Only enable on devices with a real pointer (skip touch).
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target.closest("[data-cursor]");
      if (target) {
        setHovered(true);
        setLabel(target.getAttribute("data-cursor-label") || target.getAttribute("data-cursor") || "View");
      } else {
        setHovered(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[100] pointer-events-none flex items-center justify-center font-semibold uppercase tracking-[0.18em]"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: hovered ? 96 : 10,
        height: hovered ? 96 : 10,
        backgroundColor: hovered ? "#D97757" : "rgba(217, 119, 87, 0.85)",
        color: "#FFFFFF",
        borderRadius: 999,
        fontSize: hovered ? 11 : 0,
        mixBlendMode: hovered ? "normal" : "difference",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {hovered ? label : null}
    </motion.div>
  );
}
