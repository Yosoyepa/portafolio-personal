import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderLoop } from '../src/lib/renderLoop.mjs';

function fixture() {
  const original = Object.fromEntries(['requestAnimationFrame','cancelAnimationFrame','IntersectionObserver','document'].map(k=>[k,globalThis[k]]));
  const frames = new Map(), events = new Map(); let id = 0, intersection;
  globalThis.requestAnimationFrame = fn => { frames.set(++id,fn); return id; };
  globalThis.cancelAnimationFrame = key => frames.delete(key);
  globalThis.document = { hidden:false, addEventListener:(k,v)=>events.set(k,v), removeEventListener:k=>events.delete(k) };
  globalThis.IntersectionObserver = class { constructor(fn) { intersection=fn; } observe() {} disconnect() {} };
  return {
    frames, events,
    visible(value) { intersection([{isIntersecting:value}]); },
    hidden(value) { document.hidden=value; events.get('visibilitychange')?.(); },
    tick(time) { const queued=[...frames.values()]; frames.clear(); queued.forEach(fn=>fn(time)); },
    restore() { for (const [k,v] of Object.entries(original)) { if(v===undefined) delete globalThis[k]; else globalThis[k]=v; } }
  };
}

test('offscreen and hidden surfaces cancel pending callbacks; resume has no time jump',()=>{
  const f=fixture(); try {
    const deltas=[]; const loop=createRenderLoop({}, dt=>deltas.push(dt));
    assert.equal(f.frames.size,0);
    f.visible(true); f.tick(0); f.tick(34);
    assert.equal(deltas.length,2);
    f.visible(false); assert.equal(f.frames.size,0);
    f.visible(true); f.tick(20000); assert.equal(deltas.at(-1),0);
    f.hidden(true); assert.equal(f.frames.size,0);
    f.hidden(false); assert.equal(f.frames.size,1);
    loop.dispose(); assert.equal(f.frames.size,0); assert.equal(f.events.size,0);
  } finally { f.restore(); }
});

test('30 fps budget halves draws on a 60 Hz display and caps 120 Hz displays',()=>{
  for(const hz of [60,120]) {
    const f=fixture(); try {
      let draws=0; const loop=createRenderLoop({},()=>draws++);
      f.visible(true); for(let i=0;i<hz;i++) f.tick(i*1000/hz);
      assert.equal(draws,30); loop.dispose();
    } finally { f.restore(); }
  }
});

test('manual pause renders once then stops; explicit invalidation refreshes a static frame',()=>{
  const f=fixture(); try {
    let enabled=false, draws=0;
    const loop=createRenderLoop({},()=>draws++,{enabled:()=>enabled});
    f.visible(true); f.tick(0); assert.equal(draws,1); assert.equal(f.frames.size,0);
    loop.invalidate(); f.tick(50); assert.equal(draws,2); assert.equal(f.frames.size,0);
    enabled=true; loop.refresh(); assert.equal(f.frames.size,1);
    enabled=false; loop.refresh(); assert.equal(f.frames.size,0);
    loop.dispose(); loop.invalidate(); assert.equal(f.frames.size,0);
  } finally { f.restore(); }
});
