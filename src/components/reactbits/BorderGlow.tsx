"use client";

// Adapted from React Bits' BorderGlow by David Haz (MIT + Commons Clause).
// Directional edge light, with native focus feedback and no idle animation loop.
import { useRef, type HTMLAttributes, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";

export default function BorderGlow({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    const edge = Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)));
    ref.current.style.setProperty("--cursor-angle", `${Math.atan2(dy, dx) * 180 / Math.PI + 90}deg`);
    ref.current.style.setProperty("--edge-opacity", `${0.25 + edge * 0.75}`);
    ref.current.style.setProperty("--pointer-x", `${x}px`);
    ref.current.style.setProperty("--pointer-y", `${y}px`);
  };

  return (
    <div {...props} ref={ref} onPointerMove={onMove} className={`border-glow ${className}`}>
      <span className="border-glow-edge" aria-hidden="true" />
      {children}
    </div>
  );
}
