"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Experience() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const traceRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  // Trace timeline: la línea de la carrera se "traza" con el scroll, como una
  // traza distribuida; el pulso viaja por la línea y se apaga al final
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const fill = fillRef.current;
      const pulse = pulseRef.current;
      if (!fill || !pulse) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: traceRef.current,
          start: "top 72%",
          end: "bottom 58%",
          scrub: 0.6,
        },
      });
      tl.set(pulse, { opacity: 1 }, 0);
      tl.to(fill, { scaleY: 1, ease: "none", duration: 1 }, 0);
      tl.fromTo(pulse, { top: "2px" }, { top: "calc(100% - 11px)", ease: "none", duration: 1 }, 0);
      tl.to(pulse, { opacity: 0, duration: 0.08 }, 0.92);
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="experiencia" className="relative bg-panel/40 py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="experience" title={t.experience.title} />

        <ol ref={traceRef} className="relative space-y-14 pl-8 md:pl-12">
          {/* Línea base + trazado progresivo + pulso viajero */}
          <div aria-hidden className="absolute left-0 top-1 h-[calc(100%-8px)] w-px bg-white/10" />
          <div
            aria-hidden
            ref={fillRef}
            className="absolute left-0 top-1 h-[calc(100%-8px)] w-px origin-top scale-y-0 bg-gradient-to-b from-cyan via-blue-400 to-violet will-change-transform"
          />
          <div
            aria-hidden
            ref={pulseRef}
            className="absolute left-0 top-px size-2 -translate-x-[3.5px] rounded-full bg-cyan opacity-0 shadow-[0_0_14px_3px_rgba(34,211,238,0.55)]"
          />

          {t.experience.jobs.map((job) => (
            <li key={`${job.company}-${job.period}`} data-reveal className="relative">
              {/* Marcador */}
              <span
                className={`absolute -left-8 top-2 grid size-[13px] -translate-x-1/2 place-items-center rounded-full md:-left-12 ${
                  job.current ? "bg-cyan animate-pulse-dot" : "bg-gradient-to-br from-cyan to-violet opacity-80"
                }`}
              />

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{job.role}</h3>
                {job.current && (
                  <span className="rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-cyan uppercase">
                    now
                  </span>
                )}
              </div>

              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wide text-muted">
                <span className="text-sm font-semibold tracking-normal text-cyan">{job.company}</span>
                <span aria-hidden>·</span>
                <span>{job.period}</span>
                <span aria-hidden>·</span>
                <span>{job.location}</span>
              </p>

              <ul className="mt-5 space-y-2.5">
                {job.bullets.map((b) => (
                  <li key={b.slice(0, 40)} className="flex gap-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-violet/70" />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
