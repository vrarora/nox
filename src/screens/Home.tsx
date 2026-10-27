import type { Entry } from '../catalogue';
import { Glyph } from '../components/Glyph';

interface Props {
  entries: Entry[];
  index: number;
  onHover: (i: number) => void;
  onOpen: (e: Entry) => void;
}

export function Home({ entries, index, onHover, onOpen }: Props) {
  const focused = entries[index];
  return (
    <main class="home" style={{ '--accent': focused?.colour ?? '#fff' }}>
      <ul class="list" role="listbox" aria-label="Apps">
        {entries.map((e, i) => (
          <li
            key={e.key}
            class={`row row--${e.kind}${i === index ? ' is-focused' : ''}`}
            style={{ '--i': i - index }}
            role="option"
            aria-selected={i === index}
            onMouseEnter={() => onHover(i)}
            onClick={() => onOpen(e)}
          >
            <span class="row__glyph" style={{ color: i === index ? e.colour : undefined }}><Glyph name={e.key} /></span>
            <span class="row__title">{e.title}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
