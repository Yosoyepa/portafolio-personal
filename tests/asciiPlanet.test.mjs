import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLANET_RAMP, DECODE_GLYPHS, STAR_GLYPHS, BUCKETS, BUCKET_COLORS, gridRows, hexToRgb, mixRgb, rampIndex,
  sphereShade, bandValue, ringAt, ringDensity, starField, twinkle, planetGeometry, planetFrame, revealRow, scrambleIndex,
  CHARS, RING_GLYPHS, moonAt,
} from '../src/lib/asciiPlanet.mjs';

test('ramp: dark to light, starts blank, unique glyphs; luminance maps onto it monotonically', () => {
  assert.equal(PLANET_RAMP[0], ' ');
  assert.ok(PLANET_RAMP.length >= 8);
  assert.equal(new Set(PLANET_RAMP).size, PLANET_RAMP.length);
  assert.equal(rampIndex(0), 0);
  assert.equal(rampIndex(1), PLANET_RAMP.length - 1);
  assert.equal(rampIndex(-3), 0);
  assert.equal(rampIndex(9), PLANET_RAMP.length - 1);
  let prev = 0;
  for (let v = 0; v <= 1; v += 0.01) { const g = rampIndex(v); assert.ok(g >= prev); prev = g; }
});

test('grid: the mono cell (0.6 em × 1.2 em) is corrected so 58 columns give 29 rows and 46 give 23', () => {
  assert.equal(gridRows(58), 29);
  assert.equal(gridRows(46), 23);
  assert.equal(gridRows(1), 1);
});

test('colors: at most 12 buckets, body ramps from #2a1b52 to #b9a5ff, ring, rim and stars use the brief tones', () => {
  assert.ok(BUCKET_COLORS.length <= 12);
  assert.equal(BUCKET_COLORS.length, BUCKETS.COUNT);
  assert.equal(BUCKET_COLORS[BUCKETS.BODY], '#2a1b52');
  assert.equal(BUCKET_COLORS[BUCKETS.BODY + BUCKETS.BODY_TONES - 1], '#b9a5ff');
  assert.equal(BUCKET_COLORS[BUCKETS.RING], '#cdbdff');
  assert.equal(BUCKET_COLORS[BUCKETS.RIM], '#9ff3f0');
  assert.equal(BUCKET_COLORS[BUCKETS.STAR], '#adf3ed');
  assert.deepEqual(hexToRgb('#2a1b52'), [42, 27, 82]);
  assert.deepEqual(mixRgb([0, 0, 0], [200, 100, 50], 0.5), [100, 50, 25]);
});

test('sphere shading: lit from the upper left with a soft terminator', () => {
  const s = (x, y) => sphereShade(x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y)));
  assert.ok(s(-0.5, -0.5) > s(0, 0));
  assert.ok(s(0, 0) > s(0.5, 0.5));
  assert.ok(s(0.6, 0.6) < 0.12, 'the far lower right falls into night');
  for (const v of [s(-0.6, -0.6), s(0, 0), s(0.7, 0.7)]) assert.ok(v >= 0 && v <= 1);
  // Soft: across the terminator the light falls in several steps, not one.
  const steps = [];
  for (let t = -0.2; t <= 0.8; t += 0.1) steps.push(s(t, t));
  const distinct = new Set(steps.map(v => Math.round(v * 20))).size;
  assert.ok(distinct >= 5);
});

test('bands: latitude stripes with deterministic noise that drift as the planet turns', () => {
  const a = bandValue(0.3, 1.2, 0), b = bandValue(0.3, 1.2, 0);
  assert.equal(a, b);
  assert.ok(a >= 0 && a <= 1);
  let varies = 0;
  for (let lat = -1.2; lat <= 1.2; lat += 0.1) if (Math.abs(bandValue(lat, 0, 0) - bandValue(0, 0, 0)) > 0.1) varies++;
  assert.ok(varies > 3, 'latitude changes the band');
  // Turning by Δ is the same as sampling the longitude Δ further along.
  assert.equal(bandValue(0.4, 2, 0.5), bandValue(0.4, 2.5, 0));
  assert.notEqual(bandValue(0.4, 2, 0), bandValue(0.4, 2, 0.5));
});

test('ring: elliptical, tilted, and occluded correctly in front of and behind the planet', () => {
  const opts = { radius: 0.4, inner: 1.3, outer: 1.95, tilt: 0.32, roll: 0 };
  assert.deepEqual([...RING_GLYPHS], ['·', '-', '~', '=']);
  // Far left and right on the horizon line are on the ring; straight above the planet is not.
  assert.ok(ringAt(-0.7, 0, opts));
  assert.ok(ringAt(0.7, 0, opts));
  assert.equal(ringAt(0, -0.75, opts), null);
  // Inside the gap between planet and ring, nothing.
  assert.equal(ringAt(0.45, 0, opts), null);
  // Over the planet disk: the near half (below centre) is in front, the far half behind.
  const below = ringAt(0, 0.4 * Math.sin(0.32) * 1.7, opts);
  const above = ringAt(0, -0.4 * Math.sin(0.32) * 1.7, opts);
  assert.ok(below && below.front);
  assert.ok(above && !above.front);
  assert.ok(ringDensity(1.5) >= 0 && ringDensity(1.5) <= 1);
  assert.ok(ringDensity(1.5) < ringDensity(1.38), 'a Cassini-like gap');
  assert.equal(ringDensity(1.1), 0);
  assert.equal(ringDensity(2.1), 0);
});

test('stars: 30 to 40 deterministic stars that twinkle deterministically', () => {
  const a = starField(58, 29, 36, 7), b = starField(58, 29, 36, 7);
  assert.deepEqual(a, b);
  assert.ok(a.length >= 30 && a.length <= 40);
  assert.equal(new Set(a.map(s => s.i)).size, a.length, 'one star per cell');
  for (const s of a) assert.ok(s.i >= 0 && s.i < 58 * 29);
  const seen = new Set();
  for (let t = 0; t < 40; t++) for (const s of a) { const g = twinkle(s, t); assert.equal(g, twinkle(s, t)); seen.add(g); }
  for (const g of seen) assert.ok(g === ' ' || STAR_GLYPHS.includes(g));
  assert.deepEqual([...STAR_GLYPHS], ['.', '·', '+', '*']);
  assert.ok(seen.size >= 4, 'stars change glyph over time');
});

test('frame: stars, body, ring in front and behind; turning changes the body but not the outline', () => {
  const geo = planetGeometry(58, 29);
  const chars = new Uint8Array(58 * 29), buckets = new Uint8Array(58 * 29);
  planetFrame(geo, 0, 0, 0, chars, buckets);
  const count = b => buckets.reduce((n, v, i) => n + (chars[i] && v === b ? 1 : 0), 0);
  let body = 0;
  for (let k = 0; k < BUCKETS.BODY_TONES; k++) body += count(BUCKETS.BODY + k);
  assert.ok(body > 150, `body cells ${body}`);
  assert.ok(count(BUCKETS.RING) + count(BUCKETS.RING_DIM) > 60);
  assert.ok(count(BUCKETS.RIM) > 5);
  assert.ok(count(BUCKETS.STAR) > 5);
  // Round: the body is about twice as wide in columns as it is tall in rows.
  const colsOf = [], rowsOf = [];
  for (let i = 0; i < chars.length; i++) if (geo.planet[i]) { colsOf.push(i % 58); rowsOf.push((i / 58) | 0); }
  const w = Math.max(...colsOf) - Math.min(...colsOf) + 1, h = Math.max(...rowsOf) - Math.min(...rowsOf) + 1;
  assert.ok(Math.abs(w / h - 2) < 0.25, `w ${w} h ${h}`);
  const before = chars.slice();
  planetFrame(geo, 0.6, 0, 0, chars, buckets);
  let changed = 0;
  for (let i = 0; i < chars.length; i++) if (geo.planet[i] && chars[i] !== before[i]) changed++;
  assert.ok(changed > 10, 'the bands move');
  // Hover boost brightens the ring.
  const ringBefore = count(BUCKETS.RING);
  planetFrame(geo, 0.6, 1, 0, chars, buckets);
  assert.ok(count(BUCKETS.RING) > ringBefore);
});

test('decode: rows reveal top to bottom inside the duration; scramble is deterministic', () => {
  assert.equal(revealRow(0, 29, 1000), 0);
  assert.ok(revealRow(28, 29, 1000) <= 1000);
  for (let r = 1; r < 29; r++) assert.ok(revealRow(r, 29, 1000) > revealRow(r - 1, 29, 1000));
  assert.equal(scrambleIndex(10, 3, DECODE_GLYPHS.length), scrambleIndex(10, 3, DECODE_GLYPHS.length));
  for (let i = 0; i < 50; i++) { const k = scrambleIndex(i, 5, 7); assert.ok(k >= 0 && k < 7); }
});

test('round 2: a large centred disc, a readable night side, a thin ring with varied glyphs', () => {
  const cols = 58, rows = 29;
  const geo = planetGeometry(cols, rows);
  const chars = new Uint8Array(cols * rows), buckets = new Uint8Array(cols * rows);
  planetFrame(geo, 0, 0, 0, chars, buckets);
  // Disc: 55–60 % of the width.
  const discCols = [];
  for (let i = 0; i < chars.length; i++) if (geo.planet[i]) discCols.push(i % cols);
  const width = (Math.max(...discCols) - Math.min(...discCols) + 1) / cols;
  assert.ok(width >= 0.53 && width <= 0.62, `disc width ${width}`);
  // Every disc cell not covered by the near ring shows a glyph: the night side stays readable.
  let blank = 0, night = 0;
  for (let i = 0; i < chars.length; i++) {
    if (!geo.planet[i] || (geo.ring[i] >= 0 && geo.ringFront[i])) continue;
    if (!chars[i]) blank++;
    if (geo.shade[i] < 0.02) { night++; assert.ok('.:'.includes(CHARS[chars[i]]), CHARS[chars[i]]); assert.ok(buckets[i] <= BUCKETS.BODY + 1); }
  }
  assert.equal(blank, 0);
  assert.ok(night > 10);
  // Planet + ring centred: empty margins above and below differ by at most one row, left and right by two columns.
  const used = [];
  for (let i = 0; i < chars.length; i++) if (geo.planet[i] || geo.ring[i] >= 0) used.push(i);
  const rs = used.map(i => (i / cols) | 0), cs = used.map(i => i % cols);
  assert.ok(Math.abs(Math.min(...rs) - (rows - 1 - Math.max(...rs))) <= 1);
  assert.ok(Math.abs(Math.min(...cs) - (cols - 1 - Math.max(...cs))) <= 2);
  // Thin, near edge-on ring: its screen height is about a third of its width or less.
  const ringRows = [], ringCols = [];
  for (let i = 0; i < chars.length; i++) if (geo.ring[i] >= 0) { ringRows.push((i / cols) | 0); ringCols.push(i % cols); }
  const h = (Math.max(...ringRows) - Math.min(...ringRows) + 1) / rows, w = (Math.max(...ringCols) - Math.min(...ringCols) + 1) / cols;
  assert.ok(h / w < 0.5, `ring h/w ${h / w}`);
  // Glyph variety on the ring, and the far half only outside the disc.
  const ringGlyphs = new Set();
  for (let i = 0; i < chars.length; i++) {
    if (buckets[i] !== BUCKETS.RING && buckets[i] !== BUCKETS.RING_DIM) continue;
    if (!chars[i]) continue;
    ringGlyphs.add(CHARS[chars[i]]);
    if (geo.planet[i]) assert.equal(geo.ringFront[i], 1, 'the far half hides behind the disc');
  }
  assert.ok(ringGlyphs.size >= 3, [...ringGlyphs].join(''));
  for (const g of ringGlyphs) assert.ok(RING_GLYPHS.includes(g));
});

test('moon: orbits, passing in front of and behind the planet', () => {
  let front = 0, back = 0;
  for (let k = 0; k < 64; k++) {
    const m = moonAt((k / 64) * Math.PI * 2);
    assert.ok(Math.abs(m.x) < 0.97 && Math.abs(m.y) < 0.97);
    if (m.front) front++; else back++;
  }
  assert.ok(front > 10 && back > 10);
  assert.deepEqual(moonAt(1.3), moonAt(1.3));
  // Behind the disc it is hidden, in front it covers the body.
  const cols = 58, rows = 29, geo = planetGeometry(cols, rows);
  const chars = new Uint8Array(cols * rows), buckets = new Uint8Array(cols * rows);
  const cellOf = m => Math.floor((m.y + 1) / 2 * rows) * cols + Math.floor((m.x + 1) / 2 * cols);
  let phase = 0, m;
  for (; phase < 7; phase += 0.01) { m = moonAt(phase); if (m.front && geo.planet[cellOf(m)]) break; }
  planetFrame(geo, 0, 0, 0, chars, buckets, phase);
  assert.ok(geo.planet[cellOf(m)] && chars[cellOf(m)]);
  assert.equal(buckets[cellOf(m)], BUCKETS.MOON);
  for (; phase < 14; phase += 0.01) { m = moonAt(phase); if (!m.front && geo.planet[cellOf(m)] && !(geo.ring[cellOf(m)] >= 0)) break; }
  planetFrame(geo, 0, 0, 0, chars, buckets, phase);
  assert.notEqual(buckets[cellOf(m)], BUCKETS.MOON);
});
