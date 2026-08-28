"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { GithubLogo, LinkedinLogo, List, X } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/lib/utils";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/content";

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // Progreso de scroll vía Motion (sin listeners de scroll nativos)
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { label: t.nav.about, href: "#perfil" },
    { label: t.nav.experience, href: "#experiencia" },
    { label: t.nav.projects, href: "#proyectos" },
    { label: t.nav.stack, href: "#stack" },
    { label: t.nav.certifications, href: "#certificaciones" },
    { label: t.nav.contact, href: "#contacto" },
  ];

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav aria-label="Principal" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <a
          href="#inicio"
          onClick={(e) => go(e, "#inicio")}
          className="group flex items-center gap-2.5"
          aria-label={t.nav.home}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-violet font-display text-[13px] font-extrabold text-[#04050a] transition-transform duration-300 group-hover:rotate-[-6deg]">
            JA
          </span>
          <span className="hidden font-mono text-xs tracking-widest text-muted sm:block">
            juan·andrade
          </span>
        </a>

        {/* Links desktop */}
        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="text-[13px] text-muted transition-colors duration-200 hover:text-fg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Toggle idioma */}
          <div className="relative flex items-center rounded-full border border-white/10 p-0.5">
            {(["es", "en"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`relative rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  lang === code ? "text-[#04050a]" : "text-muted hover:text-fg"
                }`}
              >
                {lang === code && (
                  <motion.span
                    layoutId="lang-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-violet"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{code}</span>
              </button>
            ))}
          </div>

          {/* LinkedIn + GitHub */}
          <div className="hidden items-center gap-1 md:flex">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <LinkedinLogo size={18} weight="fill" aria-hidden />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <GithubLogo size={19} weight="fill" aria-hidden />
            </a>
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg lg:hidden"
          >
            {open ? <X size={20} aria-hidden /> : <List size={20} aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Panel móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-white/[0.06] bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-1 px-6 py-5">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="block w-full rounded-lg px-3 py-3 text-left text-sm text-muted transition-colors hover:bg-white/5 hover:text-fg"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
