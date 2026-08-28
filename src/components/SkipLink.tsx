"use client";

import { useLang } from "@/components/providers/LanguageProvider";

/** Enlace "saltar al contenido": primer elemento enfocable de la página (WCAG 2.4.1). */
export default function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#contenido" className="skip-link">
      {t.nav.skip}
    </a>
  );
}
