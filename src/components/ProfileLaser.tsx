"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView } from "motion/react";
import type { CardBounds } from "@/components/LightBeam";
import { useIdleComponent } from "@/lib/warmup.mjs";

const loadLaserFlow = () => import("@/components/reactbits/LaserFlow");

export default function ProfileLaser({ cardBounds }: { cardBounds: CardBounds | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  // three.js evaluation and its context cost 80–180 ms each: both happen in idle periods after load, first in line,
  // rather than as the section scrolls in. The render loop still only runs while the beam is visible.
  const near = useInView(ref, { margin: "200px", once: true });
  const LaserFlow = useIdleComponent(loadLaserFlow, { enabled: !reduce, now: near, first: true });

  return <div ref={ref} className="profile-laser" aria-hidden="true" style={{ "--laser-landing": `${(1 - (cardBounds?.top ?? 0.5)) * 100}%` } as CSSProperties}>
    {cardBounds && <div className="profile-laser-rest" style={{
      left: `${(cardBounds.left + cardBounds.right) * 50}%`,
      height: `${(1 - cardBounds.top) * 100}%`,
    }} />}
    {LaserFlow && !reduce && cardBounds && <LaserFlow
      color="#91DBFF" backgroundColor="#05060b" dpr={0.85}
      horizontalBeamOffset={(cardBounds.left + cardBounds.right) / 2 - 0.5}
      verticalBeamOffset={cardBounds.top - 0.5}
      horizontalSizing={(cardBounds.right - cardBounds.left) * 1.35}
      spillWidth={cardBounds.right - cardBounds.left}
      spillHeight={cardBounds.top - cardBounds.bottom}
      verticalSizing={2} wispDensity={1.1} wispSpeed={12}
      wispIntensity={3} flowSpeed={0.3} fogIntensity={0.35}
      mouseTiltStrength={0.035} mouseSmoothTime={0.15}
    />}
  </div>;
}
