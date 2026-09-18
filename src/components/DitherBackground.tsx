"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";

const Dither = dynamic(() => import("@/components/reactbits/Dither"), { ssr: false });

export default function DitherBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useInView(ref, { margin: "200px", once: true });
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
  return <div ref={ref} className="experience-dither" aria-hidden="true">
    {ready && !reduce && <Dither disableAnimation={!tabVisible} waveColor={[.24, .38, .55]} backgroundColor={[.015, .02, .035]} waveSpeed={.035} waveFrequency={3} waveAmplitude={.3} colorNum={5} pixelSize={3} enableMouseInteraction mouseRadius={.35} />}
  </div>;
}
