import * as THREE from "three";
import { createRenderLoop } from "@/lib/renderLoop.mjs";

/**
 * The hero journey: one three.js scene driven by scroll progress.
 * Act 1 (idea): a single star with its dust disk. Act 2 (system): the dust condenses into three planets on their
 * orbits. Act 3 (running): packets of light travel the orbits. The camera flies a fixed path; the page owns the text.
 */

export interface JourneyOptions {
  canvas: HTMLCanvasElement;
  /** Element whose visibility and size drive the render loop (the sticky stage). */
  host: HTMLElement;
  /** Planet labels, in planet order, positioned by the scene every frame. */
  labels: (HTMLElement | null)[];
  /** Label of the central star. */
  coreLabel: HTMLElement | null;
  narrow: boolean;
  reduced: boolean;
  onReady: () => void;
}

export interface JourneyApi {
  setProgress(progress: number): void;
  setStage(stage: number | null): void;
  setPointer(x: number, y: number): void;
  setPlaying(playing: boolean): void;
  dispose(): void;
}

type Planet = { group: THREE.Group; mesh: THREE.Mesh; material: THREE.ShaderMaterial; radius: number; orbit: number; speed: number; phase: number; orbitLine: THREE.LineLoop };

const PLANETS = [
  // Contexto: an ice-and-ocean world. Agentes: a violet gas giant with rings. Producción: a warm, rocky world.
  { a: "#0d3b4a", b: "#63dce5", rim: "#9ff3f0", radius: 0.55, orbit: 3.4, speed: 0.16, phase: 0.6, bands: 3.0, ring: false },
  { a: "#2a1b52", b: "#b9a5ff", rim: "#c8b8ff", radius: 0.95, orbit: 5.4, speed: 0.1, phase: 2.6, bands: 11.0, ring: true },
  { a: "#3b2414", b: "#f0c98f", rim: "#ffd9a8", radius: 0.62, orbit: 7.4, speed: 0.07, phase: 4.4, bands: 2.0, ring: false },
] as const;

/** Camera keyframes along scroll progress: position and look-at target, star at the origin. */
const PATH_WIDE = [
  { p: 0, pos: [0.4, 0.8, 27], target: [-4.6, 0.3, 0] },
  { p: 0.36, pos: [2.2, 3.6, 15.5], target: [-2.0, 0, 0] },
  { p: 0.68, pos: [7.8, 2.6, 12.6], target: [-0.8, -0.2, 0] },
  { p: 0.86, pos: [5.4, 0.6, 15.2], target: [-1.2, 0, 0] },
  { p: 1, pos: [1.2, 4.2, 7.5], target: [0, 0, 0] },
] as const;
const PATH_NARROW = [
  { p: 0, pos: [0, -1.2, 30], target: [0, 3.4, 0] },
  { p: 0.36, pos: [1.2, 2.2, 21], target: [0, 0.6, 0] },
  { p: 0.68, pos: [5.6, 3.2, 18], target: [0, 0.2, 0] },
  { p: 0.86, pos: [4.2, 1.4, 20], target: [0, 0, 0] },
  { p: 1, pos: [1.2, 4.2, 7.5], target: [0, 0, 0] },
] as const;

const NOISE = /* glsl */ `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }
`;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function createJourney(options: JourneyOptions): JourneyApi | null {
  const { canvas, host, labels, coreLabel, narrow, reduced, onReady } = options;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance", stencil: false });
  } catch {
    return null;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(narrow ? 52 : 42, 1, 0.1, 400);
  const random = mulberry(20261024);
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T) => (disposables.push(item), item);

  // ── Starfield: a deep shell of stars with colour temperature and twinkle ──────────────────────────────
  const starCount = narrow ? 2200 : 5200;
  const starPositions = new Float32Array(starCount * 3);
  const starData = new Float32Array(starCount * 3); // size, seed, temperature
  for (let i = 0; i < starCount; i++) {
    const r = 30 + Math.pow(random(), 0.7) * 140;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    starPositions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.75, r * Math.cos(phi) - 20], i * 3);
    starData.set([0.6 + Math.pow(random(), 6) * 3.4, random() * 100, random()], i * 3);
  }
  const starGeometry = track(new THREE.BufferGeometry());
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("data", new THREE.BufferAttribute(starData, 3));
  const starMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixel: { value: dpr }, uFade: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 data; uniform float uTime; uniform float uPixel; varying float vAlpha; varying vec3 vColor;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.72 + 0.28 * sin(uTime * (0.6 + fract(data.y) * 1.8) + data.y);
        vAlpha = twinkle;
        vColor = mix(vec3(0.72, 0.84, 1.0), vec3(1.0, 0.86, 0.72), step(0.86, data.z));
        vColor = mix(vColor, vec3(0.62, 0.95, 0.98), step(data.z, 0.18));
        gl_PointSize = data.x * uPixel * clamp(90.0 / -mv.z, 0.6, 2.4);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha; varying vec3 vColor; uniform float uFade;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, core * core * vAlpha * uFade);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(new THREE.Points(starGeometry, starMaterial));

  // ── The system: tilted so that circular orbits read as ellipses ───────────────────────────────────────
  const system = new THREE.Group();
  system.rotation.set(-0.42, 0, 0.16);
  scene.add(system);

  // Star: a granulated core that never clips to white, a corona that overlaps its limb (so the edge never reads as
  // hard), slow diffraction spikes and an anamorphic streak. In act 1 the core shrinks to a point of light.
  const CORE_RADIUS = 0.52;
  const GLOW_SIZE = 10;
  const coreMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vNormal; varying vec3 vPos; varying vec3 vView;
      void main() { vNormal = normalize(normalMatrix * normal); vPos = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform float uTime; uniform float uBoost; varying vec3 vNormal; varying vec3 vPos; varying vec3 vView;
      ${NOISE}
      void main() {
        vec3 q = normalize(vPos);
        float cells = fbm(q * 7.0 + vec3(0.0, uTime * 0.05, uTime * 0.03));
        float fine = noise(q * 22.0 + uTime * 0.08);
        float granules = cells * 0.75 + fine * 0.25;
        float mu = max(dot(normalize(vNormal), normalize(vView)), 0.0);
        // Limb darkening toward cyan; the centre is a bluish white that stays below 1.0.
        vec3 limbColor = vec3(0.16, 0.62, 0.78);
        vec3 centre = vec3(0.9, 0.96, 1.0);
        vec3 c = mix(limbColor, centre, pow(mu, 0.5)) * (0.66 + 0.4 * granules) * (0.5 + 0.5 * pow(mu, 0.45));
        gl_FragColor = vec4(mix(c, vec3(0.8, 0.92, 1.0), uBoost), 1.0);
      }`,
  }));
  const core = new THREE.Mesh(track(new THREE.SphereGeometry(CORE_RADIUS, 48, 32)), coreMaterial);
  system.add(core);

  // Billboards drawn just in front of the core's limb, so they overlap it but still hide behind nearer planets.
  const billboard = /* glsl */ `uniform float uLift; varying vec2 vUv;
    void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.z += uLift; gl_Position = projectionMatrix * (mv + vec4(position.xy, 0.0, 0.0)); }`;
  const glowMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 }, uCore: { value: CORE_RADIUS / (GLOW_SIZE / 2) }, uFill: { value: 0 }, uBloom: { value: 0 }, uLift: { value: 0 } },
    vertexShader: billboard,
    fragmentShader: /* glsl */ `uniform float uTime; uniform float uIntensity; uniform float uCore; uniform float uFill; uniform float uBloom; varying vec2 vUv;
      ${NOISE}
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float d = length(q);
        float r = d / uCore; // 1.0 at the core's limb
        float a = atan(q.y, q.x);
        // Corona: starts inside the limb, peaks just outside it and falls off; streamers drift slowly.
        float ramp = smoothstep(0.7, 1.04, r);
        float streamers = 0.6 + 0.8 * noise(vec3(cos(a) * 2.6, sin(a) * 2.6, uTime * 0.04) + vec3(0.0, 0.0, r * 0.35));
        float corona = ramp * exp(-max(r - 1.0, 0.0) * 1.0) * (0.55 + 0.45 * streamers);
        float halo = exp(-d * 4.0) * 0.32 + exp(-d * 1.4) * 0.08;
        // Four thin diffraction spikes turning very slowly, plus two fainter ones.
        float t = uTime * 0.012;
        float spikes = (pow(abs(cos(2.0 * (a - t))), 420.0) + 0.45 * pow(abs(cos(2.0 * (a - t) + 0.785)), 900.0)) * exp(-d * 4.6) * ramp * (0.5 + 0.5 * min(uFill, 1.0));
        float point = uFill * exp(-r * 1.1);
        // The dive: the core dissolves into a wide bloom that also swallows the spikes.
        float bloom = uBloom * (exp(-d * 3.0) * 0.9 + exp(-d * 9.0) * 0.9);
        spikes *= 1.0 - uBloom * 0.7;
        // While diving the cyan cools toward blue-white, so the faded clip at the centre never reads warm.
        vec3 cyan = mix(vec3(0.45, 0.86, 1.0), vec3(0.55, 0.72, 1.0), uBloom);
        vec3 col = cyan * (corona * 0.75 + halo) + vec3(0.8, 0.94, 1.0) * (spikes * 0.7 + point) + vec3(0.62, 0.8, 1.0) * bloom;
        // Fade to nothing before the quad's edge so its square never shows.
        float edge = smoothstep(1.0, 0.72, d);
        float g = (corona * 0.75 + halo + spikes * 0.7 + point + bloom) * uIntensity * edge;
        vec3 rgb = col * uIntensity * edge;
        rgb /= max(1.0, max(rgb.r, max(rgb.g, rgb.b))); // clip by scaling, keeping the hue
        // Premultiplied output must keep alpha >= every channel, or the page composites it into the wrong hue.
        gl_FragColor = vec4(rgb, clamp(max(g, max(rgb.r, max(rgb.g, rgb.b))), 0.0, 1.0));
      }`,
    // The shaders output premultiplied colour: plain SRC_ALPHA blending would square the falloff and hide the halo.
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  const streakMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color("#7fd6ff") }, uIntensity: { value: 1 }, uLift: { value: 0 } },
    vertexShader: billboard,
    fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uIntensity; varying vec2 vUv;
      void main() { vec2 q = (vUv - 0.5) * 2.0; float g = exp(-abs(q.y) * 34.0) * (exp(-abs(q.x) * 2.6) * 0.8 + exp(-abs(q.x) * 14.0) * 0.6); gl_FragColor = vec4(uColor * g * uIntensity, g * uIntensity); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  const glow = new THREE.Mesh(track(new THREE.PlaneGeometry(GLOW_SIZE, GLOW_SIZE)), glowMaterial);
  const streak = new THREE.Mesh(track(new THREE.PlaneGeometry(26, 1.1)), streakMaterial);
  glow.renderOrder = streak.renderOrder = 2;
  system.add(glow, streak);

  // Dust disk: the "idea" before the system. Each grain orbits; with formation it migrates onto a planet's lane.
  const dustCount = narrow ? 1600 : 3400;
  const dustData = new Float32Array(dustCount * 4); // radius, angle, lane radius, height
  const lanes = PLANETS.map(planet => planet.orbit);
  for (let i = 0; i < dustCount; i++) {
    const radius = 1.4 + Math.pow(random(), 0.85) * 8.6;
    const lane = lanes.reduce((best, value) => (Math.abs(value - radius) < Math.abs(best - radius) ? value : best), lanes[0]);
    dustData.set([radius, random() * Math.PI * 2, lane + (random() - 0.5) * 0.45, (random() - 0.5) * 0.5], i * 4);
  }
  const dustGeometry = track(new THREE.BufferGeometry());
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(dustCount * 3), 3));
  dustGeometry.setAttribute("dust", new THREE.BufferAttribute(dustData, 4));
  const dustMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uForm: { value: 0 }, uExit: { value: 0 }, uPixel: { value: dpr } },
    vertexShader: /* glsl */ `attribute vec4 dust; uniform float uTime; uniform float uForm; uniform float uExit; uniform float uPixel; varying vec3 vColor; varying float vAlpha;
      void main() {
        float r = mix(dust.x, dust.z, uForm);
        float a = dust.y + uTime * 0.9 / pow(r, 1.5);
        vec3 p = vec3(cos(a) * r, dust.w * (1.0 - uForm * 0.85), sin(a) * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float warm = smoothstep(4.0, 1.4, r);
        vColor = mix(mix(vec3(0.42, 0.86, 0.92), vec3(0.66, 0.6, 1.0), smoothstep(4.5, 8.0, r)), vec3(1.0, 0.86, 0.66), warm);
        // During the dive the camera passes through the warm inner dust: let it thin out instead of tinting the bloom.
        vAlpha = (0.35 + 0.4 * fract(dust.y * 13.0)) * mix(1.0, 0.55, uForm) * (1.0 - uExit * smoothstep(5.0, 1.5, r) * 0.9);
        gl_PointSize = uPixel * (1.4 + fract(dust.y * 7.0) * 1.8) * clamp(22.0 / -mv.z, 0.4, 3.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `varying vec3 vColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vColor, smoothstep(0.5, 0.05, d) * vAlpha); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  system.add(dust);

  // Planets, their orbits and the gas giant's rings.
  const lightPosition = new THREE.Vector3();
  const planets: Planet[] = PLANETS.map((spec, index) => {
    const material = track(new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uLight: { value: lightPosition }, uA: { value: new THREE.Color(spec.a) }, uB: { value: new THREE.Color(spec.b) },
        uRim: { value: new THREE.Color(spec.rim) }, uBands: { value: spec.bands }, uSeed: { value: index * 7.3 }, uFocus: { value: 0 },
      },
      vertexShader: /* glsl */ `varying vec3 vNormal; varying vec3 vWorld; varying vec3 vObj;
        void main() { vObj = position; vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; vNormal = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * world; }`,
      fragmentShader: /* glsl */ `uniform float uTime; uniform vec3 uLight; uniform vec3 uA; uniform vec3 uB; uniform vec3 uRim; uniform float uBands; uniform float uSeed; uniform float uFocus;
        varying vec3 vNormal; varying vec3 vWorld; varying vec3 vObj;
        ${NOISE}
        void main() {
          vec3 n = normalize(vNormal);
          vec3 l = normalize(uLight - vWorld);
          vec3 v = normalize(cameraPosition - vWorld);
          vec3 q = normalize(vObj);
          float swirl = fbm(q * 2.4 + vec3(uSeed, uTime * 0.02, 0.0));
          float bands = 0.5 + 0.5 * sin(q.y * uBands + swirl * 4.0 + uSeed);
          vec3 base = mix(uA, uB, clamp(bands * 0.75 + swirl * 0.5, 0.0, 1.0));
          float diffuse = smoothstep(-0.18, 0.75, dot(n, l));
          float rim = pow(1.0 - max(dot(n, v), 0.0), 2.6);
          vec3 color = base * (0.12 + diffuse * 1.1) + uRim * rim * (0.25 + diffuse * 0.9) * (1.0 + uFocus);
          gl_FragColor = vec4(color, 1.0);
        }`,
    }));
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(track(new THREE.SphereGeometry(spec.radius, 48, 32)), material);
    mesh.rotation.z = 0.35;
    group.add(mesh);
    if (spec.ring) {
      const ringMaterial = track(new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#cdbdff") } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uColor; varying vec2 vUv;
          void main() { float r = length(vUv - 0.5) * 2.0; float bands = 0.55 + 0.45 * sin(r * 70.0) * sin(r * 23.0);
            float a = smoothstep(0.58, 0.64, r) * smoothstep(1.0, 0.9, r) * bands * 0.55; gl_FragColor = vec4(uColor * a, a); }`,
        transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
      }));
      const ring = new THREE.Mesh(track(new THREE.PlaneGeometry(spec.radius * 4.6, spec.radius * 4.6)), ringMaterial);
      ring.rotation.x = -Math.PI / 2 + 0.28;
      group.add(ring);
    }
    system.add(group);

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * spec.orbit, 0, Math.sin(a) * spec.orbit));
    }
    const orbitMaterial = track(new THREE.LineBasicMaterial({ color: new THREE.Color(spec.rim), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    const orbitLine = new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(points)), orbitMaterial);
    system.add(orbitLine);
    return { group, mesh, material, radius: spec.radius, orbit: spec.orbit, speed: spec.speed, phase: spec.phase, orbitLine };
  });

  // Packets of light running along the orbits once the system works.
  const packetsPerOrbit = narrow ? 4 : 6;
  const packetCount = packetsPerOrbit * PLANETS.length;
  const packetPositions = new Float32Array(packetCount * 3);
  const packetColors = new Float32Array(packetCount * 3);
  PLANETS.forEach((spec, p) => {
    const color = new THREE.Color(spec.rim);
    for (let k = 0; k < packetsPerOrbit; k++) packetColors.set([color.r, color.g, color.b], (p * packetsPerOrbit + k) * 3);
  });
  const packetGeometry = track(new THREE.BufferGeometry());
  packetGeometry.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));
  packetGeometry.setAttribute("color", new THREE.BufferAttribute(packetColors, 3));
  const packetMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uPixel: { value: dpr }, uRun: { value: 0 } },
    vertexShader: /* glsl */ `attribute vec3 color; uniform float uPixel; varying vec3 vColor;
      void main() { vColor = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uPixel * 26.0 / -mv.z * 4.6; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform float uRun; varying vec3 vColor;
      void main() { float d = length(gl_PointCoord - 0.5) * 2.0; float g = exp(-d * 5.0) + exp(-d * 18.0); gl_FragColor = vec4(mix(vColor, vec3(1.0), 0.5) * g * uRun, g * uRun); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  const packets = new THREE.Points(packetGeometry, packetMaterial);
  packets.frustumCulled = false;
  system.add(packets);

  // Speed lines in camera space: they only show while the scroll is moving fast.
  const lineCount = narrow ? 160 : 360;
  const lineSegments = new Float32Array(lineCount * 2 * 4); // x, y, seed, speed
  const lineTails = new Float32Array(lineCount * 2);
  for (let i = 0; i < lineCount; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 2.2 + random() * 7;
    const seed = random();
    const speed = 0.6 + random() * 0.8;
    for (let end = 0; end < 2; end++) {
      lineSegments.set([Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, seed, speed], (i * 2 + end) * 4);
      lineTails[i * 2 + end] = end;
    }
  }
  const lineGeometry = track(new THREE.BufferGeometry());
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineCount * 2 * 3), 3));
  lineGeometry.setAttribute("segment", new THREE.BufferAttribute(lineSegments, 4));
  lineGeometry.setAttribute("tail", new THREE.BufferAttribute(lineTails, 1));
  const lineMaterial = track(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uWarp: { value: 0 } },
    vertexShader: /* glsl */ `attribute vec4 segment; attribute float tail; uniform float uTime; uniform float uWarp; varying float vAlpha;
      void main() {
        float z = -2.0 - fract(segment.z - uTime * 0.35 * segment.w) * 42.0;
        z -= tail * (0.2 + uWarp * 7.0);
        vAlpha = uWarp * (1.0 - tail * 0.85) * smoothstep(-44.0, -10.0, z);
        gl_Position = projectionMatrix * vec4(segment.x, segment.y, z, 1.0);
      }`,
    fragmentShader: /* glsl */ `varying float vAlpha; void main() { gl_FragColor = vec4(vec3(0.62, 0.9, 1.0) * vAlpha, vAlpha); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const speedLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  speedLines.frustumCulled = false;
  camera.add(speedLines);
  scene.add(camera);

  // ── State ─────────────────────────────────────────────────────────────────────────────────────────────
  const path = narrow ? PATH_NARROW : PATH_WIDE;
  const positions = new THREE.CatmullRomCurve3(path.map(key => new THREE.Vector3(...key.pos)));
  const targets = new THREE.CatmullRomCurve3(path.map(key => new THREE.Vector3(...key.target)));
  let progress = reduced ? 0.6 : 0;
  let shownProgress = progress;
  let stage: number | null = null;
  let focus = 0;
  let playing = !reduced;
  let time = 0;
  let warp = 0;
  let lastProgress = progress;
  const pointer = new THREE.Vector2();
  const smoothPointer = new THREE.Vector2();
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const focusTarget = new THREE.Vector3();
  const worldPos = new THREE.Vector3();
  const projected = new THREE.Vector3();
  let width = 1, height = 1;

  // Map scroll progress to the curve parameter through the keyframes (the curve's own parameter is uniform).
  const curveAt = (p: number) => {
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      if (p <= b.p) {
        const local = (p - a.p) / (b.p - a.p);
        const eased = local * local * (3 - 2 * local);
        return (i + eased) / (path.length - 1);
      }
    }
    return 1;
  };

  const corePos = new THREE.Vector3();
  const coreScreen = new THREE.Vector2();
  let starRadius = 0; // the star's radius on screen, in pixels
  // A planet passing behind the star hides its label instead of printing it over the light.
  const behindStar = (object: THREE.Object3D) => {
    object.getWorldPosition(worldPos);
    const distance = worldPos.distanceTo(camera.position);
    const coreDistance = corePos.distanceTo(camera.position);
    if (distance <= coreDistance) return 0;
    projected.copy(worldPos).project(camera);
    const pixels = Math.hypot((projected.x - coreScreen.x) * width / 2, (projected.y - coreScreen.y) * height / 2);
    return 1 - smooth(starRadius * 1.1, starRadius * 1.8, pixels);
  };

  const placeLabel = (element: HTMLElement | null, object: THREE.Object3D, visibility: number, lift: number) => {
    if (!element) return;
    object.getWorldPosition(worldPos);
    worldPos.y += lift;
    projected.copy(worldPos).project(camera);
    const behind = projected.z > 1;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    // Nor is any planet label printed over the star's disc.
    const overStar = object === core ? 1 : smooth(starRadius * 1.6, starRadius * 2.8, Math.hypot((projected.x - coreScreen.x) * width / 2, (projected.y - coreScreen.y) * height / 2));
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    element.style.opacity = behind ? "0" : (visibility * overStar).toFixed(3);
  };

  const draw = (delta: number) => {
    if (playing) time += delta;
    shownProgress += (progress - shownProgress) * (reduced || !playing ? 1 : Math.min(1, delta * 7 || 1));
    const p = shownProgress;
    const velocity = delta > 0 ? Math.abs(p - lastProgress) / delta : 0;
    lastProgress = p;
    warp += (Math.min(1, velocity * 2.2) - warp) * Math.min(1, delta * 5 || 1);

    const form = smooth(0.1, 0.48, p);
    const run = smooth(0.46, 0.74, p);
    const exit = smooth(0.84, 1, p);
    focus += ((stage === null ? 0 : 1) - focus) * Math.min(1, delta * 4 || 1);

    // Camera along the path, a gentle pointer parallax and a nudge toward the selected planet.
    const u = curveAt(p);
    positions.getPoint(u, camPos);
    targets.getPoint(u, camTarget);
    smoothPointer.lerp(pointer, Math.min(1, delta * 3 || 1));
    camPos.x += smoothPointer.x * 0.9;
    camPos.y += smoothPointer.y * 0.5;
    if (stage !== null) {
      planets[stage].group.getWorldPosition(focusTarget);
      camTarget.lerp(focusTarget, 0.35 * focus);
    }
    camera.position.copy(camPos);
    camera.lookAt(camTarget);
    // On wide screens the text owns the left column: slide the image right as the system grows, back at the dive.
    // On phones the text sits at the bottom instead: lift the system into the upper half.
    const shift = 0.1 * smooth(0.22, 0.44, p);
    // Reduced motion: on wide screens the system sits right of the headline, above its panel; on phones the stage
    // flows and the system fills the gap between the headline and the panel.
    if (narrow && reduced) camera.setViewOffset(width, height, 0, -height * 0.06, width, height);
    else if (narrow) camera.setViewOffset(width, height, 0, height * shift * (1 - exit), width, height);
    else if (reduced) camera.setViewOffset(width, height, -width * 0.2, height * 0.07, width, height);
    else camera.setViewOffset(width, height, -width * shift * (1 - exit), 0, width, height);
    // Labels project before render(): bring the view matrix up to date for this frame.
    camera.updateMatrixWorld();

    // Star and its light.
    core.getWorldPosition(lightPosition);
    corePos.copy(lightPosition);
    projected.copy(corePos).project(camera);
    coreScreen.set(projected.x, projected.y);
    // Act 1: a point of light (small core, filled hot centre); it grows into a star as the system forms.
    const grow = smooth(0.04, 0.42, p);
    const coreScale = Math.max(0.001, (0.38 + 0.62 * grow) * (1 - smooth(0.86, 0.97, p)));
    const glowScale = (0.8 + 0.2 * grow) * (1 + exit * exit * 5);
    core.scale.setScalar(coreScale);
    starRadius = CORE_RADIUS * coreScale / corePos.distanceTo(camera.position) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * height / 2;
    coreMaterial.uniforms.uTime.value = time;
    coreMaterial.uniforms.uBoost.value = exit * 0.4;
    glow.scale.setScalar(glowScale);
    glowMaterial.uniforms.uTime.value = time;
    glowMaterial.uniforms.uCore.value = (CORE_RADIUS * coreScale) / (GLOW_SIZE / 2 * glowScale);
    glowMaterial.uniforms.uFill.value = (1 - grow) * 1.6;
    glowMaterial.uniforms.uBloom.value = exit;
    glowMaterial.uniforms.uIntensity.value = 1.1 - form * 0.2 + exit * 2.4;
    glowMaterial.uniforms.uLift.value = streakMaterial.uniforms.uLift.value = CORE_RADIUS * coreScale * 1.05;
    streakMaterial.uniforms.uIntensity.value = (1 - form * 0.55) * 1.1 + exit * 1.2;
    starMaterial.uniforms.uTime.value = time;
    starMaterial.uniforms.uFade.value = 1 - exit * 0.6;

    // Dust condenses onto the planets' lanes.
    dustMaterial.uniforms.uTime.value = time;
    dustMaterial.uniforms.uForm.value = form;
    dustMaterial.uniforms.uExit.value = exit;

    planets.forEach((planet, index) => {
      const angle = planet.phase + time * planet.speed;
      planet.group.position.set(Math.cos(angle) * planet.orbit, 0, Math.sin(angle) * planet.orbit);
      const selected = stage === index ? focus : 0;
      planet.group.scale.setScalar(Math.max(0.0001, smooth(0.08 + index * 0.06, 0.4 + index * 0.06, p)) * (1 + selected * 0.12));
      planet.mesh.rotation.y = time * 0.18;
      planet.material.uniforms.uTime.value = time;
      planet.material.uniforms.uFocus.value = selected;
      (planet.orbitLine.material as THREE.LineBasicMaterial).opacity = form * (0.16 + run * 0.16 + selected * 0.4) * (1 - exit);
      placeLabel(labels[index], planet.group, form * (1 - exit) * smooth(0.18, 0.4, p) * (1 - behindStar(planet.group)), planet.radius + 0.55);
    });
    placeLabel(coreLabel, core, smooth(0.3, 0.45, p) * (1 - exit), -1.6);

    // Packets: evenly spaced along each orbit, slightly ahead of their planet.
    for (let o = 0; o < planets.length; o++) {
      const planet = planets[o];
      for (let k = 0; k < packetsPerOrbit; k++) {
        const angle = planet.phase + time * (planet.speed * 4.5) + (k / packetsPerOrbit) * Math.PI * 2;
        packetPositions.set([Math.cos(angle) * planet.orbit, 0, Math.sin(angle) * planet.orbit], (o * packetsPerOrbit + k) * 3);
      }
    }
    packetGeometry.attributes.position.needsUpdate = true;
    packetMaterial.uniforms.uRun.value = run * (1 - exit);

    lineMaterial.uniforms.uTime.value = time;
    lineMaterial.uniforms.uWarp.value = reduced ? 0 : warp;

    renderer.render(scene, camera);
  };

  const resize = () => {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    loop?.invalidate();
  };
  let loop: ReturnType<typeof createRenderLoop> | null = null;
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let disposed = false;
  // Compile every program off the main thread before the first frame. GPU resources are released only after it settles:
  // three keeps polling the programs until they link and throws if they are disposed underneath it.
  const compiled = renderer.compileAsync(scene, camera).catch(() => {});
  compiled.then(() => {
    if (disposed) return;
    loop = createRenderLoop(host, draw, { fps: 60, enabled: () => playing });
    loop.invalidate();
    onReady();
  });

  return {
    setProgress(next) {
      progress = Math.min(1, Math.max(0, next));
      if (reduced) shownProgress = progress;
      loop?.invalidate();
    },
    setStage(next) { stage = next; loop?.invalidate(); },
    setPointer(x, y) { pointer.set(x, y); if (playing) loop?.refresh(); },
    setPlaying(next) { playing = next && !reduced; loop?.invalidate(); },
    dispose() {
      disposed = true;
      loop?.dispose();
      observer.disconnect();
      compiled.then(() => {
        disposables.forEach(item => item.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      });
    },
  };
}
