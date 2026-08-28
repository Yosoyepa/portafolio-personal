"use client";

import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

export default function Skills() {
  const { t } = useLang();

  return (
    <section id="stack" className="relative bg-panel/40 py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="skills" title={t.skills.title} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.skills.groups.map((g, i) => (
            <div key={g.name} data-reveal className="panel-card p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-violet">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-base font-bold tracking-tight">{g.name}</h3>
                <span className="ml-auto h-px flex-1 bg-gradient-to-r from-cyan/30 to-transparent" />
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {g.items.map((item) => (
                  <li key={item} className="chip transition-colors hover:border-cyan/40 hover:text-fg">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
