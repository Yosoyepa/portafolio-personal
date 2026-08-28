"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Scroll suave con Lenis sincronizado al ticker de GSAP + ScrollTrigger,
 * y registro global de reveals `[data-reveal]`.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveals globales basados en scroll
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
    });

    let lenis: Lenis | undefined;
    let raf: ((time: number) => void) | undefined;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
