// Two quiet sounds, synthesised so there are no files to load: a tick when
// focus moves and a soft two-note tone on select. Built on the first key.

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundsEnabled(on: boolean) { enabled = on; }

function context(): AudioContext | null {
  if (ctx) return ctx;
  try { ctx = new AudioContext(); } catch { ctx = null; }
  return ctx;
}

function blip(freq: number, at: number, ms: number, gain: number, type: OscillatorType = 'sine') {
  const c = context();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000);
  o.connect(g).connect(c.destination);
  o.start(at);
  o.stop(at + ms / 1000 + 0.02);
}

export function tick() {
  if (!enabled) return;
  const c = context();
  if (!c) return;
  blip(1800, c.currentTime, 28, 0.035, 'triangle');
}

export function select() {
  if (!enabled) return;
  const c = context();
  if (!c) return;
  blip(660, c.currentTime, 70, 0.05);
  blip(990, c.currentTime + 0.055, 110, 0.045);
}
