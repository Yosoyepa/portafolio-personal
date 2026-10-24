"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll, useTransform, motion } from "motion/react";
import { useLang } from "@/components/providers/LanguageProvider";
import type { CardBounds } from "@/components/LightBeam";
import ProfileLaser from "@/components/ProfileLaser";
import { ArrowUpRight } from "@phosphor-icons/react";
import { scrollToId } from "@/lib/utils";

export default function About() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [cardBounds, setCardBounds] = useState<CardBounds | null>(null);
  const reduce = useReducedMotion();

  // Parallax del texto ghost, ligado al progreso de scroll de la sección
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const ghostX = useTransform(scrollYProgress, [0, 1], ["4%", "-6%"]);

  // Mide la posición y dimensiones relativas exactas de las cards dentro de la sección
  useEffect(() => {
    const updateBounds = () => {
      if (!sectionRef.current || !cardsContainerRef.current) return;
      const sec = sectionRef.current.getBoundingClientRect();
      const cards = cardsContainerRef.current.getBoundingClientRect();
      if (sec.width === 0 || sec.height === 0) return;

      const next = {
        left: Math.max(0, (cards.left - sec.left) / sec.width),
        right: Math.min(1, (cards.right - sec.left) / sec.width),
        top: Math.min(1, 1.0 - (cards.top - sec.top) / sec.height),
        bottom: Math.max(0, 1.0 - (cards.bottom - sec.top) / sec.height),
      };
      setCardBounds(previous => previous &&
        Math.abs(previous.left - next.left) < .0001 &&
        Math.abs(previous.right - next.right) < .0001 &&
        Math.abs(previous.top - next.top) < .0001 &&
        Math.abs(previous.bottom - next.bottom) < .0001 ? previous : next);
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    // Card coordinates are relative to this section: page scrolling does not change them.

    const ro = new ResizeObserver(updateBounds);
    if (cardsContainerRef.current) ro.observe(cardsContainerRef.current);
    if (sectionRef.current) ro.observe(sectionRef.current);

    return () => {
      window.removeEventListener("resize", updateBounds);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="perfil" className="relative overflow-hidden pb-24 pt-36 md:pb-32 md:pt-44">
      {/* Haz de luz celestial volumétrico abrazando el contenedor de tarjetas */}
      <ProfileLaser cardBounds={cardBounds} />

      {/* Watermark PERFIL. El wrapper conserva el centrado de Tailwind;
          motion reescribe `transform`, así que el parallax vive en el span interno. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 select-none"
      >
        <motion.span
          style={reduce ? undefined : { x: ghostX }}
          className="block about-ghost font-display text-[clamp(6rem,18vw,16rem)] font-black tracking-wider leading-none text-white/[0.03]"
        >
          {t.about.ghost}
        </motion.span>
      </span>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1.25fr] lg:gap-14 items-start">
          {/* Columna Izquierda: Encabezado + Narrativa + Educación */}
          <div data-reveal className="space-y-6">
            <div>
              <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">{t.about.kicker}</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.65rem] md:leading-[1.12] text-white">
                {t.about.title}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-cyan via-blue-400 to-violet" />
            </div>

            <div className="space-y-5 text-[15px] leading-relaxed text-muted sm:text-base">
              {t.about.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-fg font-normal" : "text-[#9da8c7]"}>
                  {p}
                </p>
              ))}
            </div>

            {/* Educación */}
            <div className="pt-2">
              <div className="border-l-2 border-cyan/70 pl-5">
                <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                  {t.about.education.period} · {t.about.education.note}
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-white">{t.about.education.degree}</p>
                <p className="mt-0.5 text-sm text-[#9da8c7]">{t.about.education.school}</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Contenedor de 6 Cards que la cascada cobija al aterrizar */}
          <div
            ref={cardsContainerRef}
            className="profile-cascade-card relative mt-10 rounded-2xl p-2.5 sm:p-3.5 lg:mt-24 xl:mt-28 bg-[#080c1a]/55 border border-cyan-400/20 backdrop-blur-[6px] shadow-[0_0_60px_-15px_rgba(34,211,238,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]"
          >
            <div className="laser-spill" aria-hidden="true"><span /></div>
            {/* Velo: la base de luz cubre el top y continua bajando por los bordes laterales */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, rgba(165,243,252,0.10), transparent 34%), linear-gradient(to bottom, rgba(165,243,252,0.10), transparent 34%), radial-gradient(150% 70% at 50% -8%, rgba(147,197,253,0.17), transparent 55%), linear-gradient(to bottom, rgba(165,243,252,0.13), rgba(103,232,249,0.05) 16%, rgba(56,189,248,0.025) 34%, transparent 52%)",
                backgroundSize: "10px 100%, 10px 100%, 100% 100%, 100% 100%",
                backgroundPosition: "left top, right top, center, center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {t.about.highlights.map((h, i) => (
                <a
                  key={h.title}
                  href="#stack"
                  onClick={event => { event.preventDefault(); scrollToId("#stack"); }}
                  data-reveal
                  className="profile-capability relative rounded-xl p-4 sm:p-4.5 bg-[#0b1022]/90 border border-white/[0.08] hover:border-cyan-400/40 hover:bg-[#0f1730]/95 flex flex-col justify-start shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex shrink-0 items-center justify-center font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_8px_-2px_rgba(34,211,238,0.45)]">
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-[14.5px] sm:text-[15px] font-bold text-white tracking-tight leading-snug">
                      {h.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-[12.5px] sm:text-[13px] leading-relaxed text-[#c0cbe2] profile-capability-desc transition-colors">
                    {h.desc}
                  </p>
                  <span className="capability-explore">{lang === "es" ? "Explorar stack" : "Explore stack"}<ArrowUpRight size={13} aria-hidden /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
