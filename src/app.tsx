import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CATALOGUE, type Entry } from './catalogue';
import { cachedExists, refreshExists } from './lib/boot';
import { launch, toast } from './lib/luna';
import { perf } from './lib/perf';
import { useFocus, type Focus } from './hooks/useFocus';
import { Home } from './screens/Home';

export function App() {
  const [exists, setExists] = useState<Record<string, boolean>>(cachedExists);

  // Inputs and utilities always show; apps show once the TV confirms them.
  const apps = useMemo(
    () => CATALOGUE.filter((e) => e.kind === 'input' || (e.kind === 'app' && exists[e.key] !== false)),
    [exists],
  );
  const utils = useMemo(() => CATALOGUE.filter((e) => e.kind === 'utility'), []);

  const open = useCallback((e: Entry) => {
    launch(e.appId, e.params).then((r) => {
      if (r.returnValue === false) toast(`Couldn't open ${e.title}`);
    });
  }, []);

  const activate = useCallback((f: Focus) => {
    const e = (f.zone === 'list' ? apps : utils)[f.index];
    if (e) open(e);
  }, [apps, utils, open]);

  const counts = useMemo(() => ({ list: apps.length, utils: utils.length }), [apps.length, utils.length]);
  const { focus, set, hover } = useFocus(counts, activate);

  useEffect(() => {
    perf.framePainted();
    // Work that isn't needed for the first frame waits for it.
    const t = setTimeout(() => { refreshExists().then(setExists); }, 400);
    // Coming back from another app: land on the list again.
    const relaunch = () => { set({ zone: 'list', index: 0 }); window.webOSSystem?.activate(); };
    document.addEventListener('webOSRelaunch', relaunch);
    return () => { clearTimeout(t); document.removeEventListener('webOSRelaunch', relaunch); };
  }, []);

  return <Home apps={apps} utils={utils} focus={focus} onHover={hover} onOpen={open} />;
}
