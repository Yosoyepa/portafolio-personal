"use client";

// React Bits Dither, adapted to a single OGL pass; see reactbits/LICENSE.md.
import { useEffect, useRef, useState } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';
import { createRenderLoop } from '@/lib/renderLoop.mjs';
import { warmShaders } from '@/lib/warmup.mjs';
import './Dither.css';

const fragment = `precision highp float;
uniform vec2 resolution;
uniform float time, waveSpeed, waveFrequency, waveAmplitude, mouseRadius, colorNum, pixelSize;
uniform vec3 waveColor, backgroundColor;
uniform vec2 mousePos;
uniform float enableMouseInteraction;
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2)); 
}

float bayer2(vec2 p) { return mod(2.0 * p.x + 3.0 * p.y, 4.0); }
void main() {
  vec2 cell = floor(gl_FragCoord.xy / pixelSize);
  vec2 pixel = (cell + 0.5) * pixelSize;
  vec2 uv = (pixel / resolution - 0.5) * vec2(resolution.x / resolution.y, 1.0);
  vec2 pointer = (mousePos / resolution - 0.5) * vec2(resolution.x / resolution.y, -1.0);
  float proximity = 1.0 - smoothstep(0.0, mouseRadius, length(uv - pointer));
  uv += (uv - pointer) * proximity * 0.14 * enableMouseInteraction;
  float field = clamp(pattern(uv), 0.0, 1.0);
  vec3 color = mix(backgroundColor, waveColor, field);
  float threshold = (4.0 * bayer2(mod(cell, 2.0)) + bayer2(mod(floor(cell / 2.0), 2.0))) / 16.0 - 0.5;
  color = floor(clamp(color + threshold / (colorNum - 1.0), 0.0, 1.0) * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;
const vertex = `attribute vec2 uv; attribute vec2 position; void main() { gl_Position = vec4(position, 0., 1.); }`;

export default function Dither({ waveSpeed = .05, waveFrequency = 3, waveAmplitude = .3,
  waveColor = [.5,.5,.5], backgroundColor = [0,0,0], colorNum = 4, pixelSize = 2,
  disableAnimation = false, enableMouseInteraction = true, mouseRadius = 1 }) {
  const ref = useRef(null);
  const runtime = useRef(null);
  const props = useRef({});
  props.current = { waveSpeed, waveFrequency, waveAmplitude, waveColor, backgroundColor, colorNum, pixelSize, disableAnimation, enableMouseInteraction, mouseRadius };
  const [generation, setGeneration] = useState(0);
  useEffect(() => { runtime.current?.invalidate(); }, [disableAnimation, waveSpeed, waveFrequency, waveAmplitude, waveColor, backgroundColor, colorNum, pixelSize, enableMouseInteraction, mouseRadius]);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let renderer;
    try { renderer = new Renderer({ dpr: .75, alpha: false, antialias: false, powerPreference: 'low-power' }); }
    catch { return; }
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    const geometry = new Triangle(gl);
    const uniforms = {
      resolution: { value: [1,1] }, time: { value: 0 }, waveSpeed: { value: waveSpeed },
      waveFrequency: { value: waveFrequency }, waveAmplitude: { value: waveAmplitude },
      waveColor: { value: waveColor }, backgroundColor: { value: backgroundColor },
      mousePos: { value: [-10000,-10000] }, mouseRadius: { value: mouseRadius },
      enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
      colorNum: { value: colorNum }, pixelSize: { value: pixelSize * .75 }
    };
    // Link only after a background compile, so mounting never stalls a scroll frame; until then nothing is drawn.
    let program, mesh;
    const warm = warmShaders(gl, vertex, fragment);
    warm.ready.then(() => {
      if (runtime.current !== loop) return;
      program = new Program(gl, { vertex, fragment, uniforms });
      mesh = new Mesh(gl, { geometry, program }); loop.invalidate();
    });
    let lost = false;
    const loop = createRenderLoop(gl.canvas, delta => {
      const p = props.current;
      if (!mesh) return;
      if (!p.disableAnimation) uniforms.time.value += delta;
      for (const key of ['waveSpeed', 'waveFrequency', 'waveAmplitude', 'waveColor', 'backgroundColor', 'mouseRadius']) uniforms[key].value = p[key];
      uniforms.enableMouseInteraction.value = p.enableMouseInteraction ? 1 : 0;
      uniforms.colorNum.value = Math.max(2, p.colorNum);
      uniforms.pixelSize.value = Math.max(1, p.pixelSize * .75);
      renderer.render({ scene: mesh });
    }, { fps: 30, enabled: () => !lost && !props.current.disableAnimation });
    runtime.current = loop;
    const resize = () => {
      renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));
      uniforms.resolution.value = [gl.canvas.width, gl.canvas.height]; loop.invalidate();
    };
    const ro = new ResizeObserver(resize); ro.observe(container); resize();
    const section = container.closest('section');
    const move = event => {
      if (!props.current.enableMouseInteraction || event.pointerType === 'touch') return;
      const rect = gl.canvas.getBoundingClientRect();
      uniforms.mousePos.value = [(event.clientX - rect.left) * .75, (event.clientY - rect.top) * .75];
      if (props.current.disableAnimation) loop.invalidate();
    };
    const leave = () => { uniforms.mousePos.value = [-10000,-10000]; loop.invalidate(); };
    // Capture also sees events originating inside focused inputs and nested controls.
    section?.addEventListener('pointermove', move, { capture: true, passive: true });
    section?.addEventListener('pointerleave', leave);
    const contextLost = event => { event.preventDefault(); lost = true; loop.refresh(); };
    const contextRestored = () => setGeneration(value => value + 1);
    gl.canvas.addEventListener('webglcontextlost', contextLost);
    gl.canvas.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      warm.cancel(); loop.dispose(); runtime.current = null; ro.disconnect();
      section?.removeEventListener('pointermove', move, true); section?.removeEventListener('pointerleave', leave);
      gl.canvas.removeEventListener('webglcontextlost', contextLost); gl.canvas.removeEventListener('webglcontextrestored', contextRestored);
      geometry.remove(); program?.remove(); gl.canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [generation]);
  return <div ref={ref} className="dither-container" />;
}
