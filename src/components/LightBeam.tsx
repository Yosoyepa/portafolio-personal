"use client";

import { useEffect, useRef } from "react";

export interface CardBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const VERT = `
attribute vec2 aPos;
void main(){ 
  gl_Position = vec4(aPos, 0.0, 1.0); 
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec4 uCards; // normalized [left, top, right, bottom] in section UV (0..1, y=0 bottom, y=1 top)

float h21(vec2 p){ 
  p = fract(p * vec2(123.34, 456.21)); 
  p += dot(p, p + 34.123); 
  return fract(p.x * p.y); 
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x),
    mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){
    v += a * vnoise(p);
    p = p * 2.04 + 11.3;
    a *= 0.5;
  }
  return v;
}

// Gotas de lluvia en carriles: cometas sutiles y elegantes (cabeza brillante, cola difusa)
// u = 0..1 a través del chorro, s = 1 origen → 0 cards
float rainLayer(float u, float s, float t, float seed, float laneCount, float freq, float speed){
  float laneW = 1.0 / laneCount;
  float lane = floor(u / laneW);
  float f = fract(u / laneW);
  float ph = h21(vec2(lane, seed));
  float sp = speed * (0.60 + 0.80 * h21(vec2(lane, seed + 3.1)));
  float r = fract(s * freq + t * sp + ph);
  float comet = exp(-r / (0.14 + 0.08 * h21(vec2(lane, seed + 9.7))));
  float xProf = exp(-pow((f - 0.5) / (laneW * 0.32), 2.0));
  float bright = 0.40 + 0.60 * h21(vec2(lane, seed + 5.3));
  return comet * xProf * bright;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes; // 0..1, y=0 bottom, y=1 top
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.001; // seconds

  // Cards container geometry in UV space
  float cardLeft   = uCards.x;
  float cardTop    = uCards.y;
  float cardRight  = uCards.z;
  float cardBottom = uCards.w;

  if (cardRight <= cardLeft || cardTop <= cardBottom) {
    cardLeft   = 0.50;
    cardTop    = 0.60;
    cardRight  = 0.92;
    cardBottom = 0.16;
  }

  float cardHalf = max((cardRight - cardLeft) * 0.5, 0.001);
  float cardH    = max(cardTop - cardBottom, 0.001);
  float cx       = (cardLeft + cardRight) * 0.5;
  bool  isStacked = (cardLeft < 0.30); // true on mobile where cards stack below narrative text

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CASCADA — columna celestial original que nace estrecha en el origen y cae
  // ─────────────────────────────────────────────────────────────────────────────
  float fall    = clamp((uv.y - cardTop) / max(1.0 - cardTop, 0.05), 0.0, 1.0); // 1 = origen, 0 = cards
  float descent = 1.0 - fall;

  // Vaivén lateral + inclinación por ratón (crecen al caer)
  float sway = (sin(uv.y * 3.2 - t * 0.85) * 0.62 + sin(uv.y * 7.4 - t * 1.63) * 0.38) * 0.011 * descent;
  float tilt = uMouse.x * 0.014 * descent;
  float colX = cx + sway + tilt;
  float dxCol = (uv.x - colX) * aspect;

  // Gaussianas: σ estrecha en el origen, abierta al llegar a las cards
  float pWide = pow(descent, 1.35);
  float core = exp(-pow(abs(dxCol) / mix(0.006, 0.022, pWide), 2.0)) * 1.15;
  float glow = exp(-pow(abs(dxCol) / mix(0.014, 0.060, pWide), 1.85)) * 0.82;
  float vol  = exp(-pow(abs(dxCol) / mix(0.028, 0.125, pow(descent, 1.15)), 1.7)) * 0.62;
  float aura = exp(-pow(abs(dxCol) / mix(0.048, 0.185, descent), 1.5)) * 0.40;

  // Lluvia: gotas sutiles y etéreas que acompañan el haz sin sobrecargar
  float halfW = mix(0.020, 0.130, pWide);
  float bx = dxCol / (halfW * 2.1);
  float uLane = clamp(bx * 0.5 + 0.5, 0.0, 1.0);
  float edgeFade = 1.0 - clamp(bx * bx, 0.0, 1.0) * 0.65;
  float rainA = rainLayer(uLane, fall, t, 1.0, 26.0, 0.95, 0.28) * edgeFade;
  float rainB = rainLayer(uLane, fall, t, 2.0, 16.0, 0.60, 0.20) * 0.70 * edgeFade;
  float rain = (rainA + rainB) * smoothstep(0.0, 0.25, fall);

  // Humo volumétrico: niebla sedosa multi-escala que se funde armónicamente con los colores
  vec2 sPos = vec2(dxCol * 2.1, uv.y * 2.8 + t * 0.22);
  float warp = fbm(sPos * 1.1 + t * 0.08);
  float smoke1 = fbm(sPos * 1.8 + warp * 1.4 - vec2(0.0, t * 0.24));
  float smoke2 = fbm(vec2(dxCol * 1.4 + t * 0.05, uv.y * 1.9 - t * 0.16));
  float smokeSoft = mix(smoke1, smoke2, 0.45);

  vol  *= (0.55 + 0.65 * smokeSoft);
  aura *= (0.50 + 0.60 * smoke2);

  // Máscaras: contención lateral + desvanecimiento suave al llegar a las cards
  float lateralMask = smoothstep(0.26, 0.09, abs(dxCol));
  float topFade  = isStacked ? smoothstep(cardTop + 0.34, cardTop + 0.10, uv.y) : smoothstep(1.07, 0.985, uv.y);
  float vertMask = smoothstep(cardTop - 0.025, cardTop + 0.045, uv.y) * topFade;
  float mask = lateralMask * vertMask;

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ENVOLVENTE CONTINUA — U-FRAME UNIFICADO (Borde superior + Esquinas + Laterales)
  // ─────────────────────────────────────────────────────────────────────────────
  // Geometría unificada continua (SDF de bordes con esquinas redondeadas R=0.020)
  // Une el borde superior horizontal directamente con las esquinas y los laterales sin cortes
  float cornerR = 0.020;
  vec2 dCorner = vec2(
    max(abs(uv.x - cx) - (cardHalf - cornerR), 0.0),
    max(uv.y - (cardTop - cornerR), 0.0)
  );
  dCorner.x *= aspect;
  dCorner.y *= aspect;
  float dBorder = abs(length(dCorner) - cornerR * aspect);

  // Progresión de la base en el borde superior:
  // Ancha y profunda en el centro (donde reposa la columna de luz)
  // y se adelgaza progresivamente hacia los bordes hasta igualar la delgadez fina de los laterales
  float qTop = clamp(abs(uv.x - cx) / max(cardHalf, 0.001), 0.0, 1.0);
  float isTopZone = smoothstep(cardTop - cornerR * 2.0, cardTop + 0.010, uv.y);
  float topTaper = pow(max(1.0 - qTop, 0.0), 1.5) * isTopZone;

  float sigmaCore = mix(0.0055, 0.0160, topTaper);
  float sigmaGlow = mix(0.0150, 0.0420, topTaper);
  float sigmaAura = mix(0.0320, 0.0800, topTaper);

  // Perfil del haz a lo largo de todo el contorno U con adelgazamiento progresivo hacia los bordes
  float uCore = exp(-pow(dBorder / sigmaCore, 2.0));
  float uGlow = exp(-pow(dBorder / sigmaGlow, 1.75));
  float uAura = exp(-pow(dBorder / sigmaAura, 1.45));

  // Cojín de luz superior que abraza el techo del contenedor:
  // Es ancho y alto en el centro y se adelgaza armónicamente hacia los bordes
  float dyLand = (uv.y - cardTop) * aspect;
  float landHeight = mix(0.008, 0.042, topTaper);
  float landingBase = exp(-pow(abs(dyLand) / landHeight, 1.8)) * topTaper * (0.88 + 0.12 * sin(t * 0.6));

  // Velo difuso que armoniza con los gradientes del contenedor
  float vy = (cardTop - uv.y) / cardH;
  float vProf = vy <= 0.0
    ? exp(-pow((-vy) * cardH / 0.12, 1.5))
    : pow(max(1.0 - vy / 0.40, 0.0), 1.6) * 0.70;
  float poolCaustics = 0.75 + 0.35 * fbm(vec2(uv.x * 6.0 - t * 0.35, uv.y * 8.0 + t * 0.60));
  float blanket = pow(max(1.0 - qTop, 0.0), 1.8) * vProf * poolCaustics * (0.86 + 0.14 * sin(t * 0.45));

  // Coordenada vertical normalizada dentro de la caja (0 = cardTop, 1 = cardBottom)
  float pDown = clamp((cardTop - uv.y) / cardH, 0.0, 1.0);

  // Ciclo de cascada descendente
  float cyc = fract(t * 0.075);
  float head = 1.0 - pow(1.0 - cyc, 3.0); // frente de flujo que cae
  float sideFadeB = 1.0 - smoothstep(0.70, 1.0, pDown); // fade en el fondo

  float run = (1.0 - smoothstep(head - 0.14, head, pDown)) * (1.0 - pDown * 0.65) * sideFadeB;
  float tip = exp(-pow((pDown - head) / 0.045, 2.0)) * 1.15 * (1.0 - pDown * 0.5);

  // Transición continua:
  // En la parte superior (uv.y >= cardTop - cornerR), la base alimenta las esquinas.
  // Al girar las esquinas hacia abajo, continúa con su delgadez fina por los laterales.
  float isLateral = smoothstep(cardTop - cornerR * 0.5, cardTop - cornerR * 2.5, uv.y);
  float borderFlow = mix(1.0, 0.40 + 0.60 * run + tip, isLateral) * sideFadeB;

  // Shimmer suave a lo largo del marco
  float shimmer = 0.90 + 0.10 * sin(uv.x * 20.0 + uv.y * 16.0 - t * 2.0);

  // Límites verticales:
  // - Límite superior: la luz lateral/esquinas no sube hacia arriba (solo la cascada central desciende)
  // - Límite inferior: se detiene en la base inferior
  float topFrameStop = smoothstep(cardTop + 0.012, cardTop - 0.004, uv.y);
  float bottomFrameStop = smoothstep(cardBottom - 0.004, cardBottom + 0.010, uv.y);
  float frameMask = topFrameStop * bottomFrameStop;

  float unifiedCore = uCore * borderFlow * shimmer * frameMask;
  float unifiedGlow = uGlow * borderFlow * shimmer * frameMask;
  float unifiedAura = uAura * borderFlow * 0.85 * frameMask;

  // Rastro final muy tenue pegado al borde inferior, desde adentro
  float dyBot = (uv.y - (cardBottom + 0.006)) * aspect;
  float bottomRun = exp(-pow(abs(dyBot) / 0.009, 2.0))
                  * smoothstep(0.80, 1.0, head)
                  * (1.0 - smoothstep(cardHalf - 0.02, cardHalf + 0.01, abs(uv.x - cx)))
                  * 0.22 * bottomFrameStop;

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. COMPOSICIÓN POR CAPAS
  // ─────────────────────────────────────────────────────────────────────────────
  float totalCore   = (core + rain * 0.28) * mask + landingBase * 0.35 + unifiedCore * 0.85 + bottomRun * 0.4;
  float totalCyan   = (glow + rain * 0.40) * mask + landingBase * 0.70 + blanket * 0.45 + unifiedGlow * 1.05 + bottomRun * 0.8;
  float totalBlue   = vol * mask + landingBase * 0.45 + blanket * 0.60 + unifiedAura * 0.85;
  float totalViolet = aura * mask + blanket * 0.75 + unifiedAura * 0.50;

  // Palette
  vec3 colWhite  = vec3(1.0, 1.0, 1.0);
  vec3 colCyan   = vec3(0.00, 0.94, 1.0);   // #00f0ff
  vec3 colBlue   = vec3(0.12, 0.44, 1.0);   // #1f70ff
  vec3 colViolet = vec3(0.52, 0.18, 0.96);  // #852ef5

  vec3 rgb = colWhite  * (totalCore * 1.30)
           + colCyan   * (totalCyan * 1.05)
           + colBlue   * (totalBlue * 0.92)
           + colViolet * (totalViolet * 0.65);

  float alpha = clamp(
    totalCore * 0.90 + totalCyan * 0.82 + totalBlue * 0.55 + totalViolet * 0.38,
    0.0,
    1.0
  );

  rgb += (h21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);

  gl_FragColor = vec4(rgb, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("beam shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function LightBeam({ cardBounds }: { cardBounds?: CardBounds | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boundsRef = useRef(cardBounds);
  boundsRef.current = cardBounds;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const fail = () => {
      canvas.style.display = "none";
    };

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return fail();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("beam link:", gl.getProgramInfoLog(prog));
      return fail();
    }
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uCards = gl.getUniformLocation(prog, "uCards");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const { clientWidth: w, clientHeight: hgt } = canvas;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(hgt * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Smoothed mouse
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const render = (t: number) => {
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, current.x, current.y);

      const b = boundsRef.current;
      if (b && b.right > b.left && b.top > b.bottom) {
        gl.uniform4f(uCards, b.left, b.top, b.right, b.bottom);
      } else {
        gl.uniform4f(uCards, 0.50, 0.60, 0.92, 0.16);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;

    if (reduce) {
      render(20_000);
    } else {
      const loop = (t: number) => {
        if (visible) render(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
        threshold: 0.02,
      });
      io.observe(wrap);

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
      };
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}



