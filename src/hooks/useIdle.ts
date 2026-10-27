import { useEffect, useState } from 'preact/hooks';

// Idle after a quiet spell. The first key or pointer move only wakes the
// screen; it is swallowed before the focus engine sees it.

export function useIdle(idleMs: number): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const ms = Number(localStorage.getItem('nox.idleMs')) || idleMs;
    if (!ms) { setIdle(false); return; }
    let timer = 0;
    let isIdle = false;
    const arm = () => { clearTimeout(timer); timer = window.setTimeout(() => { isIdle = true; setIdle(true); }, ms); };
    const wake = (e: Event) => {
      if (isIdle) { isIdle = false; setIdle(false); e.stopImmediatePropagation(); e.preventDefault(); }
      arm();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') { isIdle = false; setIdle(false); arm(); } else clearTimeout(timer); };
    window.addEventListener('keydown', wake, true);
    window.addEventListener('mousemove', wake, true);
    window.addEventListener('click', wake, true);
    document.addEventListener('visibilitychange', onVisible);
    arm();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', wake, true);
      window.removeEventListener('mousemove', wake, true);
      window.removeEventListener('click', wake, true);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [idleMs]);

  return idle;
}
