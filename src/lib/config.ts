// User settings. One JSON object in localStorage, also pushable from the Mac
// with scripts/config.mjs. Unknown keys are kept so older builds don't drop
// newer settings.

import { CATALOGUE, type Entry } from '../catalogue';

export interface Config {
  order: string[];       // catalogue keys, list order
  hidden: string[];      // catalogue keys hidden from the list
  idleMs: number;        // 0 = never
  sounds: boolean;
  [extra: string]: unknown;
}

export const CONFIG_KEY = 'sill.config.v1';

export const DEFAULTS: Config = {
  order: CATALOGUE.filter((e) => e.kind !== 'utility').map((e) => e.key),
  hidden: [],
  idleMs: 30_000,
  sounds: true,
};

export const IDLE_CHOICES: Array<{ ms: number; label: string }> = [
  { ms: 15_000, label: '15 seconds' }, { ms: 30_000, label: '30 seconds' }, { ms: 60_000, label: '1 minute' },
  { ms: 120_000, label: '2 minutes' }, { ms: 300_000, label: '5 minutes' }, { ms: 0, label: 'Never' },
];

export function loadConfig(): Config {
  try {
    const raw = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null') as Partial<Config> | null;
    if (!raw) return { ...DEFAULTS };
    const known = new Set(DEFAULTS.order);
    const order = (Array.isArray(raw.order) ? raw.order.filter((k) => known.has(k)) : []);
    for (const k of DEFAULTS.order) if (!order.includes(k)) order.push(k);
    return {
      ...raw,
      order,
      hidden: Array.isArray(raw.hidden) ? raw.hidden.filter((k) => known.has(k)) : [],
      idleMs: typeof raw.idleMs === 'number' ? raw.idleMs : DEFAULTS.idleMs,
      sounds: typeof raw.sounds === 'boolean' ? raw.sounds : DEFAULTS.sounds,
    };
  } catch { return { ...DEFAULTS }; }
}

export function saveConfig(c: Config) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch { /* storage unavailable */ }
}

// The list in the user's order, minus hidden entries.
export function arrange(entries: Entry[], c: Config): Entry[] {
  const byKey = new Map(entries.map((e) => [e.key, e]));
  return c.order.map((k) => byKey.get(k)).filter((e): e is Entry => !!e && !c.hidden.includes(e.key));
}
