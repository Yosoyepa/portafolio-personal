"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, stagger, useInView, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/lib/utils";
import SignalField from "@/components/SignalField";
import DataRain, { type DataRainPalette } from "@/components/ui/data-rain";
import "./hero-rain.css";

const RAIN_PALETTE: DataRainPalette = { calm: "#4fd1e8", mid: "#8b7cf6", hot: "#e9a8ff" };
// Measured budget: stroke rasterisation scales with device pixels (Retina 1440 × 900 fell to ~10 fps at 4.5 MP).
const RAIN_MAX_DPR = 1.5;
const RAIN_MAX_PIXELS = 1.4e6;
const RAIN_NARROW_COUNT = 800; // below 768 px; keeps ~60 fps with a 4× CPU throttle
const noopSubscribe = () => () => {};

export default function Hero() {
  const { t, lang } = useLang();
  const ui = t.hero;
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // The server HTML knows no motion preference: the first client render matches it, then the preference applies.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const visible = useInView(section);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState(1);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const sync = () => setTabVisible(!document.hidden);
    sync(); document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const playing = !paused && reduce === false && visible && tabVisible;
  useEffect(() => {
    if (reduce !== false) return;
    const nodes = section.current?.querySelectorAll<HTMLElement>(".signal-enter");
    if (!nodes?.length) return;
    const entrance = animate(nodes, { y: [22, 0], opacity: [0, 1] }, {
      duration: 0.8,
      delay: stagger(0.09),
      ease: [0.22, 1, 0.36, 1],
    });
    return () => entrance.stop();
  }, [reduce]);

  return <section id="inicio" ref={section} className="signal-hero">
    <DataRain fullscreen={false} paused={!playing} className="hero-data-rain" palette={RAIN_PALETTE}
      maxDpr={RAIN_MAX_DPR} maxPixels={RAIN_MAX_PIXELS} count={narrow ? RAIN_NARROW_COUNT : undefined} />
    <div className="hero-nebula" aria-hidden="true" />
    <div className="signal-layout">
      <div className="signal-copy">
        <p className="signal-eyebrow signal-enter"><span />JUAN ANDRADE <span className="signal-eyebrow-divider">/</span> SENIOR AI ENGINEER</p>
        <h1 className="signal-title signal-enter">{ui.lines[0]}<br />{ui.lines[1]}<br /><span>{ui.lines[2]}</span></h1>
        <p className="signal-description signal-enter">{ui.intro}</p>
        <div className="signal-actions signal-enter">
          <a href="#proyectos" className="btn-primary" onClick={e => { e.preventDefault(); scrollToId("#proyectos"); }}>{ui.work}<ArrowDown size={17} aria-hidden /></a>
          <a href="#contacto" className="signal-contact" onClick={e => { e.preventDefault(); scrollToId("#contacto"); }}>{ui.contact}<ArrowUpRight size={17} aria-hidden /></a>
        </div>
        <div className="signal-proof signal-enter">{ui.proof.map((text, i) => <span key={text}><small>0{i + 1}</small>{text}</span>)}</div>
      </div>
      <div className="signal-art">
        <div className="signal-art-header"><span>{lang === "es" ? "UNA CONSTELACIÓN, UN SISTEMA" : "ONE CONSTELLATION, ONE SYSTEM"}</span><span aria-hidden>FIG. 01</span></div>
        <SignalField playing={playing} interactive={reduce === false} stage={stage} english={lang === "en"} />
        <div className="signal-art-caption">
          <p>{ui.caption}</p>
          <div className="signal-stages" role="group" aria-label={ui.caption}>
            {ui.stages.map((label, i) => <button key={label} type="button" aria-pressed={stage === i} onClick={() => setStage(i)}><span>0{i + 1}</span>{label}</button>)}
          </div>
          <p className="signal-stage-detail" aria-live="polite">{ui.details[stage]}</p>
        </div>
        <div className="signal-art-footer"><span>{ui.hint}</span>{(!hydrated || !reduce) && <button type="button" onClick={() => setPaused(v => !v)} aria-label={lang === "es" ? (paused ? "Reproducir fondo animado" : "Pausar fondo animado") : (paused ? "Play animated background" : "Pause animated background")}>{paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}{lang === "es" ? "Movimiento" : "Motion"}</button>}</div>
      </div>
    </div>
    <div className="signal-bottom"><span><i />{ui.current}</span><span className="signal-location">{ui.place}</span><a href="#perfil" onClick={e => { e.preventDefault(); scrollToId("#perfil"); }}>{ui.scroll}<ArrowDown size={14} aria-hidden /></a></div>
  </section>;
}
