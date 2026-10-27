// Boot timing, read over DevTools by scripts/measure.mjs as window.__nox.

declare global {
  interface Window { __nox: Record<string, unknown> & { t0: number } }
}

const marks: Record<string, number> = {};

export const perf = {
  mark(name: string) {
    marks[name] = Math.round(performance.now());
    window.__nox[name] = marks[name];
  },
  // First frame after the list is in the DOM.
  framePainted() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      perf.mark('painted');
      const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint');
      if (paint) window.__nox.fcp = Math.round(paint.startTime);
    }));
  },
};
