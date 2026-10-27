import { useEffect, useState } from 'preact/hooks';

// Open-Meteo, no key. The last reading is cached and shown at once; a fresh
// one is fetched after the first paint and every 30 minutes.

const KEY = 'sill.weather.v1';
const PLACE = { name: 'Mumbai', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata' };
const FRESH_MS = 30 * 60_000;
const STALE_MS = 6 * 60 * 60_000;

export interface Weather { temp: number; text: string; at: number }

function describe(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly cloudy';
  if (code === 3) return 'overcast';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  if (code <= 86) return 'snow showers';
  return 'thunderstorm';
}

function load(): Weather | null {
  try { const w = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Weather | null; return w && Date.now() - w.at < STALE_MS ? w : null; } catch { return null; }
}

async function fetchWeather(): Promise<Weather | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${PLACE.lat}&longitude=${PLACE.lon}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(PLACE.tz)}`;
  try {
    const r = await fetch(url);
    const j = await r.json() as { current?: { temperature_2m: number; weather_code: number } };
    if (!j.current) return null;
    const w = { temp: Math.round(j.current.temperature_2m), text: describe(j.current.weather_code), at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(w));
    return w;
  } catch { return null; }
}

export function useWeather(delayMs = 1500): { weather: Weather | null; place: string } {
  const [weather, setWeather] = useState<Weather | null>(load);
  useEffect(() => {
    let timer = 0;
    const refresh = async () => {
      const w = await fetchWeather();
      if (w) setWeather(w);
      timer = window.setTimeout(refresh, FRESH_MS);
    };
    const due = weather ? Math.max(delayMs, weather.at + FRESH_MS - Date.now()) : delayMs;
    timer = window.setTimeout(refresh, due);
    return () => clearTimeout(timer);
  }, []);
  return { weather, place: PLACE.name };
}
