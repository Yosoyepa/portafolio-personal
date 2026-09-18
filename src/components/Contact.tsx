"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, ArrowLeft, ArrowBendDownRight, Copy, Check, EnvelopeSimple, GithubLogo, LinkedinLogo, Pause, Play } from "@phosphor-icons/react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/content";
import SectionHeading from "@/components/SectionHeading";
import { useLang } from "@/components/providers/LanguageProvider";
import ProfileCard from "@/components/reactbits/ProfileCard";
import AmbientBackground from "@/components/AmbientBackground";
import ScannerSurface from "@/components/ScannerSurface";

export default function Contact() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const hasTurned = useRef(false);
  const visible = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const es = lang === "es";
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopyState("copied"); }
    catch { setCopyState("error"); }
  };
  useEffect(() => {
    if (copyState === "idle") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 6000);
    return () => clearTimeout(timeout);
  }, [copyState]);
  useLayoutEffect(() => {
    if (!hasTurned.current) return;
    if (flipped) back.current?.focus({ preventScroll: true });
    else front.current?.querySelector<HTMLButtonElement>(".pc-contact-btn")?.focus({ preventScroll: true });
  }, [flipped]);
  const flip = () => { hasTurned.current = true; setFlipped(value => !value); };

  return <section id="contacto" className="relative isolate overflow-hidden bg-panel/30 py-28 md:py-36">
    <AmbientBackground variant="aurora" />
    <ScannerSurface variant="contact" playing={!scannerPaused} />
    <div className="contact-layout relative mx-auto max-w-6xl px-6">
      <div className="contact-story">
        <SectionHeading kickerKey="contact" title={t.contact.title} />
        <p data-reveal className="-mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{t.contact.text}</p>
        <div className="contact-topics" data-reveal><span>{es ? "IA aplicada" : "Applied AI"}</span><span>Cloud & backend</span><span>{es ? "Colaboración técnica" : "Technical collaboration"}</span></div>
        <p data-reveal className="mt-7 flex items-start gap-3 text-sm text-muted"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-300" />{t.contact.availability}</p>
        <a href={`mailto:${EMAIL}`} className="contact-direct" data-reveal><EnvelopeSimple size={20} aria-hidden /><span>{EMAIL.split("@")[0]}@<wbr />{EMAIL.split("@")[1]}</span><ArrowUpRight size={17} aria-hidden /></a>
        <div className="contact-copy-row">
          <button type="button" onClick={copyEmail} className="contact-copy-button">{copyState === "copied" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{es ? "Copiar correo" : "Copy email"}</button>
          <span role="status" className="contact-copy-status">{copyState === "copied" ? (es ? "Correo copiado" : "Email copied") : copyState === "error" ? (es ? "Selecciona el correo para copiarlo." : "Select the email to copy it.") : ""}</span>
        </div>
        <p className="contact-invitation" data-reveal>{es ? "Dale la vuelta. Conectemos." : "Turn it over. Let's connect."}<ArrowBendDownRight size={28} weight="light" aria-hidden /></p>
      </div>
      <div ref={ref} className={`contact-profile ${visible && !reduce && !flipped ? "is-animated" : ""}`} onKeyDown={event => { if (event.key === "Escape" && flipped) { event.preventDefault(); flip(); } }}>
        <div className="contact-flipper" data-flipped={flipped}>
          <div ref={front} className="contact-face contact-face--front" inert={flipped} aria-hidden={flipped}>
            <ProfileCard name="Juan Andrade" title="Senior AI Engineer" handle="Yosoyepa" status="Colombia · UTC−5" contactText={es ? "Contactarme ↗" : "Contact me ↗"} contactAriaLabel={es ? "Girar tarjeta y ver canales de contacto" : "Flip card to see contact channels"} onContactClick={flip} contactExpanded={flipped} contactControls="contact-card-channels" avatarUrl="/assets/juan-portrait.webp" miniAvatarUrl="/assets/juan-portrait-square.webp" iconUrl="/assets/orbital-pattern.svg" enableTilt={visible && !reduce && !flipped} enableMobileTilt={false} behindGlowColor="rgba(97, 215, 237, 0.3)" behindGlowSize="65%" innerGradient="linear-gradient(150deg, #172d3c 0%, #161c32 48%, #282342 100%)" />
          </div>
          <div id="contact-card-channels" className="contact-face contact-face--back" inert={!flipped} aria-hidden={!flipped}>
            <button ref={back} type="button" onClick={flip} className="contact-back-button"><ArrowLeft size={16} aria-hidden />{es ? "Volver a la tarjeta" : "Back to the card"}</button>
            <div className="contact-back-heading"><span className="contact-back-monogram" aria-hidden>JA</span><p>{es ? "SIGAMOS LA CONVERSACIÓN" : "LET'S KEEP TALKING"}</p><h3>{es ? "Elige tu canal." : "Choose your channel."}</h3><span>Juan Andrade · Senior AI Engineer</span></div>
            <div className="contact-channels">
              <a href={`mailto:${EMAIL}`}><EnvelopeSimple size={24} aria-hidden /><span><strong>Email</strong><small>{es ? "Cuéntame qué estás construyendo" : "Tell me what you're building"}</small></span><ArrowUpRight size={18} aria-hidden /></a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"><LinkedinLogo size={24} aria-hidden /><span><strong>LinkedIn</strong><small>{es ? "Conectemos profesionalmente" : "Let's connect professionally"}</small></span><ArrowUpRight size={18} aria-hidden /></a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><GithubLogo size={24} aria-hidden /><span><strong>GitHub</strong><small>{es ? "Código, ideas y colaboración" : "Code, ideas and collaboration"}</small></span><ArrowUpRight size={18} aria-hidden /></a>
            </div>
            <p className="contact-back-footer">Colombia · Español / English</p>
          </div>
        </div>
        <span className="contact-card-caption" aria-hidden>{flipped ? "02 / CONNECT" : "01 / MEET JUAN"}</span>
      </div>
    </div>
    <button type="button" className="contact-motion-control" onClick={() => setScannerPaused(value => !value)} aria-label={es ? (scannerPaused ? "Reproducir animación de contacto" : "Pausar animación de contacto") : (scannerPaused ? "Play contact animation" : "Pause contact animation")}>
      {scannerPaused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
      {es ? "Movimiento" : "Motion"}
    </button>
  </section>;
}
