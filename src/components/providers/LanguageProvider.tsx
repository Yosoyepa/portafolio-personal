"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Content, type Lang } from "@/lib/content";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: Content;
};

const LanguageContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Restaurar preferencia guardada después de la hidratación
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("portfolio-lang");
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem("portfolio-lang", next);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "es" ? "en" : "es");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t: content[lang] as Content }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de <LanguageProvider>");
  return ctx;
}
