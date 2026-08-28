"use client";

import { ArrowUpRight, LockSimple, Trophy } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import DecryptedText from "@/components/reactbits/DecryptedText";
import { useLang } from "@/components/providers/LanguageProvider";

export default function Projects() {
  const { t } = useLang();
  const reduce = useReducedMotion() ?? false;

  return (
    <section id="proyectos" className="relative py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="projects" title={t.projects.title} />

        <div className="grid gap-5 md:grid-cols-3">
          {t.projects.items.map((p) => {
            const link: string | null = p.link ?? null;
            const card = (
              <>
                {/* Pipeline: scan de luz al hover, como un deploy progresando */}
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden rounded-t-[inherit]">
                  <span className="block h-px w-1/3 -translate-x-[110%] bg-gradient-to-r from-transparent via-cyan to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[340%]" />
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">{p.year}</span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="text-muted opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan group-hover:opacity-100"
                  />
                </div>

                {p.award && (
                  <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] tracking-wide text-amber-200">
                    <Trophy size={11} weight="fill" aria-hidden />
                    {p.award}
                  </span>
                )}

                <h3 className="mt-4 font-display text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-cyan sm:text-[22px]">
                  {reduce ? (
                    p.name
                  ) : (
                    <DecryptedText
                      text={p.name}
                      animateOn="hover"
                      speed={24}
                      maxIterations={7}
                      characters="!<>-_\\/[]{}=+*^?#"
                      encryptedClassName="text-cyan/50"
                    />
                  )}
                </h3>
                <p className="mt-2.5 grow text-sm leading-relaxed text-muted">{p.description}</p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {p.tech.map((tech) => (
                    <li key={tech} className="chip !px-2 !py-0.5 !text-[10px]">
                      {tech}
                    </li>
                  ))}
                </ul>
              </>
            );

            return link ? (
              <a
                key={p.name}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.name} · ${t.projects.viewProject}`}
                data-reveal
                className="panel-card group relative flex flex-col p-6"
              >
                {card}
              </a>
            ) : (
              <article key={p.name} data-reveal className="panel-card group relative flex flex-col p-6">
                {card}
              </article>
            );
          })}
        </div>

        {/* Nota enterprise (NDA) */}
        <p
          data-reveal
          className="mt-8 flex items-start gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-5 py-4 text-[13px] leading-relaxed text-muted"
        >
          <LockSimple size={15} aria-hidden className="mt-0.5 shrink-0" />
          {t.projects.enterpriseNote}
        </p>
      </div>
    </section>
  );
}
