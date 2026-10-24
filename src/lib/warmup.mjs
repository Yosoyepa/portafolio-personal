import { useEffect, useState } from 'react';

/** Runs `task` in the first idle period after the window's load event, so heavy one-off work (evaluating a large
 * chunk, creating a WebGL context) happens before the visitor scrolls rather than in the middle of a scroll.
 * Falls back to a short timeout where requestIdleCallback is missing (Safari).
 * @param {() => void} task
 * @param {{timeout?: number, win?: Window}} [options]
 * @returns {() => void} cancels the task if it has not run yet.
 */
export function idleAfterLoad(task, { timeout = 700, win = globalThis.window } = {}) {
  let cancelled = false, idle = 0, timer = 0;
  const run = () => { if (!cancelled) task(); };
  const schedule = () => {
    if (cancelled) return;
    if (win.requestIdleCallback) idle = win.requestIdleCallback(run, { timeout });
    else timer = win.setTimeout(run, 200);
  };
  if (win.document.readyState === 'complete') schedule();
  else win.addEventListener('load', schedule, { once: true });
  return () => {
    cancelled = true;
    win.removeEventListener('load', schedule);
    if (idle) win.cancelIdleCallback?.(idle);
    if (timer) win.clearTimeout(timer);
  };
}

/** One-at-a-time idle work: each task gets its own idle period after load, in order, so several WebGL surfaces never
 * pile their context creation into one long task.
 * @param {{timeout?: number, win?: Window}} [options]
 */
export function createIdleQueue(options) {
  const queue = []; let pending = null;
  const pump = () => {
    if (pending || !queue.length) return;
    pending = idleAfterLoad(() => {
      pending = null;
      const entry = queue.shift();
      pump();
      entry.task();
    }, options);
  };
  return {
    /** @param {() => void} task @param {{first?: boolean}} [placement] @returns {() => void} cancel */
    add(task, { first = false } = {}) {
      const entry = { task };
      if (first) queue.unshift(entry); else queue.push(entry);
      pump();
      return () => {
        const index = queue.indexOf(entry);
        if (index >= 0) queue.splice(index, 1);
        if (!queue.length && pending) { pending(); pending = null; }
      };
    },
  };
}

let shared;
/** Queues `task` on the page-wide idle queue (see createIdleQueue). */
export function whenIdle(task, placement) {
  shared ??= createIdleQueue();
  return shared.add(task, placement);
}

/** Loads a split component in its own idle period after load (at once when `now`), then mounts it in the next idle
 * period without Suspense, so chunk evaluation and WebGL context creation land in separate short tasks instead of one
 * long commit while the visitor scrolls.
 * @template P
 * @param {() => Promise<{default: import('react').ComponentType<P>}>} load stable module loader
 * @param {{enabled: boolean, now?: boolean, first?: boolean}} options
 * @returns {import('react').ComponentType<P> | null}
 */
export function useIdleComponent(load, { enabled, now = false, first = false }) {
  const [Component, setComponent] = useState(/** @type {import('react').ComponentType<P> | null} */ (null));
  useEffect(() => {
    if (!enabled || Component) return;
    let alive = true, cancel = () => {};
    /** @param {{default: import('react').ComponentType<P>}} module */
    const mount = module => { if (alive) setComponent(() => module.default); };
    if (now) load().then(mount, () => {});
    else cancel = whenIdle(() => load().then(module => {
      if (alive) cancel = whenIdle(() => mount(module), { first: true });
    }, () => {}), { first });
    return () => { alive = false; cancel(); };
  }, [enabled, now, first, Component, load]);
  return Component;
}

/** Compiles and links a shader pair without blocking the main thread.
 * With KHR_parallel_shader_compile the GPU process works in the background and COMPLETION_STATUS_KHR is polled
 * once per frame; the caller's later link of the same sources in this context then hits the program cache instead of
 * stalling a scroll frame for 50–200 ms. Without the extension it resolves at once and the caller links as before.
 * @param {WebGLRenderingContext | WebGL2RenderingContext} gl
 * @param {string} vertex
 * @param {string} fragment
 * @param {{timeout?: number}} [options]
 * @returns {{ready: Promise<boolean>, cancel: () => void}} `ready` resolves true when the link finished in the background.
 */
export function warmShaders(gl, vertex, fragment, { timeout = 4000 } = {}) {
  const ext = gl.getExtension('KHR_parallel_shader_compile');
  if (!ext) return { ready: Promise.resolve(false), cancel() {} };
  const shaders = [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]].map(([type, source]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    return shader;
  });
  const program = gl.createProgram();
  for (const shader of shaders) gl.attachShader(program, shader);
  gl.linkProgram(program);
  let frame = 0, settled = false, start = null, settle;
  const release = () => {
    cancelAnimationFrame(frame); frame = 0;
    gl.deleteProgram(program); for (const shader of shaders) gl.deleteShader(shader);
  };
  const ready = new Promise(resolve => { settle = resolve; });
  const finish = value => { if (settled) return; settled = true; release(); settle(value); };
  const poll = now => {
    frame = 0; start ??= now;
    if (gl.isContextLost()) finish(false);
    else if (gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) finish(true);
    else if (now - start > timeout) finish(false);
    else frame = requestAnimationFrame(poll);
  };
  frame = requestAnimationFrame(poll);
  return { ready, cancel: () => finish(false) };
}
