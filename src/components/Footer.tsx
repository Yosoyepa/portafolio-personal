"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/lib/utils";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-white/[0.06] py-9">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-center font-mono text-xs text-muted">{t.footer.rights}</p>
        <p className="font-mono text-[11px] tracking-wide text-muted/70">{t.footer.made}</p>
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("#inicio");
          }}
          className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-cyan"
        >
          <ArrowUp size={13} weight="bold" aria-hidden />
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}
