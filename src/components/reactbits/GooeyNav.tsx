"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import "./GooeyNav.css";

type Item = { label: string; href: string; icon: ReactNode };

/** React Bits GooeyNav adapted for scroll-controlled selection and real link semantics. */
export default function GooeyNav({ items, activeHref, onNavigate, className = "" }: {
  items: Item[]; activeHref: string; onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<HTMLDivElement>(null);
  const filterId = `gooey-${useId().replace(/:/g, "")}`;
  const signature = items.map(item => item.label).join("|");

  useEffect(() => {
    const container = ref.current;
    const effect = effectRef.current;
    if (!container || !effect) return;
    const position = () => {
      const anchor = Array.from(container.querySelectorAll("a")).find(a => a.getAttribute("href") === activeHref);
      effect.style.opacity = anchor ? "1" : "0";
      if (!anchor) return;
      const parent = container.getBoundingClientRect(), rect = anchor.getBoundingClientRect();
      Object.assign(effect.style, { width: `${rect.width}px`, height: `${rect.height}px`, transform: `translate(${rect.x - parent.x}px, ${rect.y - parent.y}px)` });
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeHref, signature]);

  const burst = () => {
    const effect = effectRef.current;
    if (!effect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    effect.querySelectorAll(".gooey-particle").forEach(p => p.remove());
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("span");
      particle.className = "gooey-particle";
      effect.appendChild(particle);
      const angle = i * Math.PI * 2 / 10;
      const distance = 20 + Math.random() * 17;
      const animation = particle.animate([
        { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1)`, opacity: 1, offset: .4 },
        { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
      ], { duration: 650 + Math.random() * 180, easing: "cubic-bezier(.22,1,.36,1)" });
      animation.onfinish = () => particle.remove();
    }
  };

  return <div ref={ref} className={`gooey-nav ${className}`}>
    <svg width="0" height="0" aria-hidden="true"><defs><filter id={filterId} x="-60%" y="-100%" width="220%" height="300%" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" /></filter></defs></svg>
    <div className="gooey-selection" ref={effectRef} aria-hidden="true" style={{ filter: `url(#${filterId})` }}><span className="gooey-pill" /></div>
    <ul>{items.map(item => <li key={item.href}><a href={item.href} aria-current={activeHref === item.href ? "location" : undefined} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      onNavigate(event, item.href); burst();
    }}>{item.icon}<span>{item.label}</span></a></li>)}</ul>
  </div>;
}
