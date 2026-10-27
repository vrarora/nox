import type { Entry } from '../catalogue';
import type { Focus } from '../hooks/useFocus';
import { useClock } from '../hooks/useClock';
import { useWeather } from '../hooks/useWeather';
import { Glyph } from '../components/Glyph';
import { Ambient } from '../components/Ambient';

interface Props {
  apps: Entry[];
  utils: Entry[];
  focus: Focus;
  idle: boolean;
  onHover: (f: Focus) => void;
  onOpen: (e: Entry) => void;
}

export function Home({ apps, utils, focus, idle, onHover, onOpen }: Props) {
  const clock = useClock();
  const { weather, place } = useWeather();
  const current = (focus.zone === 'list' ? apps : utils)[focus.index];
  const accent = current?.colour ?? '#ffffff';

  return (
    <main class={`home home--${focus.zone}${idle ? ' home--idle' : ''}`} style={{ '--accent': accent }}>
      <div class="glare" aria-hidden="true" />

      <header class="status">
        <div class="status__time">{clock.time}<span class="status__suffix">{clock.suffix}</span></div>
        <div class="status__line">{weather ? `${weather.temp}° ${place}, ${weather.text}` : place} · {clock.date}</div>
      </header>

      <ul class="list" role="listbox" aria-label="Apps">
        {apps.map((e, i) => {
          const on = focus.zone === 'list' && i === focus.index;
          return (
            <li
              key={e.key}
              class={`row${on ? ' is-focused' : ''}`}
              style={{ '--d': Math.abs(i - (focus.zone === 'list' ? focus.index : 0)) }}
              role="option"
              aria-selected={on}
              onMouseEnter={() => onHover({ zone: 'list', index: i })}
              onClick={() => onOpen(e)}
            >
              <span class="row__glyph" style={on ? { color: e.colour } : undefined}><Glyph name={e.key} /></span>
              <span class="row__title">{e.title}</span>
              {e.state && <span class={`row__state row__state--${e.state}`} title={e.subtitle} />}
            </li>
          );
        })}
      </ul>

      <section class="preview" aria-live="polite">
        <div class="preview__glare" aria-hidden="true" />
        <div class="preview__glyph" key={current?.key}><Glyph name={current?.key ?? ''} /></div>
        <div class="preview__text">
          <div class="preview__kicker">{current?.kind === 'input' ? 'Switch to' : 'Open'}</div>
          <div class="preview__title">{current?.subtitle ? `${current.title} · ${current.subtitle}` : current?.title}</div>
        </div>
      </section>

      <nav class="utils" aria-label="Utilities">
        {utils.map((e, i) => {
          const on = focus.zone === 'utils' && i === focus.index;
          return (
            <button
              key={e.key}
              class={`util${on ? ' is-focused' : ''}`}
              aria-label={e.title}
              onMouseEnter={() => onHover({ zone: 'utils', index: i })}
              onClick={() => onOpen(e)}
            >
              <Glyph name={e.key} />
            </button>
          );
        })}
      </nav>

      <Ambient active={idle} clock={clock} weather={weather} place={place} />
    </main>
  );
}
