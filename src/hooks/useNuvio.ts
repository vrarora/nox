import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { cachedItems, continueWatching, exchangeLink, isLinked, pollLink, startLink, type Item, type LinkSession } from '../lib/nuvio';

// Nuvio state for the preview panel: linked (with continue-watching items),
// or a QR link session that polls until the phone approves it.

export type NuvioStatus = 'unlinked' | 'linking' | 'linked';

export interface Nuvio {
  status: NuvioStatus;
  link: LinkSession | null;
  items: Item[];
  startLinking: () => void;
}

const REFRESH_MS = 10 * 60_000;

export function useNuvio(): Nuvio {
  const [status, setStatus] = useState<NuvioStatus>(() => (isLinked() ? 'linked' : 'unlinked'));
  const [link, setLink] = useState<LinkSession | null>(null);
  const [items, setItems] = useState<Item[]>(cachedItems);
  const linking = useRef(false);

  const refresh = useCallback(async () => {
    const next = await continueWatching();
    if (next) setItems(next);
  }, []);

  useEffect(() => {
    if (status !== 'linked') return;
    let timer = window.setTimeout(function tick() { refresh(); timer = window.setTimeout(tick, REFRESH_MS); }, 2000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [status, refresh]);

  const startLinking = useCallback(() => {
    if (linking.current || status === 'linked') return;
    linking.current = true;
    (async () => {
      const s = await startLink();
      if (!s) { linking.current = false; return; }
      setLink(s);
      setStatus('linking');
      while (Date.now() < s.expiresAt) {
        await new Promise((r) => setTimeout(r, s.intervalMs));
        const result = await pollLink(s);
        if (result === 'approved') {
          if (await exchangeLink(s)) { setStatus('linked'); setLink(null); linking.current = false; return; }
          break;
        }
        if (result === 'expired') break;
      }
      setLink(null);
      setStatus('unlinked');
      linking.current = false;
    })();
  }, [status]);

  return { status, link, items, startLinking };
}
