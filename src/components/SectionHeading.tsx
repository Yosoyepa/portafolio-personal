"use client";

import { useLang } from "@/components/providers/LanguageProvider";

type Props = {
  title: string;
  centered?: boolean;
} & (
  | { kickerKey: "about" | "experience" | "projects" | "skills" | "certs" | "contact"; kicker?: string }
  /** A section without an entry in content.ts brings its own kicker. */
  | { kickerKey?: never; kicker: string }
);

export default function SectionHeading({ kickerKey, kicker, title, centered = false }: Props) {
  const { t } = useLang();
  const kickerMap = {
    about: t.about.kicker,
    experience: t.experience.kicker,
    projects: t.projects.kicker,
    skills: t.skills.kicker,
    certs: t.certs.kicker,
    contact: t.contact.kicker,
  } as const;

  return (
    <div data-reveal className={`mb-14 md:mb-16 ${centered ? "flex flex-col items-center text-center" : ""}`}>
      <p className="section-heading-kicker font-mono text-[11px] tracking-[0.28em] text-cyan uppercase">{kicker ?? (kickerKey && kickerMap[kickerKey])}</p>
      <h2 className={`mt-3 max-w-2xl font-display text-3xl font-medium tracking-[-0.045em] sm:text-4xl md:text-5xl ${centered ? "" : ""}`}>
        {title}
      </h2>
      <div className="mt-5 h-px w-24 rounded-full bg-gradient-to-r from-cyan to-violet" />
    </div>
  );
}
