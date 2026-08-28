"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/providers/LanguageProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Metrics() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ref.current?.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count ?? "0");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = String(target);
          return;
        }
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          snap: { v: 1 },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(state.v));
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="border-b border-white/[0.06] bg-panel/50">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4">
        {t.metrics.items.map((m) => (
          <div key={m.label} data-reveal className="text-center">
            <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span data-count={m.value}>0</span>
              <span className="text-cyan">{m.suffix}</span>
            </p>
            <p className="mx-auto mt-2.5 max-w-[180px] text-xs leading-relaxed tracking-wide text-muted uppercase">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
