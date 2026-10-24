"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ASCII_RAMP, DECODE_GLYPHS, buildPortrait, glyphIndex, gridRows, hexToRgb, lensWeight, mixRgb,
  revealAt, scrambleIndex, vignette,
} from "@/lib/asciiPortrait.mjs";
import "./ascii-portrait.css";

export interface AsciiPortraitProps {
  src: string;
  alt: string;
  cols?: number;
  className?: string;
}

const CHAR_ASPECT = 0.6; // JetBrains Mono advance: 600 / 1000 em
const TONES = 24;
const ACCENT = TONES;
const FRONT = TONES + 1;
const STYLES = TONES + 2;
const CHARS = ASCII_RAMP + DECODE_GLYPHS;
const RAMP_N = ASCII_RAMP.length;
const DECODE_MS = 1400;
const FRONT_MS = 90;
const TICK_MS = 1000 / 30;
const LENS_RADIUS = 70;
const LENS_GAIN = 0.6;
const SCRAMBLE = 0.15;
const SCRAMBLE_FADE_MS = 450;
const IDLE_MS = 600;

const DIM = hexToRgb("#1f5f73");
const LIGHT = hexToRgb("#adf3ed");
const STYLE_FILL = [
  ...Array.from({ length: TONES }, (_, k) => `rgb(${mixRgb(DIM, LIGHT, k / (TONES - 1)).join(",")})`),
  "#a795ee",
  "#eafcff",
];

const toneOf = (v: number) => Math.min(TONES - 1, Math.floor(v * TONES));

/** Client-side ASCII rendering of a photo: decodes top to bottom once in view, brightens under a cursor lens. */
export default function AsciiPortrait({ src, alt, cols = 72, className }: AsciiPortraitProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || reduce === null) return;
    const ctx = canvas.getContext("2d");
    const cache = document.createElement("canvas");
    const cctx = cache.getContext("2d");
    if (!ctx || !cctx) { setFailed(true); return; }

    const animate = !reduce;
    const rows = gridRows(cols, { charAspect: CHAR_ASPECT });
    const n = cols * rows;
    const reveal = new Float32Array(n);
    const rowDone = new Float32Array(rows);
    const vig = new Float32Array(n);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      reveal[i] = revealAt(r, c, rows, DECODE_MS, 0.05);
      rowDone[r] = Math.max(rowDone[r], reveal[i]);
      vig[i] = vignette(c, r, cols, rows);
    }
    const lists = Array.from({ length: STYLES }, () => new Int32Array(n));
    const counts = new Int32Array(STYLES);
    const frameChar = new Uint8Array(n);

    let portrait: ReturnType<typeof buildPortrait> | null = null;
    let disposed = false;
    let inView = false;
    let enough = false;
    let size = 0;
    let dpr = 1;
    let cellW = 1;
    let cellH = 1;
    let family = "monospace";
    let phase: "waiting" | "decoding" | "done" = animate ? "waiting" : "done";
    let elapsed = 0;
    let raf = 0;
    let last = 0;
    let drawnTick = -1;
    let lensX = 0;
    let lensY = 0;
    let lensAmt = 0;
    let lensTarget = 0;
    let lastMove = -Infinity;

    /** Classifies and draws the cells of [r0, r1) × [c0, c1) on `target`; `t` is the decode clock or null. */
    const paintCells = (
      target: CanvasRenderingContext2D, r0: number, r1: number, c0: number, c1: number,
      t: number | null, lens: boolean, tick: number, scramble: number,
    ) => {
      const p = portrait!;
      counts.fill(0);
      for (let r = Math.max(0, r0); r < Math.min(rows, r1); r++) {
        for (let c = Math.max(0, c0); c < Math.min(cols, c1); c++) {
          const i = r * cols + c;
          let style: number;
          let ch: number;
          if (t !== null && t < reveal[i]) {
            // Still decoding: the front glows, the rest flickers as a ghost of the final tone.
            if (vig[i] < 0.08) continue;
            ch = RAMP_N + scrambleIndex(i, tick, DECODE_GLYPHS.length);
            if (reveal[i] - t < FRONT_MS) style = FRONT;
            else {
              if (p.glyph[i] === 0 && scrambleIndex(i, tick + 977, 10) > 2) continue;
              style = toneOf(0.08 + 0.5 * p.value[i] * vig[i]);
            }
          } else {
            let v = p.value[i];
            let w = 0;
            if (lens) {
              w = lensWeight((c + 0.5) * cellW - lensX, (r + 0.5) * cellH - lensY, LENS_RADIUS) * lensAmt;
              if (w > 0) v += p.mask[i] * w * LENS_GAIN * (1 - v);
            }
            const g = glyphIndex(v, RAMP_N);
            if (g === 0) continue;
            ch = g;
            style = p.accent[i] ? ACCENT : toneOf(v);
            if (w > 0.05 && scramble > 0 && scrambleIndex(i, tick + 31, 1000) < SCRAMBLE * scramble * 1000) {
              ch = RAMP_N + scrambleIndex(i, tick, DECODE_GLYPHS.length);
              style = TONES - 1;
            }
          }
          frameChar[i] = ch;
          lists[style][counts[style]++] = i;
        }
      }
      for (let s = 0; s < STYLES; s++) {
        const count = counts[s];
        if (!count) continue;
        target.fillStyle = STYLE_FILL[s];
        const list = lists[s];
        for (let k = 0; k < count; k++) {
          const i = list[k];
          const r = (i / cols) | 0;
          target.fillText(CHARS[frameChar[i]], (i - r * cols + 0.5) * cellW, (r + 0.5) * cellH);
        }
      }
    };

    const setFont = (target: CanvasRenderingContext2D) => {
      target.setTransform(dpr, 0, 0, dpr, 0, 0);
      target.font = `400 ${(cellW / CHAR_ASPECT).toFixed(3)}px ${family}`;
      target.textAlign = "center";
      target.textBaseline = "middle";
    };

    const blitCache = (rowsDone: number) => {
      if (rowsDone <= 0) return;
      const h = Math.min(cache.height, Math.round(rowsDone * cellH * dpr));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(cache, 0, 0, cache.width, h, 0, 0, cache.width, h);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      if (!portrait || !size) return;
      const tick = Math.floor((phase === "decoding" ? elapsed : now) / TICK_MS);
      const scramble = lensTarget > 0 ? Math.max(0, 1 - (now - lastMove) / SCRAMBLE_FADE_MS) : 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (phase === "waiting") return;
      const t = phase === "decoding" ? elapsed : null;
      if (t === null) blitCache(rows);
      else {
        let solid = 0;
        while (solid < rows && t >= rowDone[solid]) solid++;
        blitCache(solid);
        paintCells(ctx, solid, rows, 0, cols, t, false, tick, 0);
      }
      if (lensAmt > 0.01) {
        const c0 = Math.floor((lensX - LENS_RADIUS) / cellW), c1 = Math.ceil((lensX + LENS_RADIUS) / cellW);
        const r0 = Math.floor((lensY - LENS_RADIUS) / cellH), r1 = Math.ceil((lensY + LENS_RADIUS) / cellH);
        ctx.save();
        ctx.beginPath();
        ctx.rect(c0 * cellW, r0 * cellH, (c1 - c0) * cellW, (r1 - r0) * cellH);
        ctx.clip();
        ctx.clearRect(c0 * cellW, r0 * cellH, (c1 - c0) * cellW, (r1 - r0) * cellH);
        paintCells(ctx, r0 - 1, r1 + 1, c0 - 1, c1 + 1, t, true, tick, scramble);
        ctx.restore();
      }
      drawnTick = tick;
    };

    const busy = (now: number) =>
      phase === "decoding" || Math.abs(lensTarget - lensAmt) > 0.01 || (lensTarget > 0 && now - lastMove < IDLE_MS);

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min(50, Math.max(0, now - last));
      last = now;
      let dirty = false;
      if (phase === "decoding") {
        elapsed += dt;
        if (elapsed >= DECODE_MS) phase = "done";
        dirty = phase === "done" || Math.floor(elapsed / TICK_MS) !== drawnTick;
      }
      if (lensAmt !== lensTarget) {
        lensAmt += (lensTarget - lensAmt) * (1 - Math.exp(-dt / 80));
        if (Math.abs(lensTarget - lensAmt) <= 0.01) lensAmt = lensTarget;
        dirty = true;
      }
      if (lensTarget > 0 && now - lastMove < IDLE_MS + 50) dirty = true;
      if (dirty) draw(now);
      if (inView && !document.hidden && busy(now)) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || disposed || !portrait || !inView || document.hidden || !busy(performance.now())) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const layout = () => {
      const next = root.clientWidth;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!next || (next === size && nextDpr === dpr)) return;
      size = next;
      dpr = nextDpr;
      cellW = size / cols;
      cellH = size / rows;
      canvas.width = cache.width = Math.round(size * dpr);
      canvas.height = cache.height = Math.round(size * dpr);
      if (!portrait) return;
      setFont(ctx);
      setFont(cctx);
      cctx.clearRect(0, 0, size, size);
      paintCells(cctx, 0, rows, 0, cols, null, false, 0, 0);
      draw(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      lensX = e.clientX - rect.left;
      lensY = e.clientY - rect.top;
      lensTarget = 1;
      lastMove = performance.now();
      wake();
    };
    const onLeave = () => {
      lensTarget = 0;
      wake();
    };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") onLeave(); };

    const prepare = async () => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      await img.decode();
      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) throw new Error("2d context unavailable");
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(img, 0, 0, cols, rows);
      const built = buildPortrait(sctx.getImageData(0, 0, cols, rows));
      const jet = getComputedStyle(root).getPropertyValue("--font-jet").trim();
      family = jet ? `${jet}, monospace` : "monospace";
      try {
        await document.fonts.load(`400 12px ${family}`, CHARS);
        await document.fonts.ready;
      } catch { /* the fallback monospace keeps the grid */ }
      if (disposed) return;
      portrait = built;
      size = 0;
      layout();
      maybeDecode();
    };

    const maybeDecode = () => {
      if (phase === "waiting" && portrait && enough) phase = "decoding";
      wake();
    };

    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      prepare().catch(() => { if (!disposed) setFailed(true); });
    };
    const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) begin(); }, { rootMargin: "400px 0px" });
    const seen = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      enough = inView && entry.intersectionRatio >= 0.35;
      if (inView) { begin(); maybeDecode(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: [0, 0.35] });
    near.observe(root);
    seen.observe(root);
    const ro = new ResizeObserver(layout);
    ro.observe(root);
    const onVisibility = () => { if (!document.hidden) wake(); };
    document.addEventListener("visibilitychange", onVisibility);
    if (animate) {
      root.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerdown", onMove, { passive: true });
      root.addEventListener("pointerup", onUp, { passive: true });
      root.addEventListener("pointercancel", onLeave, { passive: true });
      root.addEventListener("pointerleave", onLeave, { passive: true });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      near.disconnect();
      seen.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onLeave);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [src, cols, reduce]);

  return (
    <div ref={rootRef} role="img" aria-label={alt} className={"ap-root" + (className ? " " + className : "")}>
      {failed
        ? <img src={src} alt="" className="ap-fallback" />
        : <canvas ref={canvasRef} className="ap-canvas" aria-hidden="true" />}
    </div>
  );
}
