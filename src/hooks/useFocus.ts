import { useEffect, useRef, useState } from 'preact/hooks';
import { KEY } from '../lib/keys';

// One vertical list. Focus is an index, never DOM focus. Up/Down move, OK on
// key-up activates (so a later long-press can be told apart), Back is swallowed
// on the home list. Pointer hover selects through setIndex from the row itself.

export function useFocus(count: number, onActivate: (index: number) => void) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const okDown = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.up:   setIndex((i) => Math.max(0, i - 1)); break;
        case KEY.down: setIndex((i) => Math.min(count - 1, i + 1)); break;
        case KEY.ok:   if (!e.repeat) okDown.current = true; break;
        case KEY.back: case KEY.escape: break;
        default: return;
      }
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.keyCode !== KEY.ok || !okDown.current) return;
      okDown.current = false;
      e.preventDefault();
      onActivate(indexRef.current);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [count, onActivate]);

  return { index, setIndex };
}
