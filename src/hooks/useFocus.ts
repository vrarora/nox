import { useEffect, useRef, useState } from 'preact/hooks';
import { KEY } from '../lib/keys';

// Two vertical zones: the app list and the utility cluster. Focus is an index
// per zone, never DOM focus. Up/Down move within a zone, Left/Right switch
// zones, OK on key-up activates (so a later long-press can be told apart),
// Back is swallowed on the home screen. Pointer hover selects via `set`.

export type Zone = 'list' | 'utils';
export interface Focus { zone: Zone; index: number }

export function useFocus(counts: Record<Zone, number>, onActivate: (f: Focus) => void) {
  const [focus, setFocus] = useState<Focus>({ zone: 'list', index: 0 });
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const okDown = useRef(false);

  useEffect(() => {
    const clamp = (f: Focus): Focus => ({ zone: f.zone, index: Math.max(0, Math.min(counts[f.zone] - 1, f.index)) });
    const down = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.up:    setFocus((f) => clamp({ ...f, index: f.index - 1 })); break;
        case KEY.down:  setFocus((f) => clamp({ ...f, index: f.index + 1 })); break;
        case KEY.right: setFocus((f) => f.zone === 'list' ? clamp({ zone: 'utils', index: 0 }) : f); break;
        case KEY.left:  setFocus((f) => f.zone === 'utils' ? clamp({ zone: 'list', index: 0 }) : f); break;
        case KEY.ok:    if (!e.repeat) okDown.current = true; break;
        case KEY.back: case KEY.escape: break;
        default: return;
      }
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.keyCode !== KEY.ok || !okDown.current) return;
      okDown.current = false;
      e.preventDefault();
      onActivate(focusRef.current);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [counts.list, counts.utils, onActivate]);

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
