"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, useReducedMotion } from "motion/react";
import BrandIcon from "@/components/BrandIcon";
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
    "Python en la plataforma documental de Inetum y en mis agentes; Rust en Ommatix; TypeScript para infraestructura y frontends; Java para BFF empresariales.",
    "Agentes con Bedrock y Strands en Blend360; Claude y Gemini en CloudPath y TryTrust; servidores MCP propios en Ommatix.",
    "Extracción documental con OCR local y evidencia por campo en Inetum; retrieval con fuentes en el asistente RAG.",
    "APIs y workers con FastAPI, Celery y RabbitMQ sobre AMQPS; capas BFF con Spring Boot en Blend360.",
    "GitOps con Argo CD y Kustomize sobre OpenShift en Inetum; despliegues en AWS con CDK en Blend360, BioStock y Secret Oracle.",
    "Calidad verificable en WCT y en la plataforma documental: análisis estático a cero, escaneo de imágenes y secretos, y pruebas de mutación.",
  ] : [
    "Python in Inetum's document platform and in my agents; Rust in Ommatix; TypeScript for infrastructure and frontends; Java for enterprise BFFs.",
    "Agents with Bedrock and Strands at Blend360; Claude and Gemini in CloudPath and TryTrust; my own MCP servers in Ommatix.",
    "Document extraction with local OCR and per-field evidence at Inetum; retrieval with sources in the RAG assistant.",
    "APIs and workers with FastAPI, Celery and RabbitMQ over AMQPS; BFF layers with Spring Boot at Blend360.",
    "GitOps with Argo CD and Kustomize on OpenShift at Inetum; AWS deployments with CDK at Blend360, BioStock and Secret Oracle.",
    "Verifiable quality in WCT and in the document platform: zero static-analysis findings, image and secret scanning, and mutation testing.",
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
                    className="chip gap-1.5 transition-colors hover:border-cyan/40 hover:text-fg"
                  >
                    <BrandIcon name={item} size={12} />
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
