// Boot timing, read over DevTools by scripts/measure.mjs as window.__sill.

declare global {
  interface Window { __sill: Record<string, unknown> & { t0: number } }
}

const marks: Record<string, number> = {};

export const perf = {
  mark(name: string) {
    marks[name] = Math.round(performance.now());
    window.__sill[name] = marks[name];
  },
  // First frame after the list is in the DOM.
  framePainted() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      perf.mark('painted');
      const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint');
      if (paint) window.__sill.fcp = Math.round(paint.startTime);
    }));
  },
};
