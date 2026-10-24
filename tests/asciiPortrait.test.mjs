import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASCII_RAMP, DECODE_GLYPHS, gridRows, luma, percentileRange, levels, contrastCurve, vignette,
  unsharp, glyphIndex, hexToRgb, mixRgb, keyWeight, estimateBackground, pickAccents, buildPortrait,
  revealAt, scrambleIndex, lensWeight,
} from '../src/lib/asciiPortrait.mjs';

/** cols Ã— rows RGBA image; `paint(x, y)` returns [r, g, b]. */
function image(cols, rows, paint) {
  const data = new Uint8ClampedArray(cols * rows * 4);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const [r, g, b] = paint(x, y), o = (y * cols + x) * 4;
    data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255;
  }
  return { data, width: cols, height: rows };
}

test('ramps: dark-to-light ramp starts blank and has unique glyphs; decode glyphs are the brief set', () => {
  assert.equal(ASCII_RAMP[0], ' ');
  assert.ok(ASCII_RAMP.length >= 10);
  assert.equal(new Set(ASCII_RAMP).size, ASCII_RAMP.length);
  assert.equal(DECODE_GLYPHS, '01<>/{}[]=+*');
});

test('grid rows correct the mono cell aspect so the portrait stays square', () => {
  assert.equal(gridRows(72), 43); // 0.6 em advance, 1 em line
  assert.equal(gridRows(72, { lineHeight: 1.2 }), 36);
  assert.equal(gridRows(40, { imageAspect: 1.5 }), 36);
  assert.equal(gridRows(1), 1);
});

test('luma follows Rec. 709 weights on 8-bit channels', () => {
  assert.equal(luma(0, 0, 0), 0);
  assert.ok(Math.abs(luma(255, 255, 255) - 1) < 1e-9);
  assert.ok(luma(0, 255, 0) > luma(255, 0, 0));
  assert.ok(luma(255, 0, 0) > luma(0, 0, 255));
});

test('auto-levels: percentile range ignores low-weight cells and degenerates safely', () => {
  const values = Float32Array.from({ length: 100 }, (_, i) => i / 99);
  const [lo, hi] = percentileRange(values, 0.02, 0.98);
  assert.ok(lo > 0 && lo < 0.05, `lo=${lo}`);
  assert.ok(hi < 1 && hi > 0.95, `hi=${hi}`);
  const weights = Float32Array.from({ length: 100 }, (_, i) => (i < 50 ? 0 : 1));
  const [wlo] = percentileRange(values, 0, 1, weights);
  assert.ok(wlo >= 50 / 99 - 1e-6, `weighted lo=${wlo}`);
  const flat = percentileRange(new Float32Array(10).fill(0.4), 0.02, 0.98);
  assert.deepEqual(flat.map(v => +v.toFixed(5)), [0.4, 0.4]);
  assert.deepEqual(percentileRange(new Float32Array(0), 0, 1), [0, 1]);
});

test('levels stretch [lo, hi] onto [0, 1] and clamp', () => {
  assert.equal(levels(0.2, 0.2, 0.6), 0);
  assert.equal(levels(0.6, 0.2, 0.6), 1);
  assert.ok(Math.abs(levels(0.4, 0.2, 0.6) - 0.5) < 1e-9);
  assert.equal(levels(-1, 0.2, 0.6), 0);
  assert.equal(levels(2, 0.2, 0.6), 1);
  assert.equal(levels(0.3, 0.5, 0.5), 0.3); // flat range: pass through
});

test('contrast curve is an S-curve that keeps 0, Â½ and 1 fixed', () => {
  for (const k of [1, 1.6, 2.4]) {
    assert.equal(contrastCurve(0, k), 0);
    assert.equal(contrastCurve(1, k), 1);
    assert.ok(Math.abs(contrastCurve(0.5, k) - 0.5) < 1e-9);
  }
  assert.ok(Math.abs(contrastCurve(0.3, 1) - 0.3) < 1e-9);
  assert.ok(contrastCurve(0.25, 1.8) < 0.25);
  assert.ok(contrastCurve(0.75, 1.8) > 0.75);
  let prev = -1;
  for (let i = 0; i <= 50; i++) { const v = contrastCurve(i / 50, 1.8); assert.ok(v >= prev); prev = v; }
});

test('circular vignette: 1 in the centre, 0 in the corners, falling off radially', () => {
  assert.equal(vignette(35.5, 21, 72, 43), 1);
  assert.equal(vignette(0, 0, 72, 43), 0);
  assert.equal(vignette(71, 42, 72, 43), 0);
  const ring = [36, 46, 56, 66].map(x => vignette(x, 21, 72, 43));
  for (let i = 1; i < ring.length; i++) assert.ok(ring[i] <= ring[i - 1]);
  assert.ok(Math.abs(vignette(10, 21, 72, 43) - vignette(61, 21, 72, 43)) < 1e-9);
});

test('unsharp mask leaves flat areas alone and overshoots both sides of an edge', () => {
  const cols = 8, rows = 4;
  const flat = new Float32Array(cols * rows).fill(0.4);
  assert.ok(unsharp(flat, cols, rows, 1).every(v => Math.abs(v - 0.4) < 1e-6));
  const edge = Float32Array.from({ length: cols * rows }, (_, i) => (i % cols < 4 ? 0.2 : 0.6));
  const sharp = unsharp(edge, cols, rows, 1);
  assert.ok(sharp[1 * cols + 3] < 0.2, 'dark side darker');
  assert.ok(sharp[1 * cols + 4] > 0.6, 'bright side brighter');
  assert.ok(Math.abs(sharp[1 * cols + 0] - 0.2) < 1e-6, 'far from the edge unchanged');
  assert.deepEqual(unsharp(edge, cols, rows, 0), edge);
});

test('glyph index maps [0, 1] monotonically onto the ramp and clamps', () => {
  assert.equal(glyphIndex(0, 10), 0);
  assert.equal(glyphIndex(1, 10), 9);
  assert.equal(glyphIndex(-3, 10), 0);
  assert.equal(glyphIndex(7, 10), 9);
  let prev = 0;
  for (let i = 0; i <= 100; i++) { const g = glyphIndex(i / 100, 24); assert.ok(g >= prev); prev = g; }
});

test('colour helpers: hex parsing and linear mix', () => {
  assert.deepEqual(hexToRgb('#1f5f73'), [31, 95, 115]);
  assert.deepEqual(hexToRgb('adf3ed'), [173, 243, 237]);
  assert.deepEqual(mixRgb([31, 95, 115], [173, 243, 237], 0), [31, 95, 115]);
  assert.deepEqual(mixRgb([31, 95, 115], [173, 243, 237], 1), [173, 243, 237]);
  assert.deepEqual(mixRgb([0, 0, 0], [200, 100, 50], 0.5), [100, 50, 25]);
});

test('background key: estimates the border colour and drops pixels close to it', () => {
  const teal = [35, 96, 102];
  const img = image(20, 20, (x, y) => (x > 4 && x < 15 && y > 4 && y < 15 ? [220, 170, 140] : teal));
  assert.deepEqual(estimateBackground(img), teal);
  // A headshot's torso fills the bottom edge: it must not drag the backdrop estimate.
  const torso = image(20, 20, (x, y) => (y >= 8 ? [30, 36, 60] : teal));
  assert.deepEqual(estimateBackground(torso), teal);
  assert.equal(keyWeight(35, 96, 102, teal), 0);
  assert.equal(keyWeight(220, 170, 140, teal), 1);
  assert.ok(keyWeight(30, 90, 98, teal) < 0.1);
});

test('accents: about 3 % of the bright cells, deterministic per seed', () => {
  const values = Float32Array.from({ length: 10000 }, (_, i) => ((i * 7919) % 10000) / 10000);
  const a = pickAccents(values, 0.03, 7, 0.45);
  const b = pickAccents(values, 0.03, 7, 0.45);
  const picked = a.reduce((sum, v) => sum + v, 0);
  assert.ok(Math.abs(picked - 300) <= 60, `picked=${picked}`);
  assert.deepEqual(a, b);
  for (let i = 0; i < values.length; i++) if (a[i]) assert.ok(values[i] >= 0.45);
  assert.equal(pickAccents(new Float32Array(50), 0.03, 7, 0.45).reduce((s, v) => s + v, 0), 0);
});

test('portrait: vignette blanks the corners, keyed background is black, subject keeps a floor', () => {
  const cols = 32, rows = 32, teal = [35, 96, 102];
  // Teal backdrop, a face-like disc with a bright left half and a dark (hair-like) right half.
  const img = image(cols, rows, (x, y) => {
    const d = Math.hypot(x - 15.5, y - 15.5);
    if (d > 9) return teal;
    return x < 16 ? [235, 200, 175] : [20, 18, 22];
  });
  const p = buildPortrait(img, { accentRatio: 0 });
  assert.equal(p.cols, cols);
  assert.equal(p.rows, rows);
  assert.equal(p.value.length, cols * rows);
  assert.equal(p.glyph.length, cols * rows);
  const at = (x, y) => y * cols + x;
  assert.equal(p.glyph[at(0, 0)], 0, 'corner blank');
  assert.equal(p.glyph[at(15, 2)], 0, 'keyed background blank inside the vignette');
  assert.ok(p.glyph[at(12, 15)] > p.glyph[at(19, 15)], 'bright side denser than dark side');
  assert.ok(p.glyph[at(19, 15)] > 0, 'dark subject keeps a floor glyph');
  assert.ok(p.value.every(v => v >= 0 && v <= 1));
});

test('portrait: accent mask stays near the requested ratio of visible cells', () => {
  const cols = 72, rows = 43;
  const img = image(cols, rows, (x, y) => { const v = 60 + ((x * 13 + y * 29) % 180); return [v, v * 0.9, v * 0.8]; });
  const p = buildPortrait(img, { accentRatio: 0.03, key: false });
  const visible = p.glyph.reduce((n, g) => n + (g > 0 ? 1 : 0), 0);
  const accents = p.accent.reduce((n, a) => n + a, 0);
  assert.ok(visible > 0);
  assert.ok(accents > 0 && accents / visible < 0.06, `accents=${accents} visible=${visible}`);
  for (let i = 0; i < p.accent.length; i++) if (p.accent[i]) assert.ok(p.glyph[i] > 0);
});

test('decode schedule: rows resolve top to bottom within the duration', () => {
  let prev = -1;
  for (let row = 0; row < 43; row++) {
    const t = revealAt(row, 0, 43, 1400, 0);
    assert.ok(t > prev); prev = t;
  }
  assert.ok(prev <= 1400);
  for (let col = 0; col < 72; col++) {
    const t = revealAt(20, col, 43, 1400, 0.05);
    assert.ok(Math.abs(t - revealAt(20, col, 43, 1400, 0)) <= 1400 * 0.05 + 1e-9);
    assert.ok(t >= 0 && t <= 1400);
  }
});

test('scramble glyphs are deterministic per tick and change between ticks', () => {
  const n = DECODE_GLYPHS.length;
  const seen = new Set();
  for (let tick = 0; tick < 12; tick++) {
    const g = scrambleIndex(321, tick, n);
    assert.ok(Number.isInteger(g) && g >= 0 && g < n);
    assert.equal(g, scrambleIndex(321, tick, n));
    seen.add(g);
  }
  assert.ok(seen.size > 3);
});

test('lens weight: full at the centre, smooth to zero at the radius', () => {
  assert.equal(lensWeight(0, 0, 70), 1);
  assert.equal(lensWeight(70, 0, 70), 0);
  assert.equal(lensWeight(0, 90, 70), 0);
  const a = lensWeight(20, 0, 70), b = lensWeight(40, 0, 70), c = lensWeight(60, 0, 70);
  assert.ok(a > b && b > c && c > 0);
});
