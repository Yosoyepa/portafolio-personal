"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useLang } from "@/components/providers/LanguageProvider";

export default function Metrics() {
  const { t, lang } = useLang();
  const format = useMemo(() => new Intl.NumberFormat(lang === "es" ? "es-CO" : "en-US").format, [lang]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px", once: true });
  const reduce = useReducedMotion();

  // Los contadores se crean solo cuando la franja entra en pantalla;
  // nada de trabajo de animación durante la carga inicial.
  useEffect(() => {
    if (!inView) return;
    const counters = ref.current?.querySelectorAll<HTMLElement>("[data-count]");
    if (!counters?.length) return;
    if (reduce) {
      counters.forEach((el) => { el.textContent = format(Number(el.dataset.count ?? "0")); });
      return;
    }
    const running = Array.from(counters).map((el) =>
      animate(0, Number(el.dataset.count ?? "0"), {
        duration: 1.6,
        ease: [0.33, 1, 0.68, 1],
        onUpdate: (v) => { el.textContent = format(Math.round(v)); },
      }),
    );
    return () => running.forEach((controls) => controls.stop());
  }, [inView, reduce, format]);

  return (
    <div ref={ref} className="relative isolate overflow-hidden border-b border-white/[0.06] bg-panel/50">
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4">
        {t.metrics.items.map((m) => (
          <div key={m.value} data-reveal className="text-center">
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
