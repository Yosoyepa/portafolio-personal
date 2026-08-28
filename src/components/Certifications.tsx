"use client";

import { useRef, useState, useCallback } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

/**
 * Carrusel de credenciales. Las certificaciones con arte oficial usan su badge;
 * el resto lleva un sello monograma en el mismo lenguaje visual. Scroll-snap
 * manual (sin auto-avance), accesible por teclado y con barra de progreso.
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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = t.certs.groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.name })));

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const delta = (card ? card.offsetWidth : 240) + 20;
    el.scrollBy({ left: dir * delta, behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

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
                role="listitem"
                data-reveal
                className="panel-card group w-[236px] shrink-0 snap-start p-5 sm:w-[252px]"
              >
                {/* Marco: badge oficial o sello monograma */}
                <div className="relative mx-auto grid aspect-square w-36 place-items-center">
                  {visual?.img ? (
                    <>
                      <div className="absolute inset-0 rounded-full bg-cyan/[0.06] blur-xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-60" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={visual.img}
                        alt=""
                        loading="lazy"
                        className="relative size-full rounded-lg object-contain shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </>
                  ) : (
                    <div className="relative grid size-full place-items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
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
