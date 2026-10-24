/** Pure helpers for the ASCII ringed planet: grid, shading, bands, ring, stars, colour buckets and decode schedule. */

/** Dark → light glyphs by ink coverage in JetBrains Mono. */
export const PLANET_RAMP = " .:-=+*o#%@";
/** Background star glyphs, faint → bright. */
export const STAR_GLYPHS = ".·+*";
/** Glyphs that flicker in rows that are still "decoding". */
export const DECODE_GLYPHS = "01<>/{}[]=+*";
/** Ring glyphs, sparse → dense. */
export const RING_GLYPHS = "·-~=";
/** Every glyph the canvas draws; a cell stores an index into it (0 = blank). */
export const CHARS = PLANET_RAMP + STAR_GLYPHS + RING_GLYPHS + DECODE_GLYPHS;
const STAR_BASE = PLANET_RAMP.length;
const RING_BASE = STAR_BASE + STAR_GLYPHS.length;
export const DECODE_BASE = RING_BASE + RING_GLYPHS.length;

const BODY_TONES = 6;
/** Colour buckets: one `fillStyle` each. */
export const BUCKETS = Object.freeze({
  BODY: 0, BODY_TONES, RING_DIM: BODY_TONES, RING: BODY_TONES + 1, RIM: BODY_TONES + 2, STAR: BODY_TONES + 3,
  FRONT: BODY_TONES + 4, MOON: BODY_TONES + 5, COUNT: BODY_TONES + 6,
});

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mixRgb(a, b, t) {
  return a.map((v, k) => Math.round(v + (b[k] - v) * t));
}
const toHex = rgb => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');

const BODY_DARK = hexToRgb('#2a1b52'), BODY_LIGHT = hexToRgb('#b9a5ff');
export const BUCKET_COLORS = [
  ...Array.from({ length: BODY_TONES }, (_, k) => toHex(mixRgb(BODY_DARK, BODY_LIGHT, k / (BODY_TONES - 1)))),
  '#7f70b8', '#cdbdff', '#9ff3f0', '#adf3ed', '#eafcff', '#e4dcff',
];

/** Rows for `cols` columns so that cells of `charAspect` em × `lineHeight` em fill a square. */
export function gridRows(cols, { charAspect = 0.6, lineHeight = 1.2 } = {}) {
  return Math.max(1, Math.round((cols * charAspect) / lineHeight));
}

/** Luminance in [0, 1] → index into PLANET_RAMP. */
export function rampIndex(v) {
  return Math.round(clamp01(v) * (PLANET_RAMP.length - 1));
}

// Light from the upper left, a little toward the viewer (screen y grows downward).
const LIGHT = (() => { const l = [-0.55, -0.6, 0.58], n = Math.hypot(...l); return l.map(v => v / n); })();

/** Lambert term with a soft terminator for a unit-sphere normal (x, y, z) in screen space. */
export function sphereShade(x, y, z) {
  const d = x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2];
  return smoothstep(-0.18, 0.95, d);
}

/** Integer hash → [0, 1). */
function hash01(n) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Gas-giant bands at latitude `lat` and longitude `lon` (radians) once the planet has turned by `rotation`. */
export function bandValue(lat, lon, rotation) {
  const L = lon + rotation;
  // Periodic in longitude, so the texture wraps around the globe without a seam.
  const noise = 0.5 * Math.sin(2 * L + 1.3 + 4 * lat) + 0.3 * Math.sin(3 * L + 0.4 - 6 * lat) + 0.2 * Math.sin(5 * L + 2.1 + 9 * lat);
  return clamp01(0.5 + 0.34 * Math.sin(9 * lat + 0.8 * Math.sin(3.1 * lat) + 0.55 * noise) + 0.14 * noise);
}

/** Ring opacity at radius `r` (planet radii): soft edges and a Cassini-like gap. */
export function ringDensity(r) {
  const body = smoothstep(1.18, 1.28, r) * (1 - smoothstep(1.58, 1.68, r));
  const gap = 1 - 0.85 * (1 - smoothstep(0, 0.05, Math.abs(r - 1.5)));
  const ripple = 0.9 + 0.1 * Math.sin(r * 17);
  return clamp01(body * gap * ripple);
}

/**
 * The ring under screen point (x, y), both in [-1, 1] over the square, or null.
 * `front` is true on the near half, which passes in front of the planet; the far half hides behind it.
 */
export function ringAt(x, y, { radius, inner, outer, tilt, roll }) {
  const c = Math.cos(roll), s = Math.sin(roll);
  const xp = x * c + y * s, yp = -x * s + y * c;
  const u = xp / radius, v = yp / (radius * Math.sin(tilt));
  const r = Math.hypot(u, v);
  if (r < inner || r > outer) return null;
  return { r, theta: Math.atan2(v, u), front: v >= 0 };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `count` stars in distinct cells of a cols × rows grid, from `seed`. */
export function starField(cols, rows, count, seed) {
  const rand = mulberry32(seed);
  const used = new Set(), stars = [];
  while (stars.length < count && used.size < cols * rows) {
    const i = Math.floor(rand() * cols * rows);
    if (used.has(i)) continue;
    used.add(i);
    stars.push({ i, base: Math.floor(rand() * 3), phase: Math.floor(rand() * 16), period: 3 + Math.floor(rand() * 5) });
  }
  return stars;
}

/** The glyph a star shows at animation tick `t` (blank while it dims out). */
export function twinkle(star, t) {
  const step = Math.floor((t + star.phase) / star.period);
  const level = star.base + Math.floor(hash01(star.i * 131 + step) * 3) - 1;
  return level < 0 ? ' ' : STAR_GLYPHS[Math.min(STAR_GLYPHS.length - 1, level)];
}

// Disc ≈ 57 % of the width; ring seen ~72° from face-on (elevation 0.3 rad).
const DEFAULTS = { radius: 0.57, inner: 1.2, outer: 1.66, tilt: 0.3, roll: -0.28, stars: 36, seed: 7 };

const MOON = { orbit: 0.84, flatten: 0.36, roll: 0.22, radius: 0.075 };

/** Screen position of the moon at orbital angle `phase`; `front` on the near half of its orbit. */
export function moonAt(phase) {
  const u = MOON.orbit * Math.cos(phase), v = MOON.orbit * MOON.flatten * Math.sin(phase);
  const c = Math.cos(MOON.roll), s = Math.sin(MOON.roll);
  return { x: u * c - v * s, y: u * s + v * c, front: Math.sin(phase) >= 0 };
}

/** Per-cell geometry that does not change while the planet turns. */
export function planetGeometry(cols, rows, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const n = cols * rows;
  const planet = new Uint8Array(n), rim = new Uint8Array(n);
  const lat = new Float32Array(n), lon = new Float32Array(n), shade = new Float32Array(n);
  const ring = new Float32Array(n).fill(-1), ringTheta = new Float32Array(n), ringFront = new Uint8Array(n);
  const star = new Int16Array(n).fill(-1);
  const c = Math.cos(o.roll), s = Math.sin(o.roll), ct = Math.cos(o.tilt), st = Math.sin(o.tilt);
  for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
    const i = r * cols + col;
    const x = ((col + 0.5) / cols) * 2 - 1, y = ((r + 0.5) / rows) * 2 - 1;
    const nx = x / o.radius, ny = y / o.radius, rho = Math.hypot(nx, ny);
    if (rho <= 1) {
      const nz = Math.sqrt(1 - rho * rho);
      planet[i] = 1;
      shade[i] = sphereShade(nx, ny, nz);
      // Body frame: undo the roll, then tip the spin axis by the ring tilt.
      const xp = nx * c + ny * s, yp = -nx * s + ny * c;
      const yb = yp * ct - nz * st, zb = yp * st + nz * ct;
      lat[i] = Math.asin(Math.max(-1, Math.min(1, yb)));
      lon[i] = Math.atan2(xp, zb);
      if (rho > 0.8 && (nx * -0.68 + ny * -0.73) / rho > 0.3) rim[i] = 1;
    }
    const hit = ringAt(x, y, o);
    if (hit) {
      const d = ringDensity(hit.r);
      if (d > 0.08) { ring[i] = d; ringTheta[i] = hit.theta; ringFront[i] = hit.front ? 1 : 0; }
    }
  }
  const stars = starField(cols, rows, o.stars, o.seed).filter(st => !planet[st.i] && ring[st.i] < 0);
  stars.forEach((st, k) => { star[st.i] = k; });
  return { cols, rows, planet, rim, lat, lon, shade, ring, ringTheta, ringFront, star, stars };
}

/**
 * Fills `chars` (indices into CHARS) and `buckets` (colour bucket per cell) for one frame.
 * `rotation` turns the bands, `boost` ∈ [0, 1] brightens the ring, `tick` drives the stars, `moonPhase` places the moon.
 * @param {ReturnType<typeof planetGeometry>} geo
 * @param {number} rotation
 * @param {number} boost
 * @param {number} tick
 * @param {Uint8Array} chars
 * @param {Uint8Array} buckets
 * @param {number | null} [moonPhase]
 */
export function planetFrame(geo, rotation, boost, tick, chars, buckets, moonPhase = null) {
  const { cols, rows, planet, rim, lat, lon, shade, ring, ringTheta, ringFront, star, stars } = geo;
  const ringGain = 0.62 + 0.38 * boost;
  for (let i = 0; i < chars.length; i++) {
    const d = ring[i];
    if (d >= 0 && (ringFront[i] || !planet[i])) {
      const v = d * ringGain * (0.86 + 0.14 * Math.sin(6 * ringTheta[i] + 0.8 * rotation));
      const g = v > 0.72 ? 3 : v > 0.48 ? (Math.sin(9 * ringTheta[i] - 1.1 * rotation) > 0.2 ? 2 : 1) : v > 0.3 ? 1 : 0;
      chars[i] = RING_BASE + g;
      buckets[i] = v > 0.5 ? BUCKETS.RING : BUCKETS.RING_DIM;
      continue;
    }
    if (planet[i]) {
      // A little ambient light keeps the night side readable as faint '.' and ':'.
      const band = bandValue(lat[i], lon[i], rotation);
      const v = 0.13 + 0.08 * band + 0.79 * shade[i] * (0.5 + 0.5 * band);
      if (rim[i]) {
        chars[i] = rampIndex(Math.max(v, 0.6));
        buckets[i] = BUCKETS.RIM;
      } else {
        chars[i] = rampIndex(v);
        buckets[i] = BUCKETS.BODY + Math.min(BODY_TONES - 1, Math.floor(v * BODY_TONES));
      }
      continue;
    }
    const k = star[i];
    if (k >= 0) {
      const g = twinkle(stars[k], tick);
      chars[i] = g === ' ' ? 0 : STAR_BASE + STAR_GLYPHS.indexOf(g);
      buckets[i] = BUCKETS.STAR;
      continue;
    }
    chars[i] = 0;
  }
  if (moonPhase === null) return;
  const m = moonAt(moonPhase);
  const c0 = Math.max(0, Math.floor(((m.x - MOON.radius + 1) / 2) * cols)), c1 = Math.min(cols - 1, Math.floor(((m.x + MOON.radius + 1) / 2) * cols));
  const r0 = Math.max(0, Math.floor(((m.y - MOON.radius + 1) / 2) * rows)), r1 = Math.min(rows - 1, Math.floor(((m.y + MOON.radius + 1) / 2) * rows));
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const i = r * cols + c;
    const nx = (((c + 0.5) / cols) * 2 - 1 - m.x) / MOON.radius, ny = (((r + 0.5) / rows) * 2 - 1 - m.y) / MOON.radius;
    const d = nx * nx + ny * ny;
    // Behind, the disc and the near ring hide it.
    if (d > 1.15 || (!m.front && (planet[i] || (ring[i] >= 0 && ringFront[i])))) continue;
    chars[i] = rampIndex(0.3 + 0.7 * sphereShade(nx, ny, Math.sqrt(Math.max(0, 1 - d))));
    buckets[i] = BUCKETS.MOON;
  }
}

/** Time (ms) at which row `row` of `rows` finishes decoding; the last row lands at 85 % of `duration`. */
export function revealRow(row, rows, duration) {
  return rows <= 1 ? 0 : (row / (rows - 1)) * duration * 0.85;
}

/** Deterministic pseudo-random glyph index for cell `i` at animation tick `tick`. */
export function scrambleIndex(i, tick, n) {
  return Math.floor(hash01(i * 7919 + tick * 104729) * n);
}
