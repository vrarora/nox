import { useEffect, useState } from 'preact/hooks';
import { luna } from '../lib/luna';

// Time and date, re-rendered once a minute on the minute. The 12/24-hour
// choice follows the TV's own setting, cached so the first frame is right.

const PREF_KEY = 'nox.timeFormat';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface Clock { time: string; suffix: string; date: string }

function format(now: Date, twelveHour: boolean): Clock {
  let h = now.getHours();
  let suffix = '';
  if (twelveHour) { suffix = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; }
  const time = `${h}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  return { time, suffix, date };
}

export function useClock(): Clock {
  const [twelve, setTwelve] = useState(() => localStorage.getItem(PREF_KEY) !== 'HH24');
  const [clock, setClock] = useState(() => format(new Date(), twelve));

  useEffect(() => {
    luna<{ timeFormat?: string }>('luna://com.webos.service.systemservice/getPreferences', { keys: ['timeFormat'] })
      .then((r) => { if (r.timeFormat) { localStorage.setItem(PREF_KEY, r.timeFormat); setTwelve(r.timeFormat !== 'HH24'); } });
  }, []);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const now = new Date();
      setClock(format(now, twelve));
      timer = window.setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 20);
    };
    tick();
    return () => clearTimeout(timer);
  }, [twelve]);

  return clock;
}
