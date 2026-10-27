import { useEffect, useState } from 'preact/hooks';
import { CATALOGUE } from '../catalogue';
import { IDLE_CHOICES, type Config } from '../lib/config';
import { KEY } from '../lib/keys';
import { tick, select } from '../lib/sound';
import type { Nuvio } from '../hooks/useNuvio';
import { unlink } from '../lib/nuvio';

// Nox's own settings: a short vertical list. Left/Right change a value, OK
// toggles, Back returns home.

interface Props { config: Config; nuvio: Nuvio; onChange: (c: Config) => void; onBack: () => void; version: string }

type Row =
  | { kind: 'idle' }
  | { kind: 'sounds' }
  | { kind: 'hidden'; key: string }
  | { kind: 'nuvio' }
  | { kind: 'version' };

export function Settings({ config, nuvio, onChange, onBack, version }: Props) {
  const apps = CATALOGUE.filter((e) => e.kind !== 'utility');
  const rows: Row[] = [
    { kind: 'idle' }, { kind: 'sounds' },
    ...apps.map((e) => ({ kind: 'hidden' as const, key: e.key })),
    { kind: 'nuvio' }, { kind: 'version' },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const idleIdx = () => Math.max(0, IDLE_CHOICES.findIndex((c) => c.ms === config.idleMs));
    const adjust = (dir: 1 | -1) => {
      const row = rows[index];
      if (row.kind === 'idle') {
        const next = IDLE_CHOICES[(idleIdx() + dir + IDLE_CHOICES.length) % IDLE_CHOICES.length];
        onChange({ ...config, idleMs: next.ms });
      } else if (row.kind === 'sounds') onChange({ ...config, sounds: !config.sounds });
      else if (row.kind === 'hidden') {
        const hidden = config.hidden.includes(row.key) ? config.hidden.filter((k) => k !== row.key) : [...config.hidden, row.key];
        onChange({ ...config, hidden });
      } else if (row.kind === 'nuvio' && nuvio.status === 'linked') { unlink(); location.reload(); }
      select();
    };
    const down = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.up:   setIndex((i) => { const n = Math.max(0, i - 1); if (n !== i) tick(); return n; }); break;
        case KEY.down: setIndex((i) => { const n = Math.min(rows.length - 1, i + 1); if (n !== i) tick(); return n; }); break;
        case KEY.left: adjust(-1); break;
        case KEY.right: case KEY.ok: adjust(1); break;
        case KEY.back: case KEY.escape: onBack(); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [index, config, nuvio.status, onChange, onBack]);

  const value = (row: Row): string => {
    switch (row.kind) {
      case 'idle': return IDLE_CHOICES.find((c) => c.ms === config.idleMs)?.label ?? `${config.idleMs / 1000} s`;
      case 'sounds': return config.sounds ? 'On' : 'Off';
      case 'hidden': return config.hidden.includes(row.key) ? 'Hidden' : 'Shown';
      case 'nuvio': return nuvio.status === 'linked' ? 'Linked · OK to unlink' : 'Not linked · focus Nuvio on the home screen to scan';
      case 'version': return version;
    }
  };
  const label = (row: Row): string => {
    switch (row.kind) {
      case 'idle': return 'Ambient after';
      case 'sounds': return 'Sounds';
      case 'hidden': return apps.find((e) => e.key === row.key)?.title ?? row.key;
      case 'nuvio': return 'Nuvio account';
      case 'version': return 'Nox';
    }
  };
  const section = (i: number): string | null => {
    if (i === 0) return 'Screen';
    if (rows[i].kind === 'hidden' && rows[i - 1].kind !== 'hidden') return 'Apps';
    if (rows[i].kind === 'nuvio') return 'Accounts';
    return null;
  };

  return (
    <main class="settings">
      <h1 class="settings__title">Settings</h1>
      <ul class="settings__list" role="listbox" aria-label="Settings">
        {rows.map((row, i) => (
          <>
            {section(i) && <li class="settings__section" key={`s${i}`}>{section(i)}</li>}
            <li key={i} class={`setting${i === index ? ' is-focused' : ''}`} role="option" aria-selected={i === index} onMouseEnter={() => setIndex(i)}>
              <span class="setting__label">{label(row)}</span>
              <span class="setting__value">{value(row)}</span>
            </li>
          </>
        ))}
      </ul>
      <p class="settings__hint">Left and Right change a value · Back returns home · Hold OK on the home screen to move an app</p>
    </main>
  );
}
