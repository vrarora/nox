import { useEffect } from 'preact/hooks';
import type { Entry } from '../catalogue';
import type { Nuvio } from '../hooks/useNuvio';
import { Glyph } from './Glyph';
import { Qr } from './Qr';

// The panel on the right: the focused app's mark lit in its colour, or, for
// Nuvio, what you were watching, or the QR code that links the account.

export function Preview({ current, nuvio }: { current: Entry | undefined; nuvio: Nuvio }) {
  const isNuvio = current?.key === 'nuvio';

  useEffect(() => {
    if (isNuvio && nuvio.status === 'unlinked') nuvio.startLinking();
  }, [isNuvio, nuvio.status]);

  if (isNuvio && nuvio.status === 'linked' && nuvio.items[0]) {
    const it = nuvio.items[0];
    const where = it.type === 'series' && it.season != null ? `S${it.season} E${it.episode}` : 'Film';
    const line = [where, it.episodeTitle, it.remainingMin ? `${it.remainingMin} min left` : null].filter(Boolean).join(' · ');
    return (
      <section class="preview preview--art" aria-live="polite" key="art">
        {it.background && <img class="preview__art" src={it.background} alt="" />}
        <div class="preview__scrim" />
        <div class="preview__caption">
          <div class="preview__kicker">Continue watching</div>
          <div class="preview__title">{it.title}</div>
          <div class="preview__line">{line}</div>
          <div class="preview__bar"><i style={{ width: `${Math.round(it.pct * 100)}%` }} /></div>
        </div>
      </section>
    );
  }

  if (isNuvio && nuvio.status !== 'linked') {
    return (
      <section class="preview preview--link" aria-live="polite" key="link">
        {nuvio.link
          ? <Qr text={nuvio.link.url} size={220} />
          : <div class="preview__glyph preview__glyph--small"><Glyph name="nuvio" /></div>}
        <div class="preview__text">
          <div class="preview__kicker">{nuvio.link ? 'Scan with your phone' : 'Nuvio'}</div>
          <div class="preview__title">{nuvio.link ? 'Link your Nuvio account to see what to resume' : 'Preparing to link…'}</div>
          {nuvio.link && <div class="preview__line">Code {nuvio.link.userCode}</div>}
        </div>
      </section>
    );
  }

  return (
    <section class="preview" aria-live="polite" key="glyph">
      <div class="preview__glyph" key={current?.key}><Glyph name={current?.key ?? ''} /></div>
      <div class="preview__text">
        <div class="preview__kicker">{current?.kind === 'input' ? 'Switch to' : 'Open'}</div>
        <div class="preview__title">{current?.subtitle ? `${current.title} · ${current.subtitle}` : current?.title}</div>
      </div>
    </section>
  );
}
