import test from 'node:test';
import assert from 'node:assert/strict';
import { idleAfterLoad, createIdleQueue, warmShaders } from '../src/lib/warmup.mjs';


function fakeWindow({ readyState = 'loading', idle = true } = {}) {
  const listeners = new Map(), idles = new Map(), timers = new Map(); let id = 0;
  const win = {
    document: { readyState },
    addEventListener: (type, fn) => listeners.set(type, fn),
    removeEventListener: type => listeners.delete(type),
    setTimeout: fn => { timers.set(++id, fn); return id; },
    clearTimeout: key => timers.delete(key),
    ...(idle ? { requestIdleCallback: fn => { idles.set(++id, fn); return id; }, cancelIdleCallback: key => idles.delete(key) } : {}),
  };
  return { win, listeners, idles, timers,
    load() { win.document.readyState = 'complete'; listeners.get('load')?.(); },
    flush() { for (const map of [idles, timers]) { const queued = [...map.values()]; map.clear(); queued.forEach(fn => fn()); } } };
}

test('idle task waits for load, then for an idle period', () => {
  const f = fakeWindow(); let runs = 0;
  idleAfterLoad(() => runs++, { win: f.win });
  f.flush(); assert.equal(runs, 0);
  f.load(); assert.equal(f.idles.size, 1); assert.equal(runs, 0);
  f.flush(); assert.equal(runs, 1);
});

test('already loaded pages schedule at once; timeout fallback without requestIdleCallback', () => {
  const f = fakeWindow({ readyState: 'complete', idle: false }); let runs = 0;
  idleAfterLoad(() => runs++, { win: f.win });
  assert.equal(f.timers.size, 1); f.flush(); assert.equal(runs, 1);
});

test('cancel before load or before the idle period means the task never runs', () => {
  for (const loadFirst of [false, true]) {
    const f = fakeWindow(); let runs = 0;
    const cancel = idleAfterLoad(() => runs++, { win: f.win });
    if (loadFirst) f.load();
    cancel(); f.load(); f.flush();
    assert.equal(runs, 0); assert.equal(f.idles.size, 0);
  }
});

function fakeGl({ parallel = true, completeAfter = 2 } = {}) {
  let polls = 0; const deleted = [];
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, linked: 0,
    getExtension: name => (parallel && name === 'KHR_parallel_shader_compile' ? { COMPLETION_STATUS_KHR: 0x91B1 } : null),
    createShader: type => ({ type }), shaderSource() {}, compileShader() {},
    createProgram: () => ({}), attachShader() {}, linkProgram() { gl.linked++; },
    isContextLost: () => false,
    getProgramParameter: (_, key) => { assert.equal(key, 0x91B1); return ++polls >= completeAfter; },
    deleteProgram: p => deleted.push(p), deleteShader: s => deleted.push(s),
  };
  return { gl, deleted, polls: () => polls };
}

function frames() {
  const queue = new Map(); let id = 0;
  const original = [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame];
  globalThis.requestAnimationFrame = fn => { queue.set(++id, fn); return id; };
  globalThis.cancelAnimationFrame = key => queue.delete(key);
  return { queue, tick(now) { const q = [...queue.values()]; queue.clear(); q.forEach(fn => fn(now)); },
    restore() { [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame] = original; } };
}

test('parallel compile polls once per frame and releases its program when complete', async () => {
  const r = frames(); try {
    const { gl, deleted, polls } = fakeGl({ completeAfter: 3 });
    const warm = warmShaders(gl, 'v', 'f');
    assert.equal(gl.linked, 1); assert.equal(polls(), 0);
    r.tick(0); r.tick(16); assert.equal(deleted.length, 0);
    r.tick(32); assert.equal(await warm.ready, true);
    assert.equal(deleted.length, 3); assert.equal(r.queue.size, 0);
  } finally { r.restore(); }
});

test('without the extension it resolves at once and links nothing', async () => {
  const { gl } = fakeGl({ parallel: false });
  assert.equal(await warmShaders(gl, 'v', 'f').ready, false); assert.equal(gl.linked, 0);
});

test('cancel and timeout stop polling and resolve false', async () => {
  const r = frames(); try {
    const a = fakeGl({ completeAfter: Infinity }), warm = warmShaders(a.gl, 'v', 'f');
    warm.cancel(); assert.equal(r.queue.size, 0); assert.equal(await warm.ready, false); assert.equal(a.deleted.length, 3);
    const b = fakeGl({ completeAfter: Infinity }), slow = warmShaders(b.gl, 'v', 'f', { timeout: 100 });
    r.tick(0); r.tick(50); r.tick(101); assert.equal(await slow.ready, false); assert.equal(r.queue.size, 0);
  } finally { r.restore(); }
});

test('idle queue runs one task per idle period, honours first placement and cancellation', () => {
  const f = fakeWindow({ readyState: 'complete' }); const order = [];
  const queue = createIdleQueue({ win: f.win });
  queue.add(() => order.push('a'));
  const cancelB = queue.add(() => order.push('b'));
  queue.add(() => order.push('c'));
  queue.add(() => order.push('first'), { first: true });
  assert.equal(f.idles.size, 1);
  cancelB();
  f.flush(); assert.deepEqual(order, ['first']);
  f.flush(); f.flush(); assert.deepEqual(order, ['first', 'a', 'c']);
  assert.equal(f.idles.size, 0);
  const cancelD = queue.add(() => order.push('d')); cancelD();
  assert.equal(f.idles.size, 0); f.flush(); assert.equal(order.length, 3);
});
