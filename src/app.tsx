import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CATALOGUE, type Entry } from './catalogue';
import { cachedExists, refreshExists } from './lib/boot';
import { launch, toast } from './lib/luna';
import { perf } from './lib/perf';
import { useFocus } from './hooks/useFocus';
import { Home } from './screens/Home';

export function App() {
  const [exists, setExists] = useState<Record<string, boolean>>(cachedExists);

  // Inputs and utilities always show; apps show once the TV confirms them.
  const entries = useMemo(
    () => CATALOGUE.filter((e) => e.kind !== 'app' || exists[e.key] !== false),
    [exists],
  );

  const open = useCallback((e: Entry) => {
    launch(e.appId, e.params).then((r) => {
      if (r.returnValue === false) toast(`Couldn't open ${e.title}`);
    });
  }, []);

  const activate = useCallback((i: number) => { const e = entries[i]; if (e) open(e); }, [entries, open]);
  const { index, setIndex } = useFocus(entries.length, activate);

  useEffect(() => {
    perf.framePainted();
    // Work that isn't needed for the first frame waits for it.
    const t = setTimeout(() => { refreshExists().then(setExists); }, 400);
    return () => clearTimeout(t);
  }, []);

  return <Home entries={entries} index={index} onHover={setIndex} onOpen={open} />;
}
