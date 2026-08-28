"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

/**
 * Capa "constelación oculta": keywords del stack repartidas por el fondo del
 * hero que solo se revelan donde pasa el cursor (linterna = glow + máscara
 * radial con inercia de spring). Sin re-renders: Motion values → estilo.
 * En táctil / reduced-motion se muestra un rastro estático muy tenue.
 */

const ITEMS: { label: string; x: number; y: number; wide?: boolean }[] = [
  { label: "AMAZON BEDROCK", x: 76, y: 20 },
  { label: "STRANDS AGENTS", x: 88, y: 33, wide: true },
  { label: "OPENSEARCH", x: 62, y: 30 },
  { label: "KINESIS", x: 71, y: 45 },
  { label: "AWS CDK", x: 85, y: 55 },
  { label: "LAMBDA", x: 67, y: 63 },
  { label: "DYNAMODB", x: 91, y: 70, wide: true },
  { label: "ECS FARGATE", x: 58, y: 78 },
  { label: "RAG · LLMOps", x: 78, y: 88 },
];

const CODE = `$ npx cdk deploy genai-stack
> agent.invoke(prompt) // streaming`;

export default function SpotlightReveal() {
  const layerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; top: number } | null>(null);
  const [fine, setFine] = useState(false);

  const mx = useMotionValue(-1200);
  const my = useMotionValue(-1200);
  // Inercia suave: la linterna "persigue" al cursor
  const sx = useSpring(mx, { stiffness: 220, damping: 32, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 220, damping: 32, mass: 0.6 });

  const mask = useMotionTemplate`radial-gradient(circle 320px at ${sx}px ${sy}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 48%, transparent 74%)`;
  const glow = useMotionTemplate`radial-gradient(circle 260px at ${sx}px ${sy}px, rgba(34,211,238,0.10) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)`;

  // Solo en punteros finos (mouse/trackpad) y sin movimiento reducido
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Cachear posición de la capa; recalcular en resize/scroll (0 lecturas por frame de animación)
  useEffect(() => {
    if (!fine) return;
    const cache = () => {
      const el = layerRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        rectRef.current = { left: r.left, top: r.top };
      }
    };
    cache();
    const onMove = (e: PointerEvent) => {
      const r = rectRef.current;
      if (!r) return;
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    };
    const ro = new ResizeObserver(cache);
    if (layerRef.current) ro.observe(layerRef.current);
    window.addEventListener("scroll", cache, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", cache);
      window.removeEventListener("pointermove", onMove);
    };
  }, [fine, mx, my]);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Rastro base siempre presente, casi imperceptible */}
      <div className="absolute inset-0 opacity-[0.05]">
        <Content />
      </div>

      {/* Linterna: glow suave que sigue al cursor */}
      {fine && <motion.div className="absolute inset-0" style={{ backgroundImage: glow }} />}

      {/* Capa revelada por el cursor */}
      {fine && (
        <motion.div
          className="absolute inset-0"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          <Content bright />
        </motion.div>
      )}
    </div>
  );
}

function Content({ bright = false }: { bright?: boolean }) {
  return (
    <>
      {ITEMS.map((it) => (
        <span
          key={it.label}
          className={`absolute whitespace-nowrap font-mono text-[11px] tracking-[0.22em] ${
            bright ? "text-white/90" : "text-white/75"
          } ${it.wide ? "hidden xl:block" : "hidden md:block"}`}
          style={{ left: `${it.x}%`, top: `${it.y}%` }}
        >
          {it.label}
        </span>
      ))}
      <pre
        className={`absolute bottom-[16%] left-[4%] hidden font-mono text-[11px] leading-relaxed md:block ${
          bright ? "text-cyan/90" : "text-cyan/70"
        }`}
      >
        {CODE}
      </pre>
    </>
  );
}
