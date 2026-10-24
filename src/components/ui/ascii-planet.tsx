"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  BUCKETS, BUCKET_COLORS, CHARS, DECODE_BASE, DECODE_GLYPHS, gridRows, planetFrame, planetGeometry, revealRow, scrambleIndex,
} from "@/lib/asciiPlanet.mjs";
import { createRenderLoop } from "@/lib/renderLoop.mjs";
import "./ascii-planet.css";

export interface AsciiPlanetProps {
  label: string;
  className?: string;
}

const CHAR_ASPECT = 0.6; // JetBrains Mono advance: 600 / 1000 em
const FPS = 12;
const COLS = 58;
const COLS_NARROW = 46;
const DECODE_MS = 1000;
const FRONT_MS = 90;
const GHOST_MS = 300;
const SPIN = 0.22; // rad/s
const SPIN_HOVER = 0.55;
/** Static frame for reduced motion: bands turned to a readable angle. */
const STILL_ROTATION = 0.8;
/** The moon circles faster than the bands turn; the offset puts it in front of the planet in the static frame. */
const MOON_RATE = 1.6;
const MOON_OFFSET = 0.3;

type Geometry = ReturnType<typeof planetGeometry>;

/** A ringed gas giant drawn with characters on a canvas: decodes top to bottom once in view, then turns slowly. */
export default function AsciiPlanet({ label, className }: AsciiPlanetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || reduce === null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = !reduce;
    let geo: Geometry | null = null;
    let chars = new Uint8Array(0);
    let buckets = new Uint8Array(0);
    let lists: Int32Array[] = [];
    const counts = new Int32Array(BUCKETS.COUNT);
    let cols = 0;
    let rows = 0;
    let size = 0;
    let dpr = 1;
    let cellW = 1;
    let cellH = 1;
    let family = "monospace";
    let ready = false;
    let disposed = false;
    let enough = false;
    let phase: "waiting" | "decoding" | "done" = animate ? "waiting" : "done";
    let elapsed = 0;
    let rotation = animate ? 0 : STILL_ROTATION;
    let speed = SPIN;
    let boost = 0;
    let hover = false;
    let tick = 0;

    const setFont = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `400 ${(cellW / CHAR_ASPECT).toFixed(3)}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const paint = () => {
      if (!geo || !size) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (phase === "waiting") return;
      planetFrame(geo, rotation, boost, tick, chars, buckets, rotation * MOON_RATE + MOON_OFFSET);
      counts.fill(0);
      for (let r = 0; r < rows; r++) {
        // Rows still decoding flicker as code, the front glows, the rows below are not there yet.
        const ahead = phase === "decoding" ? revealRow(r, rows, DECODE_MS) - elapsed : 0;
        if (ahead > GHOST_MS) continue;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (!chars[i]) continue;
          let b = buckets[i];
          if (ahead > 0) {
            chars[i] = DECODE_BASE + scrambleIndex(i, tick, DECODE_GLYPHS.length);
            b = ahead < FRONT_MS ? BUCKETS.FRONT : BUCKETS.BODY + 2;
          }
          lists[b][counts[b]++] = i;
        }
      }
      for (let b = 0; b < BUCKETS.COUNT; b++) {
        const count = counts[b];
        if (!count) continue;
        ctx.fillStyle = BUCKET_COLORS[b];
        const list = lists[b];
        for (let k = 0; k < count; k++) {
          const i = list[k];
          const r = (i / cols) | 0;
          ctx.fillText(CHARS[chars[i]], (i - r * cols + 0.5) * cellW, (r + 0.5) * cellH);
        }
      }
    };

    const step = (delta: number) => {
      if (phase === "waiting") {
        if (!enough) return;
        phase = "decoding";
      }
      tick++;
      if (phase === "decoding") {
        elapsed += delta * 1000;
        if (elapsed >= DECODE_MS) phase = "done";
      }
      const ease = 1 - Math.exp(-delta * 4);
      speed += ((hover ? SPIN_HOVER : SPIN) - speed) * ease;
      boost += ((hover ? 1 : 0) - boost) * ease;
      rotation += speed * delta;
      paint();
    };

    const loop = animate
      ? createRenderLoop(root, step, { fps: FPS, enabled: () => ready && (enough || phase !== "waiting") })
      : null;

    const layout = () => {
      const next = root.clientWidth;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextCols = window.innerWidth < 640 ? COLS_NARROW : COLS;
      if (!next || (next === size && nextDpr === dpr && nextCols === cols)) return;
      if (nextCols !== cols) {
        cols = nextCols;
        rows = gridRows(cols, { charAspect: CHAR_ASPECT });
        geo = planetGeometry(cols, rows);
        chars = new Uint8Array(cols * rows);
        buckets = new Uint8Array(cols * rows);
        lists = Array.from({ length: BUCKETS.COUNT }, () => new Int32Array(cols * rows));
      }
      size = next;
      dpr = nextDpr;
      cellW = size / cols;
      cellH = size / rows;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      if (!ready) return;
      setFont();
      paint();
    };

    const ro = new ResizeObserver(layout);
    ro.observe(root);
    const seen = animate
      ? new IntersectionObserver(([entry]) => {
        enough = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        loop?.refresh();
      }, { threshold: [0, 0.35] })
      : null;
    seen?.observe(root);

    const card = (root.closest(".gh-profile") as HTMLElement | null) ?? root;
    const onEnter = (e: PointerEvent) => { if (e.pointerType === "mouse") hover = true; };
    const onLeave = () => { hover = false; };
    if (animate) {
      card.addEventListener("pointerenter", onEnter, { passive: true });
      card.addEventListener("pointerleave", onLeave, { passive: true });
    }

    (async () => {
      const jet = getComputedStyle(root).getPropertyValue("--font-jet").trim();
      family = jet ? `${jet}, monospace` : "monospace";
      try {
        await document.fonts.load(`400 12px ${family}`, CHARS);
        await document.fonts.ready;
      } catch { /* the fallback monospace keeps the grid */ }
      if (disposed) return;
      ready = true;
      size = 0;
      layout();
      loop?.refresh();
    })();

    return () => {
      disposed = true;
      loop?.dispose();
      ro.disconnect();
      seen?.disconnect();
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div ref={rootRef} role="img" aria-label={label} className={"apl-root" + (className ? " " + className : "")}>
      <canvas ref={canvasRef} className="apl-canvas" aria-hidden="true" />
    </div>
  );
}
