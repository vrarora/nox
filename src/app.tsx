import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { CATALOGUE, type Entry } from './catalogue';
import { cachedExists, refreshExists } from './lib/boot';
import { launch, toast } from './lib/luna';
import { perf } from './lib/perf';
import { useFocus, type Focus } from './hooks/useFocus';
import { useInputs, STATE_TEXT } from './hooks/useInputs';
import { useIdle } from './hooks/useIdle';
import { useNuvio } from './hooks/useNuvio';
import { Home } from './screens/Home';

export function App() {
  const [exists, setExists] = useState<Record<string, boolean>>(cachedExists);
  const inputs = useInputs();
  const idle = useIdle();
  const nuvio = useNuvio();

  // Inputs and utilities always show; apps show once the TV confirms them.
  // An input entry carries its live state in the subtitle.
  const apps = useMemo(
    () => CATALOGUE
      .filter((e) => e.kind === 'input' || (e.kind === 'app' && exists[e.key] !== false))
      .map((e) => {
        const info = e.kind === 'input' ? inputs[e.appId] : undefined;
        return info ? { ...e, subtitle: `${e.subtitle} · ${STATE_TEXT[info.state]}`, state: info.state } : e;
      }),
    [exists, inputs],
  );
  const utils = useMemo(() => CATALOGUE.filter((e) => e.kind === 'utility'), []);

  const open = useCallback((e: Entry) => {
    // An HDMI input with a sleeping CEC device: ask the TV to wake it as it switches.
    const info = e.kind === 'input' ? inputs[e.appId] : undefined;
    const params = info?.cecId !== undefined && info.state !== 'on'
      ? { id: 'uniqueId', value: String(info.cecId) }
      : e.params;
    launch(e.appId, params).then((r) => {
      if (r.returnValue === false) toast(`Couldn't open ${e.title}`);
    });
  }, [inputs]);

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

  return <Home apps={apps} utils={utils} focus={focus} idle={idle} nuvio={nuvio} onHover={hover} onOpen={open} />;
}
