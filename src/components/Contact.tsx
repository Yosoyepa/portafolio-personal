"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";

const ShapeGrid = dynamic(() => import("@/components/ShapeGrid"), { ssr: false });

export default function Contact() {
  const { t } = useLang();
  // Fondo decorativo animado: solo con movimiento permitido
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    setAllowMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section id="contacto" className="relative overflow-hidden bg-panel/40 py-28 md:py-36">
      {/* Rejilla interactiva: celdas que se encienden con el cursor antes del CTA */}
      {allowMotion && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 45%, black 30%, transparent 74%)",
            maskImage: "radial-gradient(ellipse 90% 80% at 50% 45%, black 30%, transparent 74%)",
          }}
        >
          <ShapeGrid
            direction="diagonal"
            speed={0.5}
            squareSize={44}
            borderColor="#1c2947"
            hoverFillColor="#0b2f44"
            hoverTrailAmount={6}
          />
        </div>
      )}
      <div className="pointer-events-none absolute left-1/2 top-0 size-[560px] -translate-x-1/2 rounded-full bg-violet/[0.07] blur-[140px]" />

      <div className="relative mx-auto w-full max-w-3xl px-6 text-center">
        <SectionHeading kickerKey="contact" title={t.contact.title} centered />

        <p data-reveal className="-mt-6 text-base leading-relaxed text-muted sm:text-lg">
          {t.contact.text}
        </p>

        <p data-reveal className="mt-4 flex items-center justify-center gap-2 font-mono text-xs tracking-wide text-muted">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          {t.contact.availability}
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {/* TODO: el email es un placeholder — edítalo en src/lib/content.ts */}
          <a href={`mailto:${EMAIL}`} className="btn-primary active:scale-[0.98]">
            <EnvelopeSimple size={16} weight="fill" aria-hidden />
            {t.contact.emailLabel}
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost active:scale-[0.98]">
            <GithubLogo size={17} weight="fill" aria-hidden />
            GitHub
          </a>
          {/* TODO: reemplaza LINKEDIN_URL en src/lib/content.ts con tu usuario real */}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost active:scale-[0.98]">
            <LinkedinLogo size={16} weight="fill" aria-hidden />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
