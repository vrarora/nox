// Read or write the launcher's settings on the TV while it is running.
//   node scripts/config.mjs pull            prints the current config
//   node scripts/config.mjs push config.json   replaces it and reloads the app
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
const device = process.env.TV_DEVICE ?? 'lgtv';
const [mode, file] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn('npx', ['ares-inspect', '-d', device, '-a', info.id], { cwd: root });
let port = null;
proc.stdout.on('data', (d) => { const m = String(d).match(/localhost:(\d+)/); if (m) port = m[1]; });
for (let i = 0; i < 40 && !port; i++) await sleep(250);
if (!port) { proc.kill(); throw new Error('ares-inspect gave no port; is the app running?'); }
let ws = null;
for (let i = 0; i < 20 && !ws; i++) {
  try { const list = await fetch(`http://localhost:${port}/json`).then((r) => r.json()); ws = (list.find((p) => p.type === 'page') ?? list[0])?.webSocketDebuggerUrl; } catch { /* retry */ }
  if (!ws) await sleep(250);
}
if (!ws) { proc.kill(); throw new Error('no DevTools page'); }
const sock = new WebSocket(ws);
await new Promise((r) => { sock.onopen = r; });
const evaluate = (expression) => new Promise((res) => {
  sock.onmessage = ({ data }) => { const m = JSON.parse(data); if (m.id === 1) res(m.result.result.value); };
  sock.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
});

if (mode === 'pull') {
  const raw = await evaluate(`localStorage.getItem('nox.config.v1')`);
  console.log(raw ? JSON.stringify(JSON.parse(raw), null, 2) : '(defaults; nothing saved yet)');
} else if (mode === 'push' && file) {
  const json = JSON.stringify(JSON.parse(readFileSync(resolve(file), 'utf8')));
  await evaluate(`localStorage.setItem('nox.config.v1', ${JSON.stringify(json)}); location.reload(); 'ok'`);
  console.log('pushed and reloaded');
} else {
  console.log('usage: node scripts/config.mjs pull | push <file.json>');
}
sock.close();
proc.kill();
