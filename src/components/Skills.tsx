"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, useReducedMotion } from "motion/react";
import PortfolioIcon, { type PortfolioIconName } from "@/components/PortfolioIcon";
import BorderGlow from "@/components/reactbits/BorderGlow";
import RippleBackground from "@/components/RippleBackground";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";
import { ArrowUpRight } from "@phosphor-icons/react";
import { scrollToId } from "@/lib/utils";

export default function Skills() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const applications = lang === "es" ? [
    "Python para agentes y automatización; TypeScript para infraestructura; Java para BFF empresariales.",
    "Orquestación y tool use en Blend360. Workflows controlados en Personal Assistant.",
    "Retrieval con fuentes en el asistente RAG. Datos persistentes y evaluación de respuestas.",
    "APIs de CodeGuardAI y Personal Assistant. Eventos, validación y persistencia.",
    "Despliegues empresariales en Blend360 y stacks reproducibles en BioStock y Secret Oracle.",
    "Calidad verificable en WCT; observabilidad, CI/CD y control de costes en plataformas AWS.",
  ] : [
    "Python for agents and automation; TypeScript for infrastructure; Java for enterprise BFFs.",
    "Orchestration and tool use at Blend360. Controlled workflows in Personal Assistant.",
    "Retrieval with sources in the RAG assistant. Persistent data and answer evaluation.",
    "CodeGuardAI and Personal Assistant APIs. Events, validation and persistence.",
    "Enterprise deployments at Blend360 and reproducible stacks in BioStock and Secret Oracle.",
    "Verifiable quality in WCT; observability, CI/CD and cost control in AWS platforms.",
  ];
  const icons: PortfolioIconName[] = ["code", "ai", "data", "stack", "cloud", "journey"];
  const sectionRef = useRef<HTMLElement>(null);

  // Los chips entran en cascada tipo flujo cuando cada grupo llega al viewport;
  // los observadores se montan de una vez y el coste en carga inicial es cero.
  useEffect(() => {
    if (reduce) return;
    const groups = sectionRef.current?.querySelectorAll<HTMLElement>("[data-skill-group]");
    if (!groups?.length) return;
    const running: ReturnType<typeof animate>[] = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const card = entry.target as HTMLElement;
        const chips = card.querySelectorAll<HTMLElement>("[data-skill-chip]");
        running.push(
          animate(card, { y: [24, 0], opacity: [0, 1] }, { duration: 0.55, ease: [0.22, 1, 0.36, 1] }),
          animate(chips, { y: [8, 0], opacity: [0, 1] }, {
            duration: 0.35,
            delay: stagger(0.045, { startDelay: 0.35 }),
            ease: "easeOut",
          }),
        );
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    groups.forEach((group) => observer.observe(group));
    return () => { observer.disconnect(); running.forEach((controls) => controls.stop()); };
  }, [reduce]);

  return (
    <section ref={sectionRef} id="stack" className="relative isolate overflow-hidden py-24 md:py-32">
      <RippleBackground />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="skills" title={t.skills.title} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.skills.groups.map((g, i) => { const icon = icons[i]; return (
            <BorderGlow key={icon} data-skill-group className="skill-card">
              <span className="skill-card-icon"><PortfolioIcon name={icon} width={28} height={28} /></span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-violet">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-base font-bold tracking-tight">{g.name}</h3>
                <span className="ml-auto h-px flex-1 bg-gradient-to-r from-cyan/30 to-transparent" />
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {g.items.map((item) => (
                  <li
                    key={item}
                    data-skill-chip
                    className="chip transition-colors hover:border-cyan/40 hover:text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="skill-application">{applications[i]}<br /><a href={i === 0 || i === 4 ? "#experiencia" : "#proyectos"} onClick={event => { event.preventDefault(); scrollToId(i === 0 || i === 4 ? "#experiencia" : "#proyectos"); }}>{lang === "es" ? "Ver en contexto" : "See in context"}<ArrowUpRight size={13} aria-hidden /></a></p>
            </BorderGlow>
          ); })}
        </div>
      </div>
    </section>
  );
}
