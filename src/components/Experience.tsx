"use client";

import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

export default function Experience() {
  const { t } = useLang();

  return (
    <section id="experiencia" className="relative bg-panel/40 py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="experience" title={t.experience.title} />

        <ol className="relative space-y-14 border-l border-white/10 pl-8 md:pl-12">
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
