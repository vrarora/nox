import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CATALOGUE, type Entry } from './catalogue';
import { cachedExists, refreshExists } from './lib/boot';
import { arrange, loadConfig, saveConfig, type Config } from './lib/config';
import { launch, toast } from './lib/luna';
import { KEY } from './lib/keys';
import { perf } from './lib/perf';
import { select, setSoundsEnabled, tick } from './lib/sound';
import { useFocus, type Focus } from './hooks/useFocus';
import { useInputs, STATE_TEXT } from './hooks/useInputs';
import { useIdle } from './hooks/useIdle';
import { useNuvio } from './hooks/useNuvio';
import { Home } from './screens/Home';
import { Settings } from './screens/Settings';

declare const __APP_VERSION__: string;

export function App() {
  const [config, setConfig] = useState<Config>(loadConfig);
  const [screen, setScreen] = useState<'home' | 'settings'>('home');
  const [moving, setMoving] = useState<string | null>(null);
  const [exists, setExists] = useState<Record<string, boolean>>(cachedExists);
  const inputs = useInputs();
  const idle = useIdle(config.idleMs);
  const nuvio = useNuvio();

  const updateConfig = useCallback((c: Config) => { setConfig(c); saveConfig(c); }, []);
  useEffect(() => { setSoundsEnabled(config.sounds); }, [config.sounds]);

  // Inputs and utilities always show; apps show once the TV confirms them.
  // An input entry carries its live state in the subtitle.
  const apps = useMemo(
    () => arrange(CATALOGUE, config)
      .filter((e) => e.kind === 'input' || exists[e.key] !== false)
      .map((e) => {
        const info = e.kind === 'input' ? inputs[e.appId] : undefined;
        return info ? { ...e, subtitle: `${e.subtitle} · ${STATE_TEXT[info.state]}`, state: info.state } : e;
      }),
    [exists, inputs, config],
  );
  const utils = useMemo(() => CATALOGUE.filter((e) => e.kind === 'utility'), []);

  const open = useCallback((e: Entry) => {
    if (e.key === 'sill') { select(); setScreen('settings'); return; }
    select();
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

  const orderBefore = useRef<string[]>([]);
  const hold = useCallback((f: Focus) => {
    if (f.zone !== 'list') return;
    const e = apps[f.index];
    if (e) { select(); orderBefore.current = config.order; setMoving(e.key); }
  }, [apps, config.order]);

  const counts = useMemo(() => ({ list: apps.length, utils: utils.length }), [apps.length, utils.length]);
  const { focus, set, hover } = useFocus(counts, screen === 'home' && !moving, { onActivate: activate, onHold: hold });

  // Move mode: Up/Down shift the lifted row through the saved order, OK
  // places it, Back cancels and restores the order from before.
  useEffect(() => {
    if (!moving) return;
    const down = (e: KeyboardEvent) => {
      const dir = e.keyCode === KEY.up ? -1 : e.keyCode === KEY.down ? 1 : 0;
      if (dir) {
        const visible = apps.map((a) => a.key);
        const i = visible.indexOf(moving);
        const j = i + dir;
        if (j >= 0 && j < visible.length) {
          const order = [...config.order];
          const a = order.indexOf(visible[i]);
          const b = order.indexOf(visible[j]);
          [order[a], order[b]] = [order[b], order[a]];
          updateConfig({ ...config, order });
          set({ zone: 'list', index: j });
          tick();
        }
      } else if (e.keyCode === KEY.ok) { if (!e.repeat) { select(); setMoving(null); } }
      else if (e.keyCode === KEY.back || e.keyCode === KEY.escape) { updateConfig({ ...config, order: orderBefore.current }); setMoving(null); }
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [moving, config, apps, updateConfig, set]);

  useEffect(() => {
    perf.framePainted();
    // Work that isn't needed for the first frame waits for it.
    const t = setTimeout(() => { refreshExists().then(setExists); }, 400);
    // Coming back from another app: land on the list again.
    const relaunch = () => { setScreen('home'); setMoving(null); set({ zone: 'list', index: 0 }); window.webOSSystem?.activate(); };
    document.addEventListener('webOSRelaunch', relaunch);
    return () => { clearTimeout(t); document.removeEventListener('webOSRelaunch', relaunch); };
  }, []);

  if (screen === 'settings') {
    return <Settings config={config} nuvio={nuvio} onChange={updateConfig} onBack={() => { select(); setScreen('home'); }} version={__APP_VERSION__} />;
  }
  return <Home apps={apps} utils={utils} focus={focus} idle={idle} moving={moving} nuvio={nuvio} onHover={hover} onOpen={open} />;
}
