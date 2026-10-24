"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/lib/utils";
import type { JourneyApi } from "@/components/hero/journeyScene";
import "./hero/journey.css";

const LABELS = {
  es: {
    route: "Trayecto", waypoints: ["Idea", "Sistema", "En marcha"],
    systemKicker: "02 · El sistema", systemTitle: "Contexto, agentes y producción alrededor de un mismo núcleo.",
    runKicker: "03 · En marcha", runText: "Trazas, evaluación y control en cada pieza: así llega a producción y se puede operar cada día.",
    planets: [["Contexto", "RAG · memoria"], ["Agentes", "Bedrock · MCP"], ["Producción", "AWS · LLMOps"]], core: "Orquestación",
    play: "Reproducir el viaje", pause: "Pausar el viaje", motion: "Movimiento",
  },
  en: {
    route: "Route", waypoints: ["Idea", "System", "Running"],
    systemKicker: "02 · The system", systemTitle: "Context, agents and production around one core.",
    runKicker: "03 · Running", runText: "Traces, evaluation and control in every piece: that is how it reaches production and stays operable.",
    planets: [["Context", "RAG · memory"], ["Agents", "Bedrock · MCP"], ["Production", "AWS · LLMOps"]], core: "Orchestration",
    play: "Play the journey", pause: "Pause the journey", motion: "Motion",
  },
};
const PLANET_COLORS = ["#9ff3f0", "#c8b8ff", "#ffd9a8"];
const noopSubscribe = () => () => {};

export default function Hero() {
  const { t, lang } = useLang();
  const ui = t.hero;
  const copy = LABELS[lang];
  const section = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const planetLabels = useRef<(HTMLDivElement | null)[]>([]);
  const coreLabel = useRef<HTMLDivElement>(null);
  const api = useRef<JourneyApi | null>(null);
  const reducePreference = useReducedMotion();
  // The server HTML knows no motion preference: the first client render matches it, then the preference applies.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduce = hydrated && !!reducePreference;
  const visible = useInView(stageRef);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<number | null>(null);
  const [act, setAct] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const introOpacity = useTransform(scrollYProgress, [0, 0.16, 0.27], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.27], [0, -70]);
  const systemOpacity = useTransform(scrollYProgress, [0.3, 0.38, 0.58, 0.65], [0, 1, 1, 0]);
  const systemY = useTransform(scrollYProgress, [0.3, 0.65], [36, -36]);
  const runOpacity = useTransform(scrollYProgress, [0.66, 0.73, 0.9, 0.97], [0, 1, 1, 0]);
  const runY = useTransform(scrollYProgress, [0.66, 0.97], [36, -24]);
  const nebulaScale = useTransform(scrollYProgress, [0, 1], [1, 1.32]);
  const nebulaOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [0.62, 0.5, 0.12]);
  const exitOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);
  const railFill = useTransform(scrollYProgress, [0, 0.95], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", value => {
    api.current?.setProgress(value);
    const next = value < 0.29 ? 0 : value < 0.655 ? 1 : 2;
    setAct(current => (current === next ? current : next));
  });

  useEffect(() => {
    const sync = () => setTabVisible(!document.hidden);
    sync(); document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // The scene loads after hydration, in its own chunk with three.js; the headline never waits for it.
  useEffect(() => {
    if (!hydrated || !canvas.current || !stageRef.current) return;
    let cancelled = false;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    import("@/components/hero/journeyScene").then(({ createJourney }) => {
      if (cancelled || !canvas.current || !stageRef.current) return;
      api.current = createJourney({
        canvas: canvas.current, host: stageRef.current, labels: planetLabels.current, coreLabel: coreLabel.current,
        narrow, reduced: reduce, onReady: () => setReady(true),
      });
      api.current?.setProgress(reduce ? 0.6 : scrollYProgress.get());
    });
    return () => { cancelled = true; api.current?.dispose(); api.current = null; setReady(false); };
  }, [hydrated, reduce, scrollYProgress]);

  const playing = !paused && !reduce && visible && tabVisible;
  useEffect(() => { api.current?.setPlaying(playing); }, [playing, ready]);
  useEffect(() => { api.current?.setStage(stage); }, [stage, ready]);

  useEffect(() => {
    if (reduce || !visible) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      api.current?.setPointer(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, visible]);

  const motionLabel = paused ? copy.play : copy.pause;
  // With reduced motion the stage is not pinned and the system panel stays visible next to the headline.
  const systemInert = !reduce && act !== 1;

  return <section id="inicio" ref={section} className="journey" data-ready={ready || undefined} data-act={act} aria-label={ui.lines.join(" ")}>
    <div className="journey-stage" ref={stageRef}>
      <motion.div className="journey-nebula" style={reduce ? undefined : { scale: nebulaScale, opacity: nebulaOpacity }} aria-hidden="true" />
      <canvas ref={canvas} className="journey-canvas" aria-hidden="true" />
      <div className="journey-shade" aria-hidden="true" />
      <div className="journey-labels" aria-hidden="true">
        {copy.planets.map(([name, detail], i) => (
          <div key={name} ref={node => { planetLabels.current[i] = node; }} className="journey-label" data-active={stage === i || undefined} style={{ "--label": PLANET_COLORS[i] } as React.CSSProperties}>
            <span>{name}<small>{detail}</small></span>
          </div>
        ))}
        <div ref={coreLabel} className="journey-label journey-label--core"><span>{copy.core}</span></div>
      </div>

      <motion.div className="journey-act journey-act--intro" style={reduce ? undefined : { opacity: introOpacity, y: introY }}>
        <p className="signal-eyebrow"><span />JUAN ANDRADE <span className="signal-eyebrow-divider">/</span> SENIOR AI ENGINEER</p>
        <h1 className="signal-title"><span className="journey-line" data-on={act === 0 || undefined}>{ui.lines[0]}</span><br /><span className="journey-line">{ui.lines[1]}</span><br /><span className="journey-line journey-line--accent">{ui.lines[2]}</span></h1>
        <p className="signal-description">{ui.intro}</p>
        <div className="signal-actions">
          <a href="#proyectos" className="btn-primary" onClick={e => { e.preventDefault(); scrollToId("#proyectos"); }}>{ui.work}<ArrowDown size={17} aria-hidden /></a>
          <a href="#contacto" className="signal-contact" onClick={e => { e.preventDefault(); scrollToId("#contacto"); }}>{ui.contact}<ArrowUpRight size={17} aria-hidden /></a>
        </div>
        <div className="signal-proof">{ui.proof.map((text, i) => <span key={text}><small>0{i + 1}</small>{text}</span>)}</div>
      </motion.div>

      <motion.div className="journey-act journey-act--system" style={reduce ? undefined : { opacity: systemOpacity, y: systemY }} inert={systemInert} aria-hidden={systemInert || undefined}>
        <p className="journey-kicker">{copy.systemKicker}</p>
        <p className="journey-act-title">{copy.systemTitle}</p>
        <div className="signal-stages" role="group" aria-label={ui.caption}>
          {ui.stages.map((label, i) => <button key={label} type="button" aria-pressed={stage === i} onClick={() => setStage(current => (current === i ? null : i))}><span>0{i + 1}</span>{label}</button>)}
        </div>
        <p className="signal-stage-detail" aria-live="polite">{stage === null ? ui.hint : ui.details[stage]}</p>
      </motion.div>

      <motion.div className="journey-act journey-act--run" style={reduce ? undefined : { opacity: runOpacity, y: runY }} inert={!reduce && act !== 2} aria-hidden={(!reduce && act !== 2) || undefined}>
        <p className="journey-kicker">{copy.runKicker}</p>
        <p className="journey-run-title">{ui.caption}</p>
        <p className="journey-run-text">{copy.runText}</p>
        <a href="#perfil" className="journey-next" onClick={e => { e.preventDefault(); scrollToId("#perfil"); }}>{ui.scroll}<ArrowDown size={15} aria-hidden /></a>
      </motion.div>

      <div className="journey-rail" aria-hidden="true">
        <motion.span className="journey-rail-fill" style={reduce ? undefined : { scaleY: railFill }} />
        {copy.waypoints.map((label, i) => <span key={label} className="journey-waypoint" data-on={act >= i || undefined} style={{ top: `${i * 50}%` }}><i />{label}</span>)}
      </div>

      <div className="journey-meta">
        <span aria-hidden="true">{copy.route} 01 <b>·</b> {copy.waypoints.join(" → ")}</span>
        {(!hydrated || !reduce) && <button type="button" onClick={() => setPaused(value => !value)} aria-label={motionLabel} aria-pressed={paused}>{paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}{copy.motion}</button>}
      </div>

      <motion.div className="signal-bottom journey-bottom" style={reduce ? undefined : { opacity: introOpacity }}>
        <span><i />{ui.current}</span><span className="signal-location">{ui.place}</span>
        <a href="#perfil" onClick={e => { e.preventDefault(); scrollToId("#perfil"); }}>{ui.scroll}<ArrowDown size={14} aria-hidden /></a>
      </motion.div>
      <motion.div className="journey-exit" style={reduce ? undefined : { opacity: exitOpacity }} aria-hidden="true" />
    </div>
  </section>;
}
