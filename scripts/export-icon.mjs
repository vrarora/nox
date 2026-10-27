// Rasterises brand/nox-icon/svg/nox-icon-master.svg into the PNG set with headless Chrome.
// Usage: node scripts/export-icon.mjs   (CHROME=/path/to/chrome to override the browser)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, 'brand/nox-icon');
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const outputs = [
  ...[48, 96, 192, 256, 512].map((s) => [s, `png/nox-icon-${s}.png`]),

  // webOS app row: appinfo.json icon (80) and largeIcon (130)
  [80, 'png/webos/icon.png'],
  [130, 'png/webos/largeIcon.png'],
];

// The SVG goes in as a data URL so the canvas stays untainted and can export
const svg = 'data:image/svg+xml;base64,' + readFileSync(join(dir, 'svg/nox-icon-master.svg')).toString('base64');
const page = `<!doctype html><pre id="o"></pre><script>
const img = new Image();
img.onload = () => {
  const out = {};
  for (const s of ${JSON.stringify([...new Set(outputs.map(([s]) => s))])}) {
    const c = document.createElement('canvas');
    c.width = c.height = s;
    c.getContext('2d').drawImage(img, 0, 0, s, s);
    out[s] = c.toDataURL('image/png').split(',')[1];
  }
  document.getElementById('o').textContent = JSON.stringify(out);
};
img.src = ${JSON.stringify(svg)};
</script>`;

const tmp = mkdtempSync(join(tmpdir(), 'nox-icon-'));
writeFileSync(join(tmp, 'export.html'), page);
const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--virtual-time-budget=5000', '--dump-dom', `file://${tmp}/export.html`], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
const json = dom.match(/<pre id="o">(.*?)<\/pre>/s)?.[1];
if (!json) throw new Error('Chrome returned no render');
const pngs = JSON.parse(json.replace(/&quot;/g, '"'));

for (const [s, file] of outputs) {
  writeFileSync(join(dir, file), Buffer.from(pngs[s], 'base64'));
  console.log(`${file}  ${s}×${s}`);
}
