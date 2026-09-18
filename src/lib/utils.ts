/** Scroll suave hacia un id de sección, usando Lenis si está disponible. */
export function scrollToId(hash: string) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } })
    .__lenis;
  if (lenis?.scrollTo && !reduce) {
    // Lenis already includes the section’s CSS scroll-margin-top.
    lenis.scrollTo(el, { duration: 1.05 });
  } else {
    el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
  }
}
