// Which catalogue entries exist on this TV. The answer is cached so the first
// frame is right without waiting for Luna; the live check corrects it after.

import { CATALOGUE } from '../catalogue';
import { appExists } from './luna';

const KEY = 'sill.exists.v1';

export function cachedExists(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}

export async function refreshExists(): Promise<Record<string, boolean>> {
  const pairs = await Promise.all(CATALOGUE.map(async (e) => [e.key, await appExists(e.appId)] as const));
  const map = Object.fromEntries(pairs);
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* storage may be unavailable */ }
  return map;
}
