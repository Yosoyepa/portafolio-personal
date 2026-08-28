"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/lib/utils";

const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const TextType = dynamic(() => import("@/components/reactbits/TextType"), { ssr: false });
import SpotlightReveal from "@/components/SpotlightReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  // Intro GSAP + parallax del canvas (useGSAP: cleanup automático y scope)
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 });
      tl.fromTo(
        ".hero-word",
        { yPercent: 118 },
        { yPercent: 0, duration: 1.15, stagger: 0.09 },
      ).fromTo(
        ".hero-fade",
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09 },
        "-=0.65",
      );

      if (canvasWrapRef.current) {
        gsap.to(canvasWrapRef.current, {
          yPercent: 16,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: sectionRef },
  );

  const words = [t.hero.firstName, t.hero.lastName];

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
    >
      {/* Fondo: constelación revelada por cursor → esfera 3D */}
      <div ref={canvasWrapRef} className="absolute inset-0 overflow-hidden">
        <SpotlightReveal />
        <ParticleField />
      </div>
      <div className="pointer-events-none absolute -left-40 top-1/4 size-[480px] rounded-full bg-cyan/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[520px] rounded-full bg-violet/10 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28">
        <p className="hero-fade mb-6 flex items-center gap-2.5 font-mono text-xs tracking-[0.22em] text-muted uppercase">
          <span className="size-2 rounded-full bg-cyan animate-pulse-dot" />
          {t.hero.kicker}
        </p>

        <h1 className="font-display text-[clamp(3.4rem,10vw,7.5rem)] leading-[0.93] font-extrabold tracking-tight">
          <span className="block overflow-hidden pb-1">
            <span className="hero-word block">{words[0]}</span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="hero-word text-gradient block">{words[1]}</span>
          </span>
        </h1>

        <div className="hero-fade mt-7 flex h-7 items-center font-mono text-sm text-cyan sm:text-base">
          <span className="mr-2 select-none text-violet">▸</span>
          {reduce ? (
            t.hero.roles[0]
          ) : (
            <TextType
              text={t.hero.roles}
              as="span"
              typingSpeed={42}
              deletingSpeed={26}
              pauseDuration={1900}
              initialDelay={900}
              cursorCharacter="▌"
              cursorClassName="text-violet"
            />
          )}
        </div>

        <p className="hero-fade mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {t.hero.tagline}
        </p>

        <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
          <button onClick={() => scrollToId("#proyectos")} className="btn-primary active:scale-[0.98]">
            {t.hero.ctaPrimary}
            <ArrowDown size={15} weight="bold" aria-hidden />
          </button>
          <button onClick={() => scrollToId("#contacto")} className="btn-ghost active:scale-[0.98]">
            {t.hero.ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
}
