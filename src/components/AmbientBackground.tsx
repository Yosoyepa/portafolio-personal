"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

/** CSS gradients and vector orbits; motion pauses outside the viewport. */
export default function AmbientBackground({ variant = "orbit" }: { variant?: "orbit" | "mesh" | "aurora" }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "120px" });
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const sync = () => setTabVisible(!document.hidden);
    sync(); document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return (
    <div ref={ref} className={`ambient ambient--${variant} ${visible && tabVisible ? "is-visible" : ""}`} aria-hidden="true">
      <div className="ambient-wash ambient-wash--one" />
      <div className="ambient-wash ambient-wash--two" />
      <div className="ambient-grid" />
      <div className="ambient-stars" />
      {[0, 1].map(copy => <svg key={copy} className={`ambient-streams ambient-streams--${copy}`} viewBox="0 0 1200 720" fill="none">
        {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M-180 ${180 + i * 22} C180 ${-80 + i * 34} 500 ${770 - i * 25} 790 ${260 + i * 20} S1140 ${170 + i * 22} 1380 ${-30 + i * 40}`} />)}
        <circle cx="790" cy="300" r="3" fill="currentColor" />
        <circle cx="232" cy="223" r="2" fill="currentColor" />
      </svg>)}
      {variant === "orbit" && (
        <svg className="ambient-orbits" viewBox="0 0 1000 700" fill="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx="640" cy="350" rx={210 + i * 42} ry={105 + i * 28} transform="rotate(-28 640 350)" />
          ))}
          <circle cx="862" cy="225" r="4" fill="currentColor" />
          <circle cx="335" cy="438" r="3" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}
