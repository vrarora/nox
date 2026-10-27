// Nuvio's account backend (Supabase). The launcher links with its own QR
// device login and keeps its own token pair, then reads the active profile's
// watch progress and resolves titles and artwork through Cinemeta.

const BASE = 'https://api.nuvio.tv';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgxNTIxMzQ2LCJleHAiOjE5MzkyMDEzNDZ9.tmQaj682pwzehpqlgCDMnySOqiUvpgRbrE43T4VJpDI';
const LINK_BASE = 'https://nuvio.tv/link';
const CINEMETA = 'https://v3-cinemeta.strem.io';
const TOKENS_KEY = 'nox.nuvio.v1';
const ITEMS_KEY = 'nox.nuvio.cw.v1';
const META_KEY = 'nox.nuvio.meta.v1';
const PROFILE = 1;

type Json = Record<string, unknown>;

interface Tokens { access: string; refresh: string; anonymous: boolean }

function loadTokens(): Tokens | null {
  try { return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? 'null'); } catch { return null; }
}
function saveTokens(t: Tokens | null) {
  if (t) localStorage.setItem(TOKENS_KEY, JSON.stringify(t)); else localStorage.removeItem(TOKENS_KEY);
}

export function isLinked(): boolean {
  const t = loadTokens();
  return !!t && !t.anonymous;
}

function jwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now() + 30_000;
  } catch { return true; }
}

async function post(path: string, body: Json, bearer: string): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${bearer}` },
    body: JSON.stringify(body),
  });
}

function pickTokens(payload: Json, anonymous: boolean): Tokens | null {
  const access = (payload.access_token ?? (payload.session as Json | undefined)?.access_token) as string | undefined;
  const refresh = (payload.refresh_token ?? (payload.session as Json | undefined)?.refresh_token) as string | undefined;
  return access && refresh ? { access, refresh, anonymous } : null;
}

async function refresh(): Promise<Tokens | null> {
  const t = loadTokens();
  if (!t) return null;
  const r = await post('/auth/v1/token?grant_type=refresh_token', { refresh_token: t.refresh }, ANON);
  if (!r.ok) {
    if (r.status === 400 || r.status === 401) saveTokens(null);
    return null;
  }
  const next = pickTokens(await r.json(), t.anonymous);
  if (next) saveTokens(next);
  return next;
}

// A session the device-login RPCs can be called with: the real one, or an
// anonymous one made on the spot.
async function session(): Promise<Tokens | null> {
  let t = loadTokens();
  if (t && jwtExpired(t.access)) t = await refresh();
  if (t) return t;
  const r = await post('/auth/v1/signup', { data: { tv_client: 'nox' } }, ANON);
  if (!r.ok) return null;
  const made = pickTokens(await r.json(), true);
  if (made) saveTokens(made);
  return made;
}

async function rpc<T = unknown>(name: string, body: Json): Promise<T | null> {
  let t = await session();
  if (!t) return null;
  let r = await post(`/rest/v1/rpc/${name}`, body, t.access);
  if (r.status === 401) {
    t = await refresh();
    if (!t) return null;
    r = await post(`/rest/v1/rpc/${name}`, body, t.access);
  }
  if (!r.ok) return null;
  const text = await r.text();
  return text ? JSON.parse(text) as T : null;
}

// ---- Device login ----

export interface LinkSession { code: string; userCode: string; url: string; expiresAt: number; intervalMs: number; nonce: string }

export async function startLink(): Promise<LinkSession | null> {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  const raw = await rpc<Json | Json[]>('start_device_login_session', {
    p_device_nonce: nonce, p_redirect_base_url: LINK_BASE, p_device_type: 'tv', p_device_name: 'Nox on LG OLED',
  });
  const row = (Array.isArray(raw) ? raw[0] : raw) as Json | undefined;
  if (!row) return null;
  const code = String(row.device_code ?? row.deviceCode ?? row.code ?? '');
  const userCode = String(row.user_code ?? row.userCode ?? code);
  const url = String(row.verification_uri_complete ?? row.verificationUriComplete ?? '');
  if (!code || !url) return null;
  const expiresAt = row.expires_at ? new Date(String(row.expires_at)).getTime() : Date.now() + 10 * 60_000;
  const intervalMs = Math.max(2, Number(row.poll_interval_seconds ?? row.pollIntervalSeconds ?? 3)) * 1000;
  return { code, userCode, url, expiresAt, intervalMs, nonce };
}

export async function pollLink(s: LinkSession): Promise<'pending' | 'approved' | 'expired' | 'error'> {
  const raw = await rpc<Json | Json[] | string>('poll_tv_login_session', { p_code: s.code, p_device_nonce: s.nonce });
  const row = (Array.isArray(raw) ? raw[0] : raw) as Json | string | null;
  const status = typeof row === 'string' ? row : String(row?.status ?? '');
  if (status === 'approved') return 'approved';
  if (status === 'expired' || status === 'denied' || status === 'consumed') return 'expired';
  return row ? 'pending' : 'error';
}

export async function exchangeLink(s: LinkSession): Promise<boolean> {
  const t = await session();
  if (!t) return false;
  const r = await post('/functions/v1/tv-logins-exchange', { code: s.code, device_nonce: s.nonce }, t.access);
  if (!r.ok) return false;
  const real = pickTokens(await r.json(), false);
  if (!real) return false;
  saveTokens(real);
  return true;
}

export function unlink() { saveTokens(null); localStorage.removeItem(ITEMS_KEY); }

// ---- Continue watching ----

export interface Item {
  id: string;
  type: 'movie' | 'series';
  title: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
  poster?: string;
  background?: string;
  pct: number;
  remainingMin: number;
  at: number;
}

interface ProgressRow {
  content_id: string; content_type?: string; season?: number; episode?: number;
  position?: number; duration?: number; position_ms?: number; duration_ms?: number;
  last_watched?: number | string; updated_at?: number | string;
}

interface Meta { name: string; poster?: string; background?: string; videos?: Array<{ season: number; episode: number; title?: string; thumbnail?: string }> }

const metaCache: Record<string, Meta> = (() => { try { return JSON.parse(localStorage.getItem(META_KEY) ?? '{}'); } catch { return {}; } })();

async function meta(type: string, id: string): Promise<Meta | null> {
  const key = `${type}/${id}`;
  if (metaCache[key]) return metaCache[key];
  try {
    const r = await fetch(`${CINEMETA}/meta/${type}/${id}.json`);
    if (!r.ok) return null;
    const m = (await r.json()).meta as Meta;
    if (!m) return null;
    const slim: Meta = { name: m.name, poster: m.poster, background: m.background, videos: m.videos?.map((v) => ({ season: v.season, episode: v.episode, title: v.title, thumbnail: v.thumbnail })) };
    metaCache[key] = slim;
    const keys = Object.keys(metaCache);
    if (keys.length > 40) delete metaCache[keys[0]];
    try { localStorage.setItem(META_KEY, JSON.stringify(metaCache)); } catch { /* full */ }
    return slim;
  } catch { return null; }
}

const ms = (n: number | undefined) => { const v = Number(n ?? 0); return v <= 0 ? 0 : v > 8 * 3600 ? v : v * 1000; };
const when = (v: number | string | undefined) => { if (v == null) return 0; const n = Number(v); if (Number.isFinite(n)) return n > 1e12 ? n : n * 1000; const p = Date.parse(String(v)); return Number.isFinite(p) ? p : 0; };

export function cachedItems(): Item[] {
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]'); } catch { return []; }
}

export async function continueWatching(limit = 6): Promise<Item[] | null> {
  if (!isLinked()) return null;
  const rows = await rpc<ProgressRow[]>('sync_pull_watch_progress', { p_profile_id: PROFILE });
  if (!rows) return null;
  const seen = new Set<string>();
  const picked: Array<ProgressRow & { pct: number; pos: number; dur: number; at: number }> = [];
  for (const r of rows.map((row) => {
    const pos = ms(row.position_ms ?? row.position);
    const dur = ms(row.duration_ms ?? row.duration);
    return { ...row, pos, dur, pct: dur ? pos / dur : 0, at: when(row.updated_at ?? row.last_watched) };
  }).sort((a, b) => b.at - a.at)) {
    if (!r.content_id || seen.has(r.content_id)) continue;
    if (r.dur && (r.pct < 0.02 || r.pct > 0.95)) continue;
    seen.add(r.content_id);
    picked.push(r);
    if (picked.length >= limit) break;
  }
  const items = await Promise.all(picked.map(async (r): Promise<Item> => {
    const type = r.content_type === 'series' ? 'series' : 'movie';
    const m = await meta(type, r.content_id);
    const video = type === 'series' && m?.videos ? m.videos.find((v) => v.season === Number(r.season) && v.episode === Number(r.episode)) : undefined;
    return {
      id: r.content_id, type,
      title: m?.name ?? r.content_id,
      episodeTitle: video?.title,
      season: r.season != null ? Number(r.season) : undefined,
      episode: r.episode != null ? Number(r.episode) : undefined,
      poster: m?.poster,
      background: video?.thumbnail ?? m?.background ?? m?.poster,
      pct: r.pct,
      remainingMin: r.dur ? Math.max(1, Math.round((r.dur - r.pos) / 60_000)) : 0,
      at: r.at,
    };
  }));
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch { /* full */ }
  return items;
}
