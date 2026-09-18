"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowUp, ArrowUpRight, ArrowRight, Plus, ChatCircleDots, Check, MagnifyingGlass } from "@phosphor-icons/react";
import SectionHeading from "@/components/SectionHeading";
import DitherBackground from "@/components/DitherBackground";
import BorderGlow from "@/components/reactbits/BorderGlow";
import { useLang } from "@/components/providers/LanguageProvider";
import { profileSources, retrieveProfile, type ProfileSource } from "@/lib/retrieval";
import { scrollToId } from "@/lib/utils";

const LABELS = {
  es: {
    description: "Una trayectoria que conecta producto, inteligencia artificial e infraestructura.", title: "Encuentra lo que te interesa.",
    intro: "Consulta un proyecto, una tecnología o una parte de mi experiencia.", placeholder: "Prueba: RAG, Bedrock, calidad de código…", input: "Pregunta sobre mi experiencia", send: "Consultar perfil",
    found: "Referencias de mi trabajo", none: "Todavía no tengo un caso publicado sobre ese tema. Puedes explorar RAG, AWS, agentes o escribirme para hablarlo.",
    footer: "Busca en los casos de este portafolio. Tus consultas se quedan en tu navegador.", source: "Explorar sección", prompts: ["Agentes y RAG", "Cloud en producción", "Calidad de código"], queries: ["agentes RAG Bedrock", "cloud producción AWS CDK", "Write Check Trust"],
    contributions: "Ver aportes técnicos", evidence: "EN ESTA ETAPA", role: "RECORRIDO PROFESIONAL", query: "EXPLORADOR DEL PORTAFOLIO", clear: "Limpiar consulta",
  },
  en: {
    description: "A career connecting product, artificial intelligence and infrastructure.", title: "Find what interests you.",
    intro: "Look up a project, a technology or part of my experience.", placeholder: "Try: RAG, Bedrock, code quality…", input: "Ask about my experience", send: "Search profile",
    found: "References from my work", none: "I don't have a published case about that topic yet. Explore RAG, AWS or agents, or contact me to discuss it.",
    footer: "Searches the cases in this portfolio. Your queries stay in your browser.", source: "Explore section", prompts: ["Agents & RAG", "Cloud in production", "Code quality"], queries: ["agents RAG Bedrock", "cloud production AWS CDK", "Write Check Trust"],
    contributions: "View technical contributions", evidence: "IN THIS CHAPTER", role: "PROFESSIONAL JOURNEY", query: "PORTFOLIO EXPLORER", clear: "Clear search",
  },
};

function CareerStory() {
  const { t, lang } = useLang();
  const ui = LABELS[lang];
  const [selected, setSelected] = useState(0);
  const job = t.experience.jobs[selected];
  return <div className="journey-layout">
    <div className="journey-track" role="group" aria-label={ui.role}>
      {t.experience.jobs.map((entry, i) => <button key={i} type="button" aria-pressed={selected === i} aria-controls="career-chapter" className="journey-stop" onClick={() => setSelected(i)}>
        <span className="journey-node" aria-hidden>{String(3 - i).padStart(2, "0")}</span>
        <span className="journey-stop-copy"><small>{entry.period}</small><strong>{entry.company.replace(" S.A.S", "")}</strong><span>{entry.role.split(" · ")[0]}</span>{entry.current && <em>{lang === "es" ? "AHORA" : "NOW"}</em>}</span>
        <ArrowUpRight size={18} aria-hidden />
      </button>)}
      <p className="journey-track-note">{lang === "es" ? "Selecciona una etapa para conocer mi aporte." : "Select a chapter to explore my contribution."}</p>
    </div>
    <BorderGlow className="journey-chapter" id="career-chapter">
      {/* Responses render in their final readable state. No exit animation gates content. */}
      <div key={selected} className="chapter-content">
        <div className="chapter-eyebrow"><span>{ui.evidence}</span><span>{String(3 - selected).padStart(2, "0")} / 03</span></div>
        <h3>{job.headline}</h3>
        <p className="chapter-role">{job.role}<span> · {job.location}</span></p>
        <p className="chapter-summary">{job.summary}</p>
        <div className="chapter-impact"><Check size={20} aria-hidden /><strong>{job.impact}</strong></div>
        <ul className="chapter-stack" aria-label={lang === "es" ? "Tecnologías aplicadas" : "Applied technologies"}>{job.stack.map(item => <li key={item}>{item}</li>)}</ul>
        <details className="chapter-contributions"><summary>{ui.contributions}<span>{job.bullets.length}<Plus size={17} aria-hidden /></span></summary><ul>{job.bullets.map(text => <li key={text}>{text}</li>)}</ul></details>
      </div>
    </BorderGlow>
  </div>;
}

function ExperienceExplorer() {
  const { t, lang } = useLang();
  const ui = LABELS[lang];
  const sources = useMemo(() => profileSources(t), [t]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileSource[]>([]);
  const search = (text: string, display = text) => {
    if (!text.trim()) return;
    setQuery(display.trim()); setResults(retrieveProfile(text, sources));
  };
  const submit = (event: FormEvent) => { event.preventDefault(); search(input); };
  return <BorderGlow className="portfolio-explorer">
    <div className="explorer-intro"><span className="explorer-icon"><ChatCircleDots size={23} aria-hidden /></span><div><p>{ui.query}</p><h3>{ui.title}</h3><span>{ui.intro}</span></div></div>
    <div className="explorer-controls">
      <form onSubmit={submit} className="career-form" role="search">
        <label htmlFor="career-query" className="sr-only">{ui.input}</label>
        <MagnifyingGlass size={19} aria-hidden className="shrink-0 text-muted" />
        <input ref={inputRef} id="career-query" value={input} onChange={e => setInput(e.target.value)} placeholder={ui.placeholder} maxLength={240} autoComplete="off" aria-controls="career-results" />
        <button type="submit" disabled={!input.trim()} aria-label={ui.send}><ArrowUp size={20} weight="bold" aria-hidden /></button>
      </form>
      <div className="career-prompts" role="group" aria-label={ui.title}>{ui.prompts.map((prompt, i) => <button key={prompt} type="button" onClick={() => { setInput(prompt); search(ui.queries[i], prompt); }}>{prompt}<ArrowUpRight size={12} aria-hidden /></button>)}</div>
    </div>
    <div id="career-results" className="explorer-results" aria-live="polite" aria-atomic="true">
      {query && <div className="explorer-answer" key={query}>
        <div className="explorer-answer-header"><p>{ui.found}<span>{query}</span></p><button type="button" onClick={() => { inputRef.current?.focus({ preventScroll: true }); setQuery(""); setResults([]); setInput(""); }}>{ui.clear}</button></div>
        {results.length ? <div className="explorer-result-grid">{results.map((result, i) => <article key={result.id}>
          <span className="explorer-result-number">0{i + 1}</span><h4>{result.title}</h4><p className="explorer-result-meta">{result.meta}</p>
          {result.passages.map(passage => <p key={passage}>{passage}</p>)}
          <a href={result.href} onClick={event => { event.preventDefault(); scrollToId(result.href); }}>{ui.source}<ArrowRight size={14} aria-hidden /></a>
        </article>)}</div> : <p className="career-empty">{ui.none}</p>}
      </div>}
    </div>
    <p className="explorer-privacy">{ui.footer}</p>
  </BorderGlow>;
}

export default function Experience() {
  const { t, lang } = useLang();
  return <section id="experiencia" className="relative isolate overflow-hidden py-24 md:py-32">
    <DitherBackground />
    <div className="relative mx-auto w-full max-w-6xl px-6">
      <div className="section-intro"><SectionHeading kickerKey="experience" title={t.experience.title} /><p className="section-description" data-reveal>{LABELS[lang].description}</p></div>
      <CareerStory />
      <ExperienceExplorer key={lang} />
    </div>
  </section>;
}
