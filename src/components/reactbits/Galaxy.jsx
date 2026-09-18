"use client";

// React Bits source supplied by the user; see LICENSE.md.
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Galaxy.css';
import { createRenderLoop } from '@/lib/renderLoop.mjs';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;
uniform bool uVortex;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}



// Continuous noise in Cartesian space avoids seams at the polar angle boundary.
float cloudNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(Hash21(i), Hash21(i + vec2(1,0)), f.x),
             mix(Hash21(i + vec2(0,1)), Hash21(i + vec2(1,1)), f.x), f.y);
}
float dustCloud(vec2 p) {
  float value = 0.0, weight = 0.5;
  for (int i = 0; i < 5; i++) {
    value += cloudNoise(p) * weight;
    p = mat2(0.8, -0.6, 0.6, 0.8) * p * 2.1 + 7.3;
    weight *= 0.5;
  }
  return value;
}
vec3 accretion(vec2 p, float radius) {
  p /= radius;
  p = mat2(0.96, -0.28, 0.28, 0.96) * p;
  p.y *= 1.3;
  float r = length(p);
  float angle = atan(p.y, p.x);
  float t = uTime * 0.045;
  float spin = t + 1.8 * log(r + 0.16);
  vec2 flow = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * p;
  float clouds = dustCloud(flow * 6.0);
  float fine = dustCloud(flow * 26.0);
  float phase = angle * 3.0 + 6.0 * log(r + 0.18) - t * 3.0;
  float arms = pow(0.5 + 0.5 * cos(phase + (clouds - 0.5) * 2.0), 5.0);
  float envelope = exp(-r * 1.9) * (1.0 - smoothstep(1.6, 2.2, r));
  float lanes = pow(clouds, 1.6) * (0.2 + fine * 1.8);
  float nebula = envelope * (0.15 + arms * 2.7) * lanes;
  float rim = exp(-pow((r - 0.285) / 0.022, 2.0));
  float dust = smoothstep(0.38, 0.7, fine) * arms * envelope;
  vec3 blue = mix(vec3(0.11, 0.21, 0.48), vec3(0.22, 0.65, 0.96), fine);
  vec3 light = blue * nebula * 2.6 + vec3(0.35, 0.68, 0.94) * rim * 0.3;
  light += vec3(0.58, 0.79, 1.0) * dust * 0.7;
  // Embedded star clusters follow the same spiral density as the cloud.
  vec2 grain = flow * 180.0;
  float seed = Hash21(floor(grain));
  float star = exp(-length(fract(grain) - 0.5) * 20.0) * step(0.975, seed);
  light += vec3(0.72, 0.87, 1.0) * star * arms * envelope * 4.0;
  return light * (0.97 + 0.02 * sin(uTime * 3.7) + 0.01 * sin(uTime * 8.1));
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  vec2 diskUV = uv;
  float diskRadius = clamp(uResolution.x / uResolution.y * 0.19, 0.23, 0.34);
  if (uVortex) {
    // Lens and rotation are strongest at the rim, fading into the surrounding stars.
    float r = length(uv);
    float lens = exp(-abs(r - diskRadius) * 15.0);
    float twist = lens * 0.35 + 0.035 / (r + 0.12);
    uv = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * uv;
    uv *= 1.0 + lens * 0.18;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uVortex) {
    float r = length(diskUV) / diskRadius;
    col *= (0.25 + 0.75 * smoothstep(0.0, 1.4, r)) * 0.6;
    col += accretion(diskUV, diskRadius);
    col = vec3(1.0) - exp(-col * 1.4);
    vec2 coreUV = mat2(0.96, -0.28, 0.28, 0.96) * diskUV / diskRadius;
    coreUV.y *= 1.3;
    col *= smoothstep(0.24, 0.285, length(coreUV));
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

const DEFAULT_FOCAL = [0.5, 0.5];
const DEFAULT_ROTATION = [1, 0];

export default function Galaxy({
  focal = DEFAULT_FOCAL,
  vortex = false,
  rotation = DEFAULT_ROTATION,
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  lightMode = false,
  ...rest
}) {
  const ctnDom = useRef(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);

  const loopRef = useRef(null);
  const disabledRef = useRef(disableAnimation);
  useEffect(() => { disabledRef.current = disableAnimation; loopRef.current?.refresh(); }, [disableAnimation]);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    let renderer;
    try { renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
      dpr: 0.75
    }); } catch { return; }
    const gl = renderer.gl;

    if (lightMode) {
      gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;


    function resize() {
      loopRef.current?.invalidate();
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      if (program) {
        if (vortex) program.uniforms.uFocal.value = new Float32Array([0.5, 0.86]);
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(ctn);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uVortex: { value: vortex },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uFocal: { value: new Float32Array(vortex ? [0.5, 0.86] : focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y])
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let elapsed = 0;
    function update(dt) {
      if (!disabledRef.current) elapsed += dt;
      program.uniforms.uTime.value = elapsed;
      program.uniforms.uStarSpeed.value = (elapsed * starSpeed) / 10.0;

      const lerpFactor = 1 - Math.pow(0.95, dt * 60);
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;

      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    }
    const loop = createRenderLoop(ctn, update, { enabled: () => !disabledRef.current });
    loopRef.current = loop;
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMousePos.current = { x, y };
      targetMouseActive.current = 1.0;
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0;
    }

    const eventTarget = ctn.closest('section') || ctn;
    if (mouseInteraction) {
      eventTarget.addEventListener('mousemove', handleMouseMove);
      eventTarget.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      loop.dispose();
      loopRef.current = null;
      resizeObserver.disconnect();
      if (mouseInteraction) {
        eventTarget.removeEventListener('mousemove', handleMouseMove);
        eventTarget.removeEventListener('mouseleave', handleMouseLeave);
      }
      ctn.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    focal,
    vortex,
    rotation,
    starSpeed,
    density,
    hueShift,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    transparent,
    lightMode
  ]);

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
}

