"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Certificate, Keyboard } from "@phosphor-icons/react";
import SectionHeading from "@/components/SectionHeading";
import AmbientBackground from "@/components/AmbientBackground";
import AccordionGallery from "@/components/reactbits/AccordionGallery";
import { useLang } from "@/components/providers/LanguageProvider";

const BADGES = ["/certs/aws-data-engineer.png", "/certs/aws-ai-practitioner.png", "/certs/aws-cloud-practitioner.png"];
const MONOGRAMS = [["DE", "AI", "CP", "EA"], ["AI", "ML", "λ", "IR"], ["UN", "A", "IBM", "DS4A"]];
const ACCENTS = ["#ac8cff", "#63dce5", "#f3be85", "#94baff"];
const LABELS = {
  es: {
    categories: ["AWS Certified", "AWS Demonstrated", "Formación & partners"],
    description: "Aprendizaje continuo. Conocimiento puesto a prueba.",
    hint: "Selecciona una credencial para explorarla",
    keyboard: "Navega también con las flechas del teclado",
    count: "credenciales",
    short: [["Data Engineer", "AI Practitioner", "Cloud Practitioner", "Early Adopter"], ["Agentic AI", "MLOps", "Serverless", "Incident Response"], ["Arquitectura", "Claude + Bedrock", "Data Science", "DS4A"]],
  },
  en: {
    categories: ["AWS Certified", "AWS Demonstrated", "Education & partners"],
    description: "Always learning. Knowledge put to the test.",
    hint: "Select a credential to explore it",
    keyboard: "You can also navigate with the arrow keys",
    count: "credentials",
    short: [["Data Engineer", "AI Practitioner", "Cloud Practitioner", "Early Adopter"], ["Agentic AI", "MLOps", "Serverless", "Incident Response"], ["Architecture", "Claude + Bedrock", "Data Science", "DS4A"]],
  },
};

export default function Certifications() {
  const { t, lang } = useLang();
  const [group, setGroup] = useState(0);
  const reduce = useReducedMotion();
  const ui = LABELS[lang];
  const total = t.certs.groups.reduce((sum, entry) => sum + entry.items.length, 0);

  return (
    <section id="certificaciones" className="relative isolate overflow-hidden py-24 md:py-32">
      <AmbientBackground variant="aurora" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="section-intro">
          <SectionHeading kickerKey="certs" title={t.certs.title} />
          <p data-reveal className="section-description">{ui.description}</p>
        </div>
        <div className="credential-toolbar" data-reveal>
          <div className="segmented-control" role="group" aria-label={t.certs.title}>
            {ui.categories.map((name, i) => (
              <button key={name} type="button" aria-pressed={group === i} onClick={() => setGroup(i)}>
                {group === i && <motion.span className="segment-indicator" layoutId="cert-category" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }} />}
                <span className="relative">{name} <span className="segment-count">{t.certs.groups[i].items.length}</span></span>
              </button>
            ))}
          </div>
          <span className="credential-total"><Certificate size={17} aria-hidden="true" />{total} {ui.count}</span>
        </div>
        <AccordionGallery key={group} label={t.certs.groups[group].name} items={t.certs.groups[group].items.map((item, i) => ({
          title: item.name,
          subtitle: item.issuer,
          date: item.date,
          shortTitle: ui.short[group][i],
          accent: ACCENTS[i],
          visual: group === 0 && BADGES[i]
            ? <img src={BADGES[i]} alt="" width={240} height={240} loading="lazy" className="credential-badge" />
            : <div className="credential-monogram"><span>{MONOGRAMS[group][i]}</span><small>{group === 1 ? "DEMONSTRATED" : group === 0 ? "EARLY ADOPTER" : item.issuer}</small></div>,
        }))} />
        <div className="credential-footer">
          <span>{ui.hint}</span>
          <span className="hidden items-center gap-2 sm:flex"><Keyboard size={16} aria-hidden="true" />{ui.keyboard}</span>
        </div>
        {group === 2 && <p className="credential-study-note">{lang === "es" ? "El diplomado reúne formación en Ingeniería de Software Basada en la Nube, Arquitectura de Software a Gran Escala y Calidad de Software (abril–junio de 2026)." : "The diploma brings together Cloud-Based Software Engineering, Large-Scale Software Architecture and Software Quality (April–June 2026)."}</p>}
      </div>
    </section>
  );
}
