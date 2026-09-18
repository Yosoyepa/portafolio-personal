"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import type { CardBounds } from "@/components/LightBeam";

const LaserFlow = dynamic(() => import("@/components/reactbits/LaserFlow"), { ssr: false });

export default function ProfileLaser({ cardBounds }: { cardBounds: CardBounds | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useInView(ref, { margin: "200px", once: true });
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return <div ref={ref} className="profile-laser" aria-hidden="true" style={{ "--laser-landing": `${(1 - (cardBounds?.top ?? 0.5)) * 100}%` } as CSSProperties}>
    {cardBounds && <div className="profile-laser-rest" style={{
      left: `${(cardBounds.left + cardBounds.right) * 50}%`,
      height: `${(1 - cardBounds.top) * 100}%`,
    }} />}
    {ready && !reduce && cardBounds && <LaserFlow
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
