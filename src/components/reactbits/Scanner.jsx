"use client";

// React Bits Scanner; shader from the user-provided source. See LICENSE.md.
// The lifecycle is adapted to the portfolio's visible-only render budget.
import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { createRenderLoop } from '@/lib/renderLoop.mjs';
import './Scanner.css';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const directionToFloat = dir => (dir === 'horizontal' ? 1.0 : dir === 'diagonal' ? 2.0 : 0.0);

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU = 6.2831853;

float signalField(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

vec3 palette(float f) {
  f = clamp(f, 0.0, 1.0);
  f = pow(f, uContrast);
  vec3 c = mix(uColor1, uColor2, smoothstep(0.08, 0.6, f));
  return mix(c, uColor3, smoothstep(0.68, 1.0, f));
}

float scanBand(float x, float aa, float sharp) {
  float v = mix(0.5, 0.5 + 0.5 * cos(x * TAU), aa);
  return pow(v, sharp);
}

void main() {
  float aspect = iResolution.x / iResolution.y;
  vec2 uv0 = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv0 / max(uScale, 0.001);

  float t = iTime * uSpeed;

  float mouseBoost = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mUv = vec2((uMouse.x * 2.0 - 1.0) * aspect, uMouse.y * 2.0 - 1.0);
    vec2 md = uv0 - mUv;
    float r = max(uMouseRadius, 0.001);
    mouseBoost = exp(-dot(md, md) / (r * r)) * uMouseStrength * uMouseActive;
  }

  float axis;
  if (uDirection < 0.5) axis = p.y;
  else if (uDirection < 1.5) axis = p.x;
  else axis = (p.x + p.y) * 0.70710678;

  float sig = signalField(p * uFrequency, t);
  float coord = axis + sig * uRipple;

  float phase = coord / max(uSweepWidth, 0.05) - t * uSweepSpeed;
  float sweep = pow(0.5 + 0.5 * cos(phase * TAU), max(uSweepFalloff, 0.1));

  float lc = coord * uBandDensity;
  float aa = 1.0 / (1.0 + uSoftness * fwidth(lc) * 3.0);
  aa = clamp(aa * (1.0 + mouseBoost * 0.6), 0.0, 1.0);

  float bodyBase = clamp(0.5 + 0.5 * sig, 0.0, 1.0);
  float body = bodyBase * bodyBase * uGlow * sweep;

  float sharp = max(uLineSharpness, 0.1);
  float split = uColorSpread * 0.16;
  float fr = clamp(scanBand(lc + split, aa, sharp) * sweep + body, 0.0, 1.0);
  float fg = clamp(scanBand(lc, aa, sharp) * sweep + body, 0.0, 1.0);
  float fb = clamp(scanBand(lc - split, aa, sharp) * sweep + body, 0.0, 1.0);

  vec3 col = vec3(palette(fr).r, palette(fg).g, palette(fb).b);

  float inten = (fr + fg + fb) * 0.3333333 * uBrightness;
  inten *= 1.0 + mouseBoost * 0.9;

  if (uScanline > 0.5) {
    inten *= 1.0 - 0.18 * (0.5 + 0.5 * cos(gl_FragCoord.y * 1.7));
  }

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    inten += (g - 0.5) * uGrainIntensity;
  }

  inten *= clamp(1.0 - uVignette * smoothstep(0.55, 1.65, length(uv0)), 0.0, 1.0);
  inten = clamp(inten, 0.0, 1.0);

  float a = clamp(inten * uOpacity, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`;

const FLOAT_PROPS = ['speed', 'sweepSpeed', 'sweepWidth', 'sweepFalloff', 'scale', 'frequency',
  'ripple', 'bandDensity', 'lineSharpness', 'glow', 'colorSpread', 'brightness', 'contrast',
  'softness', 'vignette', 'opacity', 'grainIntensity', 'mouseRadius', 'mouseStrength'];
const uniformName = key => `u${key[0].toUpperCase()}${key.slice(1)}`;

function updateUniforms(uniforms, props) {
  for (const key of FLOAT_PROPS) uniforms[uniformName(key)].value = props[key];
  uniforms.uDirection.value = directionToFloat(props.scanDirection);
  uniforms.uScanline.value = props.scanline ? 1 : 0;
  uniforms.uGrain.value = props.grain ? 1 : 0;
  uniforms.uMouseEnabled.value = props.mouseInteraction ? 1 : 0;
  for (const key of ['color1', 'color2', 'color3']) uniforms[uniformName(key)].value = hexToRgb(props[key]);
}

export default function Scanner({
  color1 = '#5227FF', color2 = '#FF9FFC', color3 = '#FFFFFF',
  speed = .5, sweepSpeed = .25, sweepWidth = 1.6, sweepFalloff = 6,
  scale = 1.5, frequency = 2, ripple = .22, bandDensity = 11,
  lineSharpness = 5.5, glow = .22, scanDirection = 'vertical', colorSpread = .7,
  brightness = 1, contrast = 1.15, softness = 1.4, vignette = .45,
  scanline = true, grain = true, grainIntensity = .05, opacity = 1,
  mouseInteraction = true, mouseRadius = .5, mouseStrength = .5,
  disableAnimation = false, maxDpr = 1, maxPixels = 750000, fps = 24, className = ''
}) {
  const ref = useRef(null);
  const runtime = useRef(null);
  const props = useRef({});
  props.current = { color1, color2, color3, speed, sweepSpeed, sweepWidth, sweepFalloff,
    scale, frequency, ripple, bandDensity, lineSharpness, glow, scanDirection, colorSpread,
    brightness, contrast, softness, vignette, scanline, grain, grainIntensity, opacity,
    mouseInteraction, mouseRadius, mouseStrength, disableAnimation };
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (!runtime.current) return;
    updateUniforms(runtime.current.uniforms, props.current);
    runtime.current.loop.invalidate();
  }, [color1, color2, color3, speed, sweepSpeed, sweepWidth, sweepFalloff, scale, frequency,
    ripple, bandDensity, lineSharpness, glow, scanDirection, colorSpread, brightness, contrast,
    softness, vignette, scanline, grain, grainIntensity, opacity, mouseInteraction,
    mouseRadius, mouseStrength, disableAnimation]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true,
        depth: false, antialias: false, dpr: 1, powerPreference: 'low-power' });
    } catch { return; }
    const gl = renderer.gl;
    if (!renderer.isWebgl2) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return; }
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    container.appendChild(canvas);
    const geometry = new Triangle(gl);
    const uniforms = {
      iTime: { value: 1.4 }, iResolution: { value: new Float32Array([1, 1]) },
      uMouse: { value: new Float32Array([.5, .5]) }, uMouseActive: { value: 0 },
      uDirection: { value: 0 }, uScanline: { value: 0 }, uGrain: { value: 0 },
      uMouseEnabled: { value: 0 }, uColor1: { value: [0, 0, 0] },
      uColor2: { value: [0, 0, 0] }, uColor3: { value: [1, 1, 1] }
    };
    for (const key of FLOAT_PROPS) uniforms[uniformName(key)] = { value: props.current[key] };
    updateUniforms(uniforms, props.current);
    const program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });
    const mesh = new Mesh(gl, { geometry, program });
    let lost = false;
    let mouseX = .5, mouseY = .5, mouseActive = 0;
    const loop = createRenderLoop(canvas, delta => {
      if (lost) return;
      if (!props.current.disableAnimation) uniforms.iTime.value += delta;
      const ease = 1 - Math.exp(-7 * delta);
      uniforms.uMouse.value[0] += (mouseX - uniforms.uMouse.value[0]) * ease;
      uniforms.uMouse.value[1] += (mouseY - uniforms.uMouse.value[1]) * ease;
      uniforms.uMouseActive.value += ((props.current.mouseInteraction ? mouseActive : 0) - uniforms.uMouseActive.value) * ease;
      renderer.render({ scene: mesh });
    }, { fps, enabled: () => !lost && !props.current.disableAnimation });
    runtime.current = { uniforms, loop };
    const resize = () => {
      if (lost) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
      renderer.dpr = Math.min(window.devicePixelRatio || 1, maxDpr, Math.sqrt(maxPixels / (w * h)));
      renderer.setSize(w, h);
      // SVG foreignObject and regular HTML share the same responsive sizing.
      canvas.style.width = '100%'; canvas.style.height = '100%';
      uniforms.iResolution.value[0] = canvas.width;
      uniforms.iResolution.value[1] = canvas.height;
      loop.invalidate();
    };
    const observer = new ResizeObserver(resize); observer.observe(container);
    // foreignObject keeps its viewBox dimensions while the outer SVG scales.
    const svgHost = container.closest('svg')?.parentElement;
    if (svgHost) observer.observe(svgHost);
    resize();
    const surface = container.closest('section') || container;
    const move = event => {
      if (!props.current.mouseInteraction || props.current.disableAnimation || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width;
      mouseY = 1 - (event.clientY - rect.top) / rect.height;
      mouseActive = mouseX >= 0 && mouseX <= 1 && mouseY >= 0 && mouseY <= 1 ? 1 : 0;
    };
    const leave = () => { mouseActive = 0; };
    // Capture keeps the background responsive over links, buttons, and focused controls.
    surface.addEventListener('pointermove', move, { passive: true, capture: true });
    surface.addEventListener('pointerleave', leave);
    const contextLost = event => { event.preventDefault(); lost = true; loop.refresh(); };
    const contextRestored = () => setGeneration(value => value + 1);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      loop.dispose(); runtime.current = null; observer.disconnect();
      surface.removeEventListener('pointermove', move, true); surface.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      geometry.remove(); program.remove(); canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [generation, maxDpr, maxPixels, fps]);

  return <div ref={ref} className={`scanner-container ${className}`.trim()} />;
}
