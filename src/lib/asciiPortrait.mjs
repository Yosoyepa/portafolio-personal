/** Pure helpers for the ASCII portrait: tone mapping, glyph ramp, accents and animation schedule. */

/** Dark → light: 16 JetBrains Mono glyphs in near-even steps of measured ink coverage (0 → 0.356 of the cell). */
export const ASCII_RAMP = " .,:~+rvuew#8%B@";
/** Glyphs that flicker in cells that are still "decoding" or scrambled by the lens. */
export const DECODE_GLYPHS = "01<>/{}[]=+*";

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/** Integer hash → [0, 1). */
function hash01(n) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
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

/** Rows for `cols` columns so that cells of `charAspect` em × `lineHeight` em keep the image aspect (h / w). */
export function gridRows(cols, { charAspect = 0.6, lineHeight = 1, imageAspect = 1 } = {}) {
  return Math.max(1, Math.round((cols * imageAspect * charAspect) / lineHeight));
}

/** Rec. 709 luma of 8-bit sRGB channels, in [0, 1]. */
export function luma(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Low and high percentiles of `values`, counting only cells whose weight is at least `minWeight`. */
export function percentileRange(values, low, high, weights, minWeight = 0.5) {
  const picked = [];
  for (let i = 0; i < values.length; i++) if (!weights || weights[i] >= minWeight) picked.push(values[i]);
  if (!picked.length) return [0, 1];
  picked.sort((a, b) => a - b);
  const at = p => picked[Math.round(clamp01(p) * (picked.length - 1))];
  return [at(low), at(high)];
}

/** Stretches [lo, hi] onto [0, 1]; a flat range passes the value through. */
export function levels(v, lo, hi) {
  return hi - lo < 1e-6 ? clamp01(v) : clamp01((v - lo) / (hi - lo));
}

/** Symmetric S-curve around ½; k = 1 is the identity, k > 1 adds contrast. */
export function contrastCurve(v, k) {
  const x = clamp01(v);
  return x < 0.5 ? 0.5 * Math.pow(2 * x, k) : 1 - 0.5 * Math.pow(2 * (1 - x), k);
}

/** Circular vignette over a cols × rows grid (1 = inside `inner`, 0 beyond `outer`; radii in half-widths). */
export function vignette(x, y, cols, rows, inner = 0.62, outer = 0.98) {
  const u = (x + 0.5) / cols - 0.5, v = (y + 0.5) / rows - 0.5;
  return 1 - smoothstep(inner, outer, Math.hypot(u, v) / 0.5);
}

/** Unsharp mask on a cols × rows grid: v + amount · (v − box blur of radius `radius`), edges clamped. */
export function unsharp(values, cols, rows, amount, radius = 1) {
  const out = new Float32Array(values.length);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    let sum = 0, count = 0;
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const yy = Math.min(rows - 1, Math.max(0, y + dy)), xx = Math.min(cols - 1, Math.max(0, x + dx));
      sum += values[yy * cols + xx]; count++;
    }
    const i = y * cols + x;
    out[i] = values[i] + amount * (values[i] - sum / count);
  }
  return out;
}

/** Ramp index for a tone in [0, 1] (equal-width bins). */
export function glyphIndex(v, n) {
  return Math.min(n - 1, Math.floor(clamp01(v) * n));
}

export function hexToRgb(hex) {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixRgb(a, b, t) {
  return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));
}

/** Per-channel median of the top edge and the upper side edges: the backdrop of a headshot (the torso fills the bottom). */
export function estimateBackground({ data, width, height }) {
  const channels = [[], [], []];
  for (let y = 0; y < height * 0.6; y++) for (let x = 0; x < width; x++) {
    if (y > 0 && x > 0 && x < width - 1) continue;
    const o = (y * width + x) * 4;
    for (let c = 0; c < 3; c++) channels[c].push(data[o + c]);
  }
  return channels.map(list => { list.sort((a, b) => a - b); return list[list.length >> 1]; });
}

/** 0 for colours close to the backdrop, 1 for colours clearly apart from it (normalised RGB distance). */
export function keyWeight(r, g, b, bg, near = 0.07, far = 0.2) {
  const d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]) / (255 * Math.sqrt(3));
  return smoothstep(near, far, d);
}

/** Marks ≈ `ratio` of the inked cells (value > 0) as accents, drawn only from cells of at least `minValue`. */
export function pickAccents(values, ratio, seed, minValue) {
  const out = new Uint8Array(values.length);
  let inked = 0, candidates = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 0) inked++;
    if (values[i] > 0 && values[i] >= minValue) candidates++;
  }
  if (!candidates || ratio <= 0) return out;
  const p = (ratio * inked) / candidates, rand = mulberry32(seed);
  for (let i = 0; i < values.length; i++) if (values[i] > 0 && values[i] >= minValue && rand() < p) out[i] = 1;
  return out;
}

/**
 * Tone-maps a cols × rows RGBA sample (one pixel per cell) into ramp indices.
 * Luma is auto-levelled on the subject only (vignette × backdrop key), shaped by an S-curve and a gamma,
 * then lifted by `floor` so dark parts of the subject keep a faint glyph while the backdrop fades to black.
 */
export function buildPortrait({ data, width: cols, height: rows }, {
  low = 0.02, high = 0.995, contrast = 1.45, gamma = 1.4, sharpen = 0.9, floor = 0.1, inner = 0.62, outer = 0.98,
  key = true, near = 0.05, far = 0.13, accentRatio = 0.03, accentMin = 0.45, seed = 7, ramp = ASCII_RAMP,
} = {}) {
  const n = cols * rows, raw = new Float32Array(n), mask = new Float32Array(n);
  const bg = key ? estimateBackground({ data, width: cols, height: rows }) : null;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x, o = i * 4;
    raw[i] = luma(data[o], data[o + 1], data[o + 2]);
    mask[i] = vignette(x, y, cols, rows, inner, outer) * (bg ? keyWeight(data[o], data[o + 1], data[o + 2], bg, near, far) : 1);
  }
  const lum = sharpen > 0 ? unsharp(raw, cols, rows, sharpen) : raw;
  const [lo, hi] = percentileRange(lum, low, high, mask);
  const value = new Float32Array(n), glyph = new Uint8Array(n), ink = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tone = Math.pow(contrastCurve(levels(lum[i], lo, hi), contrast), gamma);
    const v = mask[i] * (floor + (1 - floor) * tone);
    value[i] = v;
    glyph[i] = glyphIndex(v, ramp.length);
    if (glyph[i] > 0) ink[i] = v;
  }
  return { cols, rows, value, glyph, mask, accent: pickAccents(ink, accentRatio, seed, accentMin) };
}

/** Time (ms) at which a cell resolves: rows top to bottom, each cell nudged by up to `jitter` × duration. */
export function revealAt(row, col, rows, duration, jitter = 0.05) {
  const base = (duration * (row + 1)) / rows;
  return base * (1 - jitter) + jitter * duration * hash01(row * 7919 + col * 104729);
}

/** Deterministic flicker glyph for cell `i` at animation tick `tick`. */
export function scrambleIndex(i, tick, n) {
  return Math.floor(hash01(Math.imul(i, 374761393) + Math.imul(tick, 668265263)) * n);
}

/** Smooth lens falloff: 1 at the centre, 0 at `radius`. */
export function lensWeight(dx, dy, radius) {
  const d = Math.hypot(dx, dy);
  return d >= radius ? 0 : smoothstep(0, 1, 1 - d / radius);
}
