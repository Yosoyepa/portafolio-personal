"use client";

import { useReducedMotion } from "motion/react";
import { useLang } from "@/components/providers/LanguageProvider";
import DecryptedText from "@/components/reactbits/DecryptedText";

type Props = {
  kickerKey: "about" | "experience" | "projects" | "skills" | "certs" | "contact";
  title: string;
  centered?: boolean;
};

export default function SectionHeading({ kickerKey, title, centered = false }: Props) {
  const { t } = useLang();
  const reduce = useReducedMotion() ?? false;
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
      <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">{kickerMap[kickerKey]}</p>
      <h2 className={`mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${centered ? "" : ""}`}>
        {reduce ? (
          title
        ) : (
          <DecryptedText
            text={title}
            animateOn="view"
            speed={30}
            maxIterations={12}
            characters="!<>-_\\/[]{}=+*^?#01"
            encryptedClassName="text-cyan/45"
          />
        )}
      </h2>
      <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-cyan to-violet" />
    </div>
  );
}
