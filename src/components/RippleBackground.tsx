"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useIdleComponent } from "@/lib/warmup.mjs";
const loadRippleGrid = () => import("@/components/reactbits/RippleGrid");

export default function RippleBackground({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  // Loaded and mounted in idle periods after load so the WebGL context is not created mid-scroll; drawing stays visible-only.
  // Mounted once: the loop already sleeps off screen, and remounting rebuilt the context on every return.
  const near = useInView(ref, { margin: "200px", once: true });
  const RippleGrid = useIdleComponent(loadRippleGrid, { enabled: !reduce, now: near });
  return <div ref={ref} aria-hidden="true" className={`ripple-background ${compact ? "ripple-background--compact" : ""}`}>
    {RippleGrid && !reduce && <RippleGrid gridColor="#65cfe8" gridSize={compact ? 7 : 12} gridThickness={18} rippleIntensity={.035} opacity={.45} glowIntensity={.12} gridRotation={-12} mouseInteraction mouseInteractionRadius={.8} />}
  </div>;
}
