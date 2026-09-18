"use client";

import { useEffect, useRef } from "react";
import { createRenderLoop } from "@/lib/renderLoop.mjs";

/** One full-hero surface: sparse stars, short stellar trails and a fading pointer wake. */
export default function StarField({ playing, interactive }: { playing: boolean; interactive: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ playing, interactive });
  const loop = useRef<ReturnType<typeof createRenderLoop> | null>(null);
  useEffect(() => { settings.current = { playing, interactive }; loop.current?.invalidate(); }, [playing, interactive]);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const section = canvas.closest("section")!;
    let width = 1, height = 1, time = 0, seed = 519;
    const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    const stars = Array.from({ length: 240 }, () => ({ x: random(), y: random(), z: random() }));
    const wake: { x: number; y: number; life: number }[] = [];
    const pointer = { x: -1000, y: -1000 };
    const draw = (delta: number) => {
      if (settings.current.playing) time += delta;
      ctx.clearRect(0, 0, width, height);
      const count = width < 700 ? 100 : 240;
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        const x = (star.x * width + time * (1 + star.z * 2)) % width;
        const y = (star.y * height + time * (.2 + star.z * .4)) % height;
        const distance = Math.hypot(x - pointer.x, y - pointer.y);
        const proximity = settings.current.interactive ? Math.max(0, 1 - distance / 125) : 0;
        const opacity = .15 + star.z * .42 + proximity * .3;
        ctx.fillStyle = `rgba(194,218,242,${opacity})`;
        ctx.beginPath(); ctx.arc(x, y, .45 + star.z * .8, 0, Math.PI * 2); ctx.fill();
        if (star.z > .91) {
          ctx.strokeStyle = `rgba(155,203,246,${opacity * .27})`; ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
        }
      }
      // At most three comets; no full-canvas feedback blur or growing particle list.
      for (let i = 0; i < 3; i++) {
        const phase = (time * .055 + i * .33 + .14) % 1;
        const x = (1.1 - phase * 1.3) * width, y = (.08 + i * .27 + phase * .2) * height;
        const length = Math.min(130, width * .1), opacity = Math.sin(phase * Math.PI) * .38;
        const gradient = ctx.createLinearGradient(x, y, x + length, y - length * .2);
        gradient.addColorStop(0, `rgba(160,225,248,${opacity})`); gradient.addColorStop(1, "rgba(123,161,223,0)");
        ctx.strokeStyle = gradient; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + length, y - length * .2); ctx.stroke();
      }
      if (settings.current.interactive && settings.current.playing) {
        for (let i = wake.length - 1; i >= 0; i--) {
          const point = wake[i]; point.life -= delta;
          if (point.life <= 0) { wake.splice(i, 1); continue; }
          const next = wake[i - 1];
          if (!next || Math.hypot(point.x - next.x, point.y - next.y) > 100) continue;
          ctx.strokeStyle = `rgba(165,220,237,${point.life * .27})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(next.x, next.y); ctx.lineTo(point.x, point.y); ctx.stroke();
        }
      } else wake.length = 0;
    };
    loop.current = createRenderLoop(canvas, draw, { fps: 24, enabled: () => settings.current.playing });
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      // Cap the backing store as well as DPR on ultrawide and Retina displays.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2_000_000 / Math.max(1, width * height)));
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); loop.current?.invalidate();
    };
    const move = (event: PointerEvent) => {
      if (!settings.current.interactive || event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
      const last = wake[wake.length - 1];
      if (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > 7) {
        if (wake.length >= 28) wake.shift();
        wake.push({ x: pointer.x, y: pointer.y, life: .75 });
      }
      if (!settings.current.playing) loop.current?.invalidate();
    };
    const leave = () => { pointer.x = pointer.y = -1000; if (!settings.current.playing) loop.current?.invalidate(); };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    section.addEventListener("pointermove", move, { passive: true }); section.addEventListener("pointerleave", leave);
    return () => { observer.disconnect(); loop.current?.dispose(); loop.current = null; section.removeEventListener("pointermove", move); section.removeEventListener("pointerleave", leave); };
  }, []);
  return <canvas ref={ref} className="hero-starfield" aria-hidden="true" />;
}
