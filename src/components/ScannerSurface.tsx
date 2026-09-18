"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";

const Scanner = dynamic(() => import("@/components/reactbits/Scanner"), { ssr: false });

/** One small core pass and one lazy contact pass, each suspended when out of view. */
export default function ScannerSurface({ variant, playing = true }: {
  variant: "core" | "contact"; playing?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useInView(ref, { margin: "180px", once: true });
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const core = variant === "core";
  return <div ref={ref} className={`scanner-surface scanner-surface--${variant}`} aria-hidden="true">
    {ready && reduce === false && <Scanner
      color1={core ? "#153854" : "#21335b"}
      color2={core ? "#4caade" : "#8c80da"}
      color3={core ? "#b7faff" : "#9de6ed"}
      speed={core ? .3 : .22} sweepSpeed={.2} sweepWidth={core ? 1.5 : 1.8}
      sweepFalloff={core ? 2.5 : 4} scale={core ? 1.1 : 1.6}
      frequency={1.5} ripple={core ? .3 : .38} bandDensity={core ? 6 : 9}
      lineSharpness={3} glow={.28} scanDirection="diagonal" colorSpread={.35}
      brightness={core ? 1.5 : 1.1} contrast={1.1} softness={1.8}
      vignette={core ? .25 : .4} scanline={false} grain={false}
      opacity={core ? .95 : .8} mouseInteraction={!core && playing}
      mouseRadius={.65} mouseStrength={.35} disableAnimation={!playing}
      maxDpr={core ? 1.5 : .85} maxPixels={core ? 50000 : 750000} fps={24}
    />}
  </div>;
}
