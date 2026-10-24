"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Plus, Trophy, GithubLogo, ArrowRight } from "@phosphor-icons/react";
import SectionHeading from "@/components/SectionHeading";
import AmbientBackground from "@/components/AmbientBackground";
import BorderGlow from "@/components/reactbits/BorderGlow";
import PortfolioIcon from "@/components/PortfolioIcon";
import BrandIcon from "@/components/BrandIcon";
import { useLang } from "@/components/providers/LanguageProvider";
import { GITHUB_URL, type Content } from "@/lib/content";
import type { ProjectCategory } from "@/lib/caseStudies";

const ACCENTS: Record<string, string> = { wct: "#b8a2f2", assistant: "#9be3d4", oracle: "#ebc692", rag: "#9ac2ed", biostock: "#9dd2b4", codeguard: "#b9b3f2" };

function ProjectDiagram({ project }: { project: Content["projects"]["items"][number] }) {
  return <div className={`case-art case-art--${project.id}`} aria-hidden="true">
    <span className="case-art-index">{project.category === "tooling" ? "DEVELOPER SYSTEMS" : project.category === "cloud" ? "CLOUD ARCHITECTURE" : "APPLIED INTELLIGENCE"}</span>
    <div className="case-art-orbits"><i /><i /><i /></div>
    <div className="case-flow">
      {project.flow.map((label, i) => <div className="case-flow-step" key={label}><div className="case-flow-node"><PortfolioIcon name={i === 0 ? "code" : i === 1 ? (project.category === "cloud" ? "cloud" : "ai") : "stack"} width={i === 1 ? 34 : 23} height={i === 1 ? 34 : 23} /></div><span>{label}</span></div>)}
      <svg className="case-flow-lines" viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M25 30H275" /><path className="case-flow-pulse" d="M25 30H275" /></svg>
    </div>
    <span className="case-art-signature">{project.id === "wct" ? "write. check. trust." : project.id === "assistant" ? "state → action → evidence" : project.id === "oracle" ? "a little mystery. a lot of engineering." : project.id === "rag" ? "every answer has a source." : project.id === "biostock" ? "infrastructure, as code." : "understand the code you ship."}</span>
  </div>;
}

export default function Projects() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const es = lang === "es";
  const filters = [{ id: "all", name: es ? "Todos" : "All" }, { id: "agents", name: es ? "IA & agentes" : "AI & agents" }, { id: "tooling", name: "Developer tools" }, { id: "cloud", name: "Cloud" }] as const;
  const projects = t.projects.items.filter(project => filter === "all" || project.category === filter);
  return <section id="proyectos" className="relative isolate overflow-hidden py-24 md:py-32">
    <AmbientBackground />
    <div className="relative mx-auto w-full max-w-6xl px-6">
      <div className="section-intro"><SectionHeading kickerKey="projects" title={es ? "Ideas, con código detrás." : "Ideas, backed by code."} /><p data-reveal className="section-description">{es ? "Una selección de sistemas que he construido y proyectos en los que he contribuido. Cada uno cuenta una decisión de ingeniería." : "A selection of systems I've built and projects I've contributed to. Each tells an engineering story."}</p></div>
      <div className="case-toolbar"><div className="case-filters" role="group" aria-label={es ? "Filtrar proyectos" : "Filter projects"}>{filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.name}<span>{item.id === "all" ? t.projects.items.length : t.projects.items.filter(p => p.category === item.id).length}</span></button>)}</div><span className="case-count" role="status">{String(projects.length).padStart(2, "0")} {es ? "proyectos" : "projects"}</span></div>
      <div className="case-grid">
        {projects.map(project => <BorderGlow className="case-card" key={project.id} style={{ "--case-accent": ACCENTS[project.id] } as CSSProperties}>
          <ProjectDiagram project={project} />
          <div className="case-copy">
            <div className="case-meta"><span>{project.status}</span><span>{project.year}</span></div>
            <h3>{project.name}</h3>
            <p className="case-headline">{project.headline}</p>
            {project.award && <p className="case-award"><Trophy size={15} aria-hidden />{project.award}</p>}
            <p className="case-description">{project.description}</p>
            <p className="case-proof"><ArrowRight size={15} aria-hidden />{project.proof}</p>
            <ul className="case-stack">{project.tech.map(tech => <li key={tech} className="brand-chip"><BrandIcon name={tech} size={12} />{tech}</li>)}</ul>
            <details className="case-details"><summary>{es ? "Decisiones y alcance" : "Decisions & scope"}<Plus size={17} aria-hidden /></summary><ul>{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul></details>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="case-source" aria-label={`${project.name} · ${t.projects.viewProject}`}><GithubLogo size={18} aria-hidden />{t.projects.viewProject}<ArrowUpRight size={17} aria-hidden /></a>
          </div>
        </BorderGlow>)}
      </div>
      <div className="case-archive"><p>{es ? "Más experimentos, herramientas y colaboración en mi GitHub." : "More experiments, tools and collaboration on my GitHub."}</p><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">{es ? "Explorar repositorios" : "Explore repositories"}<ArrowUpRight size={17} aria-hidden /></a></div>
    </div>
  </section>;
}
