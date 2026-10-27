import { useEffect, useRef, useState } from 'preact/hooks';
import { KEY } from '../lib/keys';
import { tick } from '../lib/sound';

// Two vertical zones: the app list and the utility cluster. Focus is an index
// per zone, never DOM focus. Up/Down move within a zone, Left/Right switch
// zones, OK on key-up activates, OK held 600 ms fires onHold instead. Back is
// swallowed on the home screen. Pointer hover selects via `hover`.

export type Zone = 'list' | 'utils';
export interface Focus { zone: Zone; index: number }

const HOLD_MS = 600;

interface Handlers { onActivate: (f: Focus) => void; onHold?: (f: Focus) => void; onBack?: () => void }

export function useFocus(counts: Record<Zone, number>, enabled: boolean, h: Handlers) {
  const [focus, setFocus] = useState<Focus>({ zone: 'list', index: 0 });
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const handlers = useRef(h);
  handlers.current = h;
  const okDownAt = useRef(0);
  const held = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const clamp = (f: Focus): Focus => ({ zone: f.zone, index: Math.max(0, Math.min(counts[f.zone] - 1, f.index)) });
    const move = (next: (f: Focus) => Focus) => setFocus((f) => { const n = clamp(next(f)); if (n.zone !== f.zone || n.index !== f.index) tick(); return n; });
    let holdTimer = 0;
    const down = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.up:    move((f) => ({ ...f, index: f.index - 1 })); break;
        case KEY.down:  move((f) => ({ ...f, index: f.index + 1 })); break;
        case KEY.right: move((f) => f.zone === 'list' ? { zone: 'utils', index: 0 } : f); break;
        case KEY.left:  move((f) => f.zone === 'utils' ? { zone: 'list', index: 0 } : f); break;
        case KEY.ok:
          if (!e.repeat) {
            okDownAt.current = performance.now();
            held.current = false;
            holdTimer = window.setTimeout(() => { held.current = true; handlers.current.onHold?.(focusRef.current); }, HOLD_MS);
          }
          break;
        case KEY.back: case KEY.escape: handlers.current.onBack?.(); break;
        default: return;
      }
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.keyCode !== KEY.ok || !okDownAt.current) return;
      clearTimeout(holdTimer);
      okDownAt.current = 0;
      e.preventDefault();
      if (!held.current) handlers.current.onActivate(focusRef.current);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { clearTimeout(holdTimer); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [counts.list, counts.utils, enabled]);

  // Hover from a real pointer move only; webOS fires mouseover when content
  // slides under a still pointer, which would steal focus.
  const lastMove = useRef(0);
  useEffect(() => {
    const move = () => { lastMove.current = performance.now(); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  const hover = (f: Focus) => { if (performance.now() - lastMove.current < 200) setFocus(f); };

  return { focus, set: setFocus, hover };
}
