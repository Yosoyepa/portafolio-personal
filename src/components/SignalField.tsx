"use client";

import { useEffect, useId, useRef } from "react";
import ScannerSurface from "@/components/ScannerSurface";

const ROUTES = ["M145 152 C170 211 211 214 265 246", "M376 245 C432 224 460 208 492 152", "M320 308 C286 354 285 383 320 422"];
const COLORS = ["#9aeadd", "#b8a2ff", "#8bc8ff"];

// Fixed filaments retain a crisp silhouette; only a short light packet travels along them.
const ROUTE_POINTS = [
  [[145, 152], [170, 211], [211, 214], [265, 246]],
  [[376, 245], [432, 224], [460, 208], [492, 152]],
  [[320, 308], [286, 354], [285, 383], [320, 422]]
];
const ELECTRIC_ROUTES = ROUTE_POINTS.map((points, seed) => Array.from({ length: 37 }, (_, i) => {
  const t = i / 36, u = 1 - t;
  const x = u ** 3 * points[0][0] + 3 * u * u * t * points[1][0] + 3 * u * t * t * points[2][0] + t ** 3 * points[3][0];
  const y = u ** 3 * points[0][1] + 3 * u * u * t * points[1][1] + 3 * u * t * t * points[2][1] + t ** 3 * points[3][1];
  const jitter = Math.sin(t * Math.PI) * (Math.sin(i * 2.7 + seed) * 2.7 + Math.cos(i * 1.3) * 1.4);
  return `${i ? "L" : "M"}${(x + jitter).toFixed(1)} ${(y - jitter * .6).toFixed(1)}`;
}).join(" "));
const ELECTRIC_ORBITS = [[252, 149, -27], [233, 170, 39]].map(([rx, ry, rotation]) => {
  const angle = rotation * Math.PI / 180;
  return Array.from({ length: 181 }, (_, i) => {
    const t = i / 180 * Math.PI * 2;
    const jitter = Math.sin(i * 2.8) * 1.4 + Math.cos(i * 1.7) * .8;
    const x = (rx + jitter) * Math.cos(t), y = (ry + jitter) * Math.sin(t);
    return `${i ? "L" : "M"}${(320 + x * Math.cos(angle) - y * Math.sin(angle)).toFixed(1)} ${(262 + x * Math.sin(angle) + y * Math.cos(angle)).toFixed(1)}`;
  }).join(" ") + "Z";
});

/** Vector constellation: fixed landmarks, explicit roles, and signals following connections. */
export default function SignalField({ playing, interactive, stage, english }: {
  playing: boolean; interactive: boolean; stage: number; english: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    const element = ref.current;
    if (!element || !interactive) return;
    let frame = 0, x = 0, y = 0;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      x = (event.clientX - rect.left) / rect.width - .5;
      y = (event.clientY - rect.top) / rect.height - .5;
      const distances = [[145 / 640, 152 / 520], [492 / 640, 152 / 520], [320 / 640, 422 / 520]].map(([nx, ny]) => Math.hypot(x + .5 - nx, y + .5 - ny));
      const nearest = Math.min(...distances);
      element.dataset.hover = nearest < .23 ? String(distances.indexOf(nearest)) : "";
      // Compositor updates only while the pointer moves; no continuous React renders.
      if (!frame) frame = requestAnimationFrame(() => {
        element.style.setProperty("--field-x", `${x * 8}deg`);
        element.style.setProperty("--field-y", `${-y * 6}deg`);
        frame = 0;
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      element.style.setProperty("--field-x", "0deg"); element.style.setProperty("--field-y", "0deg");
      element.dataset.hover = "";
    };
    element.addEventListener("pointermove", move, { passive: true }); element.addEventListener("pointerleave", reset);
    return () => { reset(); element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); };
  }, [interactive]);
  const labels = english ? ["CONTEXT", "AGENTS", "PRODUCTION"] : ["CONTEXTO", "AGENTES", "PRODUCCIÓN"];
  return <div ref={ref} className="signal-constellation" data-playing={playing} data-stage={stage} aria-hidden="true">
    <svg className="constellation-map" viewBox="0 0 640 520" fill="none">
      <defs>
        <radialGradient id={`${id}-halo`}><stop stopColor="#4c9bd6" stopOpacity=".16" /><stop offset=".55" stopColor="#405288" stopOpacity=".06" /><stop offset="1" stopColor="#050913" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-core`} cx=".35" cy=".2" r=".9"><stop stopColor="#335366" /><stop offset=".48" stopColor="#122638" /><stop offset="1" stopColor="#0a1222" /></radialGradient>
        <linearGradient id={`${id}-ring`} x1="140" y1="80" x2="485" y2="460" gradientUnits="userSpaceOnUse"><stop stopColor="#a0f3e5" stopOpacity=".7" /><stop offset=".43" stopColor="#829def" stopOpacity=".12" /><stop offset="1" stopColor="#b09bf3" stopOpacity=".6" /></linearGradient>
        <filter id={`${id}-glow`} x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="3" /></filter>
        <clipPath id={`${id}-core-clip`}><circle cx="320" cy="264" r="64" /></clipPath>
        {ELECTRIC_ROUTES.map((d, i) => <path key={i} id={`${id}-wire-${i}`} d={d} pathLength="100" />)}
        {ELECTRIC_ORBITS.map((d, i) => <path key={i} id={`${id}-orbit-${i}`} d={d} pathLength="100" />)}
      </defs>
      <circle cx="320" cy="260" r="260" fill={`url(#${id}-halo)`} />
      <g className="constellation-orbits" stroke={`url(#${id}-ring)`}>
        <ellipse cx="320" cy="262" rx="252" ry="149" transform="rotate(-27 320 262)" />
        <ellipse cx="320" cy="262" rx="233" ry="170" transform="rotate(39 320 262)" />
        <circle cx="320" cy="262" r="218" strokeDasharray="2 13" opacity=".55" />
      </g>
      {[0, 1].map(i => <g key={i} className={`constellation-orbit-energy constellation-orbit-energy--${i}`}>
        <use href={`#${id}-orbit-${i}`} stroke="#299bff" strokeWidth="8" filter={`url(#${id}-glow)`} className="constellation-orbit-packet" />
        <use href={`#${id}-orbit-${i}`} stroke="#40bdff" strokeWidth="2.5" className="constellation-orbit-packet" />
        <use href={`#${id}-orbit-${i}`} stroke="#d5f9ff" strokeWidth=".9" className="constellation-orbit-packet constellation-orbit-tip" />
      </g>)}
      <g stroke="#91b1d5" opacity=".15">
        <path d="M145 152 C187 18 466 20 492 152 M492 152 C619 292 508 452 320 422 M320 422 C114 454 33 281 145 152" />
        <path d="M107 228 72 272 145 338 202 371 M506 257 567 296 514 345 457 365 M211 90 302 68 396 83" strokeDasharray="3 6" />
      </g>
      {[[107,228],[72,272],[145,338],[202,371],[506,257],[567,296],[514,345],[457,365],[211,90],[302,68],[396,83]].map(([x,y], i) => <g key={i}><circle cx={x} cy={y} r="3" fill="#98b5d1" opacity=".65" /><circle cx={x} cy={y} r="7" stroke="#98b5d1" opacity=".12" /></g>)}
      {ROUTES.map((path, i) => <g key={path} data-connection={i} className={`constellation-route ${stage === i ? "is-active" : ""}`} style={{ color: COLORS[i] }}>
        <path d={path} stroke="currentColor" strokeWidth="10" className="constellation-route-halo" filter={`url(#${id}-glow)`} />
        <path d={path} stroke="currentColor" strokeWidth="1.3" className="constellation-route-line" />
        <path d={path} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" pathLength="100" className="constellation-pulse" style={{ animationDelay: `${i * -.8}s` }} />
        <g className="constellation-wire" style={{ animationDelay: `${i * -.8}s` }}>
          <use href={`#${id}-wire-${i}`} stroke="#249fff" strokeWidth="8" filter={`url(#${id}-glow)`} />
          <use href={`#${id}-wire-${i}`} stroke="#54c9ff" strokeWidth="1.4" />
          <use href={`#${id}-wire-${i}`} stroke="#e4fcff" strokeWidth="1" className="constellation-current" />
        </g>
      </g>)}
      <circle cx="320" cy="264" r="82" stroke="#a9d8e4" strokeOpacity=".09" />
      <circle cx="320" cy="264" r="70" stroke={`url(#${id}-ring)`} />
      <circle cx="320" cy="264" r="64" fill={`url(#${id}-core)`} />
      <foreignObject x="256" y="200" width="128" height="128" clipPath={`url(#${id}-core-clip)`}>
        <ScannerSurface variant="core" playing={playing} />
      </foreignObject>
      <circle cx="320" cy="264" r="64" stroke="#9cefff" strokeOpacity=".65" />
      <g stroke="#cffdf8" strokeWidth="1.6"><path d="M320 233v14m-19 19 14-12m10 0 14 12M303 268h34" strokeOpacity=".8" /><circle cx="320" cy="230" r="4" /><circle cx="320" cy="252" r="5" /><circle cx="298" cy="270" r="4" /><circle cx="342" cy="270" r="4" /></g>
      <text x="320" y="291" textAnchor="middle" className="constellation-core-label">{english ? "ORCHESTRATION" : "ORQUESTACIÓN"}</text>
      {[[145,152],[492,152],[320,422]].map(([x,y], i) => <g key={i} data-connection={i} className={`constellation-node ${stage === i ? "is-active" : ""}`} style={{ color: COLORS[i] }}>
        <circle cx={x} cy={y} r="42" fill="#0b1421" stroke="currentColor" strokeOpacity=".18" />
        <circle cx={x} cy={y} r="32" fill="#101e2d" stroke="currentColor" className="constellation-node-ring" />
        {i === 0 ? <g stroke="currentColor" strokeWidth="1.5"><ellipse cx={x} cy={y-8} rx="11" ry="4" /><path d={`M${x-11} ${y-8}v16c0 6 22 6 22 0v-16m-22 8c0 6 22 6 22 0`} /></g> : i === 1 ? <g stroke="currentColor" strokeWidth="1.5"><rect x={x-11} y={y-11} width="22" height="22" rx="5" /><path d={`M${x-5} ${y-17}v6m10-6v6m-10 22v6m10-6v6m-22-22h6m-6 10h6m22-10h6m-6 10h6`} /><path d={`m${x} ${y-6} 5 6-5 6-5-6Z`} /></g> : <g stroke="currentColor" strokeWidth="1.6"><path d={`M${x-10} ${y+8}h20a7 7 0 0 0 1-14 11 11 0 0 0-21-2 8 8 0 0 0 0 16Z`} /></g>}
        <rect x={x-76} y={y+49} width="152" height="45" rx="7" fill="#080f1be8" />
        <text x={x} y={y+66} textAnchor="middle" className="constellation-node-label" fill="currentColor">{labels[i]}</text>
        <text x={x} y={y+84} textAnchor="middle" className="constellation-node-tech">{[english ? "RAG · MEMORY" : "RAG · MEMORIA", "BEDROCK · MCP", "AWS · LLMOPS"][i]}</text>
      </g>)}
    </svg>
  </div>;
}
