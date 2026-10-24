"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useIdleComponent } from "@/lib/warmup.mjs";

const loadDither = () => import("@/components/reactbits/Dither");

export default function DitherBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    const visibility = () => setTabVisible(!document.hidden);
    sync(); visibility();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  // Loaded and mounted in idle periods after load so the WebGL context is not created mid-scroll; drawing stays visible-only.
  const near = useInView(ref, { margin: "200px", once: true });
  const Dither = useIdleComponent(loadDither, { enabled: !reduce, now: near });
  return <div ref={ref} className="experience-dither" aria-hidden="true">
    {Dither && !reduce && <Dither disableAnimation={!tabVisible} waveColor={[.24, .38, .55]} backgroundColor={[.015, .02, .035]} waveSpeed={.035} waveFrequency={3} waveAmplitude={.3} colorNum={5} pixelSize={3} enableMouseInteraction mouseRadius={.35} />}
  </div>;
}
