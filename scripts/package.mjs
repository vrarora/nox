// dist/ → build/<id>_<version>_all.ipk via ares-package.
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
mkdirSync(resolve(root, 'build'), { recursive: true });

// Icons and splash come from brand/nox-icon; regenerate them with scripts/export-icon.mjs
// LG Home caches icons by path, so a changed icon also needs a new file name in appinfo.json
const art = (name) => resolve(root, 'brand/nox-icon/png/webos', name);
copyFileSync(art('icon.png'), resolve(root, 'dist', info.icon));
copyFileSync(art('largeIcon.png'), resolve(root, 'dist', info.largeIcon));
copyFileSync(art('splash.png'), resolve(root, 'dist', info.splashBackground));

execFileSync('npx', ['ares-package', '--no-minify', resolve(root, 'dist'), '-o', resolve(root, 'build')], { stdio: 'inherit', cwd: root });
console.log(`packaged ${info.id} ${info.version}`);
