"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
const RippleGrid = dynamic(() => import("@/components/reactbits/RippleGrid"), { ssr: false });

export default function RippleBackground({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "200px" });
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return <div ref={ref} aria-hidden="true" className={`ripple-background ${compact ? "ripple-background--compact" : ""}`}>
    {visible && !reduce && <RippleGrid gridColor="#65cfe8" gridSize={compact ? 7 : 12} gridThickness={18} rippleIntensity={.035} opacity={.45} glowIntensity={.12} gridRotation={-12} mouseInteraction mouseInteractionRadius={.8} />}
  </div>;
}
