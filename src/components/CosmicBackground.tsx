"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import dynamic from "next/dynamic";

const Galaxy = dynamic(() => import("@/components/reactbits/Galaxy"), { ssr: false });

export default function CosmicBackground() {
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const playing = !paused && !reduce;

  return (
    <>
      <div className="cosmic-native-fallback" aria-hidden="true" />
      <div className="cosmic-galaxy" aria-hidden="true">
        <Galaxy vortex density={1.2} glowIntensity={0.18} saturation={0.2}
          hueShift={210} speed={0.35} starSpeed={0.15} rotationSpeed={0.025}
          twinkleIntensity={0.35} repulsionStrength={0.5} disableAnimation={!playing}
          mouseInteraction={!reduce} transparent={false} />
      </div>
      <div className="cosmic-vignette" aria-hidden="true" />
      {!reduce && (
        <button type="button" className="cosmic-playback" onClick={() => {
          setPaused(value => !value);
        }}
          aria-label={lang === "es" ? (playing ? "Pausar fondo animado" : "Reproducir fondo animado") : (playing ? "Pause animated background" : "Play animated background")}>
          {playing ? <Pause size={13} aria-hidden /> : <Play size={13} aria-hidden />}
          <span>{lang === "es" ? "Movimiento" : "Motion"}</span>
        </button>
      )}
    </>
  );
}
