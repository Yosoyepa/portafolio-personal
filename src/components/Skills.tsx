"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Skills() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);

  // Los chips entran en cascada tipo flujo cuando el grupo llega al viewport
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-skill-group]").forEach((card) => {
        const chips = card.querySelectorAll<HTMLElement>("[data-skill-chip]");
        if (!chips.length) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });
        tl.fromTo(card, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" });
        tl.fromTo(
          chips,
          { y: 8, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.045, ease: "power2.out" },
          "-=0.2",
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="stack" className="relative bg-panel/40 py-28 md:py-36">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading kickerKey="skills" title={t.skills.title} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.skills.groups.map((g, i) => (
            <div key={g.name} data-skill-group className="panel-card p-6">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
