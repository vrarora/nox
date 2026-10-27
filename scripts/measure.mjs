// Cold-start numbers from the TV. Closes the app, launches it, attaches
// DevTools and prints window.__sill plus navigation timing.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
const device = process.env.TV_DEVICE ?? 'lgtv';
const runs = Number(process.argv[2] ?? 1);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cli = (args) => execFileSync('npx', args, { cwd: root, stdio: 'pipe' }).toString();

async function inspectUrl() {
  const proc = spawn('npx', ['ares-inspect', '-d', device, '-a', info.id], { cwd: root });
  let port = null;
  proc.stdout.on('data', (d) => { const m = String(d).match(/localhost:(\d+)/); if (m) port = m[1]; });
  for (let i = 0; i < 40 && !port; i++) await sleep(250);
  if (!port) { proc.kill(); throw new Error('ares-inspect gave no port'); }
  for (let i = 0; i < 20; i++) {
    try {
      const list = await fetch(`http://localhost:${port}/json`).then((r) => r.json());
      const page = list.find((p) => p.type === 'page') ?? list[0];
      if (page?.webSocketDebuggerUrl) return { ws: page.webSocketDebuggerUrl, proc };
    } catch { /* not up yet */ }
    await sleep(250);
  }
  proc.kill();
  throw new Error('no DevTools page');
}

function evaluate(ws, expression) {
  return new Promise((resolve, reject) => {
    const sock = new WebSocket(ws);
    const t = setTimeout(() => { sock.close(); reject(new Error('cdp timeout')); }, 8000);
    sock.onopen = () => sock.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    sock.onmessage = ({ data }) => { const m = JSON.parse(data); if (m.id === 1) { clearTimeout(t); sock.close(); resolve(m.result.result.value); } };
    sock.onerror = (e) => { clearTimeout(t); reject(e); };
  });
}

const EXPR = `JSON.stringify((() => {
  const n = performance.getEntriesByType('navigation')[0] || {};
  return { ...window.__sill, dom: Math.round(n.domContentLoadedEventEnd || 0), load: Math.round(n.loadEventEnd || 0),
           navStart: performance.timeOrigin, now: Date.now() };
})())`;

for (let run = 1; run <= runs; run++) {
  try { cli(['ares-launch', '-d', device, '--close', info.id]); } catch { /* not running */ }
  await sleep(1500);
  const launchedAt = Date.now();
  cli(['ares-launch', '-d', device, info.id]);
  await sleep(2500);
  const { ws, proc } = await inspectUrl();
  const r = JSON.parse(await evaluate(ws, EXPR));
  proc.kill();
  const skew = r.now - Date.now();
  const toNav = Math.round(r.navStart - skew - launchedAt);
  console.log(`run ${run}: launch→navigationStart ≈ ${toNav} ms (clock skew ${skew} ms) · script ${r.script} · render ${r.render} · painted ${r.painted} · fcp ${r.fcp} · DOMContentLoaded ${r.dom} · load ${r.load}  [ms after navigationStart]`);
}
