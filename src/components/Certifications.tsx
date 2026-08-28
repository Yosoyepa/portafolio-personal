"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

/**
 * Carrusel de credenciales estilo "placas edge-lit": las cards son placas
 * oscuras; la card centrada se levanta, se inclina hacia el centro y enciende
 * su borde azul mientras las laterales se atenúan. Scroll-snap manual,
 * accesible por teclado y con barra de progreso.
 */

type Seal = { label: string; accent: string; sub?: string };

const VISUALS: Record<string, { img?: string; seal?: Seal }> = {
  // AWS · base (arte oficial de badges de AWS)
  "AWS Certified Data Engineer Associate": { img: "/certs/aws-data-engineer.png" },
  "AWS Certified AI Practitioner + Early Adopter": { img: "/certs/aws-ai-practitioner.png" },
  "AWS Certified Cloud Practitioner": { img: "/certs/aws-cloud-practitioner.png" },
  // AWS · microcredenciales (sello monograma, naranja AWS)
  "Agentic AI Demonstrated": { seal: { label: "AI", accent: "#ff9900", sub: "DEMONSTRATED" } },
  "MLOps Demonstrated": { seal: { label: "ML", accent: "#ff9900", sub: "DEMONSTRATED" } },
  "Serverless Demonstrated": { seal: { label: "λ", accent: "#ff9900", sub: "DEMONSTRATED" } },
  "Incident Response Demonstrated": { seal: { label: "IR", accent: "#ff9900", sub: "DEMONSTRATED" } },
  // Académicas & vendor
  "Diplomado en Arquitectura y Calidad de Software": { seal: { label: "UN", accent: "#c9a86a" } },
  "Software Architecture & Quality Diploma": { seal: { label: "UN", accent: "#c9a86a" } },
  "Claude with Amazon Bedrock": { seal: { label: "✦", accent: "#d97757" } },
  "Applied Data Science with Python - Level 2": { seal: { label: "IBM", accent: "#0f62fe" } },
  "DS4A · Fundamentos en Analítica de Datos": { seal: { label: "DS4A", accent: "#12a594" } },
  "DS4A · Data Analytics Fundamentals": { seal: { label: "DS4A", accent: "#12a594" } },
};

export default function Certifications() {
  const { t } = useLang();
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const dimRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number>(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = t.certs.groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.name })));

  // Coverflow: exactamente UNA card (la más cercana al centro) está encendida,
  // levantada e inclinada; las demás se atenúan según su distancia. El rol de
  // protagonista pasa a la siguiente a mitad de camino del scroll.
  const updateCoverflow = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const center = el.getBoundingClientRect().left + el.clientWidth / 2;
    const span = el.clientWidth * 0.7;

    const metrics = cardRefs.current.map((card) => {
      if (!card) return null;
      const r = card.getBoundingClientRect();
      const offset = Math.max(-1.25, Math.min(1.25, (r.left + r.width / 2 - center) / span));
      return { offset, abs: Math.abs(offset) };
    });

    let nearest = -1;
    let nearestAbs = Infinity;
    metrics.forEach((m, i) => {
      if (m && m.abs < nearestAbs) {
        nearestAbs = m.abs;
        nearest = i;
      }
    });

    metrics.forEach((m, i) => {
      const card = cardRefs.current[i];
      if (!card || !m) return;
      const isHero = i === nearest;
      const glow = isHero ? 1 : 0;
      card.style.transform = `perspective(950px) rotateY(${m.offset * -7}deg) scale(${1 - Math.min(m.abs, 1) * 0.055}) translateY(${-7 * glow}px)`;
      card.style.boxShadow = isHero
        ? "0 0 0 1px rgba(56,189,248,0.55), 0 0 36px -4px rgba(56,189,248,0.6), 0 18px 44px -18px rgba(0,0,0,0.85)"
        : "";
      card.style.borderColor = isHero ? "rgba(56,189,248,0.5)" : "";
      const dim = dimRefs.current[i];
      if (dim) dim.style.opacity = isHero ? "0" : String(Math.min(m.abs * 0.75, 0.55));
    });
  }, []);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateCoverflow);
  }, [updateCoverflow]);

  useEffect(() => {
    if (reduce) return;
    updateCoverflow();
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, updateCoverflow, scheduleUpdate]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.firstElementChild as HTMLElement | null;
      const delta = (card ? card.offsetWidth : 240) + 20;
      el.scrollBy({ left: dir * delta, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    if (!reduce) scheduleUpdate();
  }, [reduce, scheduleUpdate]);

  return (
    <section id="certificaciones" className="relative py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading kickerKey="certs" title={t.certs.title} />
          <div className="mb-14 hidden shrink-0 gap-2.5 md:mb-16 md:flex">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label={t.certs.prevLabel}
              className="grid size-10 place-items-center rounded-full border border-white/12 text-muted transition-colors hover:border-cyan/50 hover:text-cyan disabled:pointer-events-none disabled:opacity-30"
            >
              <CaretLeft size={15} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label={t.certs.nextLabel}
              className="grid size-10 place-items-center rounded-full border border-white/12 text-muted transition-colors hover:border-cyan/50 hover:text-cyan disabled:pointer-events-none disabled:opacity-30"
            >
              <CaretRight size={15} weight="bold" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label={t.certs.title}
        >
          {items.map((c, i) => {
            const visual = VISUALS[c.name];
            return (
              <article
                key={c.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                role="listitem"
                data-reveal
                className="panel-card group relative w-[240px] shrink-0 snap-start rounded-[20px] p-5 transition-[box-shadow,border-color] duration-500 will-change-transform sm:w-[258px]"
              >
                {/* Placa: interior más profundo + filo de vidrio superior */}
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.04] to-transparent" />
                <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                {/* Marco del badge: blanco para el arte oficial, placa oscura para sellos */}
                <div className="relative mx-auto aspect-square w-36">
                  {visual?.img ? (
                    <div className="grid size-full place-items-center rounded-xl bg-[#eef1f7] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-500 group-hover:scale-[1.03]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={visual.img} alt="" loading="lazy" className="size-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative grid size-full place-items-center overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a0f1d]">
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-50"
                        style={{ background: `radial-gradient(75% 65% at 50% 28%, ${visual?.seal?.accent ?? "#22d3ee"}26, transparent 70%)` }}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-x-5 top-0 h-px opacity-50"
                        style={{ background: `linear-gradient(to right, transparent, ${visual?.seal?.accent ?? "#22d3ee"}99, transparent)` }}
                      />
                      <span
                        className="relative font-display text-4xl font-extrabold tracking-tight"
                        style={{ color: visual?.seal?.accent ?? "#22d3ee" }}
                      >
                        {visual?.seal?.label}
                      </span>
                      {visual?.seal?.sub && (
                        <span className="relative mt-1.5 font-mono text-[8.5px] tracking-[0.3em] text-muted">
                          {visual.seal.sub}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80">{c.group}</p>
                <h3 className="mt-1.5 text-sm leading-snug font-medium">{c.name}</h3>
                <p className="mt-2 font-mono text-[11px] text-muted">
                  {c.issuer} · {c.date}
                </p>

                {/* Atenuado de cards laterales (controlado por el coverflow) */}
                <div
                  aria-hidden
                  ref={(el) => {
                    dimRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[#04060c]"
                  style={{ opacity: 0 }}
                />
              </article>
            );
          })}
        </div>

        {/* Progreso del carrusel */}
        <div className="mx-6 mt-4 h-0.5 overflow-hidden rounded-full bg-white/[0.07] md:mx-0">
          <div ref={fillRef} className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-violet" />
        </div>
      </div>
    </section>
  );
}
