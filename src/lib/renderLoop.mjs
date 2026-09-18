/** A visible-only render loop. Pausing cancels callbacks, not just drawing.
 * @param {Element} element
 * @param {(delta: number, timestamp: number) => void} draw
 * @param {{fps?: number, enabled?: () => boolean}} options
 */
export function createRenderLoop(element, draw, { fps = 30, enabled = () => true } = {}) {
  let frame = 0, visible = false, dirty = true, disposed = false, last = null;
  const interval = 1000 / fps;
  const eligible = () => !disposed && visible && !document.hidden && (enabled() || dirty);
  const schedule = () => {
    if (!eligible()) {
      cancelAnimationFrame(frame); frame = 0; last = null;
    } else if (!frame) frame = requestAnimationFrame(tick);
  };
  const tick = now => {
    frame = 0;
    if (!eligible()) { last = null; return; }
    if (last === null || dirty || now - last >= interval - .5) {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, .1);
      last = now; dirty = false;
      draw(delta, now);
    }
    schedule();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; schedule();
  });
  observer.observe(element);
  document.addEventListener('visibilitychange', schedule);
  return {
    refresh: schedule,
    invalidate() { dirty = true; schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); frame = 0;
      observer.disconnect(); document.removeEventListener('visibilitychange', schedule);
    }
  };
}
