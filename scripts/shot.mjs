// Screenshot of the running app over DevTools, plus any expression you pass.
// Usage: node scripts/shot.mjs [out.png] [js-expression]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
const device = process.env.TV_DEVICE ?? 'lgtv';
const appId = process.env.APP_ID ?? info.id;
const out = resolve(process.argv[2] ?? 'build/shot.png');
const expr = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn('npx', ['ares-inspect', '-d', device, '-a', appId], { cwd: root });
let port = null;
proc.stdout.on('data', (d) => { const m = String(d).match(/localhost:(\d+)/); if (m) port = m[1]; });
for (let i = 0; i < 40 && !port; i++) await sleep(250);
if (!port) { proc.kill(); throw new Error('ares-inspect gave no port'); }
let ws = null;
for (let i = 0; i < 20 && !ws; i++) {
  try { const list = await fetch(`http://localhost:${port}/json`).then((r) => r.json()); ws = (list.find((p) => p.type === 'page') ?? list[0])?.webSocketDebuggerUrl; } catch { /* retry */ }
  if (!ws) await sleep(250);
}
if (!ws) { proc.kill(); throw new Error('no DevTools page'); }

const sock = new WebSocket(ws);
let id = 0;
const pending = new Map();
const call = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); sock.send(JSON.stringify({ id, method, params })); });
sock.onmessage = ({ data }) => { const m = JSON.parse(data); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
await new Promise((r) => { sock.onopen = r; });

if (expr) {
  const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result.value, null, 1));
}
const shot = await call('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('wrote', out);
sock.close();
proc.kill();
