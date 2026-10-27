// dist/ → build/<id>_<version>_all.ipk via ares-package.
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
mkdirSync(resolve(root, 'build'), { recursive: true });

// App icons come from brand/nox-icon; regenerate them with scripts/export-icon.mjs
// LG Home caches icons by path, so a changed icon also needs a new file name in appinfo.json
copyFileSync(resolve(root, 'brand/nox-icon/png/webos/icon.png'), resolve(root, 'dist', info.icon));
copyFileSync(resolve(root, 'brand/nox-icon/png/webos/largeIcon.png'), resolve(root, 'dist', info.largeIcon));

// Black splash, generated so the repo holds no splash binary
import { deflateSync } from 'node:zlib';
function png(w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  const crc = (buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (~c) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
writeFileSync(resolve(root, 'dist', 'splash.png'), png(1920, 1080));

execFileSync('npx', ['ares-package', '--no-minify', resolve(root, 'dist'), '-o', resolve(root, 'build')], { stdio: 'inherit', cwd: root });
console.log(`packaged ${info.id} ${info.version}`);
