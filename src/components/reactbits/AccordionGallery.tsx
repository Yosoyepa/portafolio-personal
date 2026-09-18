"use client";

// Credential-focused adaptation of React Bits' AccordionGallery (David Haz).
// Semantic disclosure buttons, arrow-key focus and a vertical mobile layout.
import { useId, useRef, useState, type CSSProperties, type ReactNode, type KeyboardEvent } from "react";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";

export type GalleryItem = {
  title: string;
  subtitle: string;
  date: string;
  shortTitle: string;
  accent: string;
  visual: ReactNode;
};

export default function AccordionGallery({ items, label }: { items: GalleryItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % items.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div className="credential-gallery" role="group" aria-label={label}>
      {items.map((item, i) => (
        <article key={item.title} className={`credential-panel ${active === i ? "is-active" : ""}`} style={{ "--cert-accent": item.accent } as CSSProperties}>
          <div className="credential-atmosphere" aria-hidden="true" />
          <div className="credential-orbit" aria-hidden="true" />
          <div className="credential-art" aria-hidden="true">{item.visual}</div>
          <h3 className="credential-trigger-wrap">
            <button ref={(el) => { buttons.current[i] = el; }} className="credential-trigger" type="button"
              aria-label={item.title} aria-expanded={active === i} aria-controls={`${id}-panel-${i}`}
              onClick={() => setActive(i)} onKeyDown={(event) => moveFocus(event, i)}>
              <span className="credential-number">{String(i + 1).padStart(2, "0")}</span>
              <span className="credential-short">{item.shortTitle}</span>
              <span className="credential-toggle" aria-hidden="true">{active === i ? <ArrowUpRight size={20} /> : <Plus size={20} />}</span>
            </button>
          </h3>
          <div className="credential-details" id={`${id}-panel-${i}`} hidden={active !== i}>
            <p className="credential-issuer">{item.subtitle} <span>· {item.date}</span></p>
            <p className="credential-title">{item.title}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
