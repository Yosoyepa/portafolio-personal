"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import Lenis from "lenis";
import { useLang } from "./LanguageProvider";

/** Reveals observe actual visibility, so changing answers or language cannot
 * leave downstream content hidden behind stale scroll positions. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const reduce = useReducedMotion();

  useEffect(() => {
    const animations = new Set<Animation>();
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const reveal = (element: HTMLElement) => {
      const needsAnimation = getComputedStyle(element).opacity === "0" && !reduce;
      element.style.opacity = "1";
      element.style.visibility = "visible";
      if (!needsAnimation) return;
      const animation = element.animate([
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    elements.forEach((element) => reduce ? reveal(element) : observer.observe(element));
    return () => { observer.disconnect(); animations.forEach((animation) => animation.cancel()); };
  }, [lang, reduce]);

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [reduce]);

  return <>{children}</>;
}
