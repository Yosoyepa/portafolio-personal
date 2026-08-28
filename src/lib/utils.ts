/** Scroll suave hacia un id de sección, usando Lenis si está disponible. */
export function scrollToId(hash: string) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } })
    .__lenis;
  if (lenis?.scrollTo) {
    lenis.scrollTo(el, { offset: -70, duration: 1.25 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
