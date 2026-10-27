import { useEffect, useState } from 'preact/hooks';
import type { Clock } from '../hooks/useClock';
import type { Weather } from '../hooks/useWeather';

// The idle screen: a slow-drifting backdrop with the clock and weather. The
// whole layer steps through eight pixel offsets, one a minute, for the OLED.

const SHIFTS: Array<[number, number]> = [[0, 0], [6, 2], [8, 7], [3, 9], [-2, 6], [-7, 3], [-6, -3], [-1, -6]];

interface Props { active: boolean; clock: Clock; weather: Weather | null; place: string }

export function Ambient({ active, clock, weather, place }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setStep((s) => (s + 1) % SHIFTS.length), 60_000);
    return () => clearInterval(t);
  }, [active]);
  const [sx, sy] = SHIFTS[step];

  return (
    <div class={`ambient${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <div class="ambient__backdrop" />
      <div class="ambient__content" style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div class="ambient__time">{clock.time}<span class="ambient__suffix">{clock.suffix}</span></div>
        <div class="ambient__line">{clock.date}{weather ? ` · ${weather.temp}° ${place}, ${weather.text}` : ''}</div>
      </div>
    </div>
  );
}
