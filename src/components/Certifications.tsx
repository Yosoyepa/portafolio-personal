"use client";

import { Check } from "@phosphor-icons/react";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

export default function Certifications() {
  const { t } = useLang();

  return (
    <section id="certificaciones" className="relative py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="certs" title={t.certs.title} />

        <div className="grid gap-5 lg:grid-cols-3">
          {t.certs.groups.map((g) => (
            <div key={g.name} data-reveal className="panel-card flex flex-col p-6 hover:!border-violet/35">
              <h3 className="font-display text-[15px] font-bold tracking-tight">
                {g.name}
              </h3>
              <div className="mt-3 h-px w-10 bg-gradient-to-r from-cyan/60 to-transparent" />
              <ul className="mt-5 space-y-4">
                {g.items.map((c) => (
                  <li key={c.name} className="flex gap-3">
                    <Check size={15} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-cyan" />
                    <div>
                      <p className="text-sm leading-snug font-medium">{c.name}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {c.issuer} · {c.date}
                      </p>
                    </div>
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
