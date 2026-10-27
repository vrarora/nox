// Adds launch-param deep links to an installed Nuvio TV 1.2.9 build.
// Pull the app from the TV first, patch, then package and install:
//
//   ssh ... "cd /media/developer/apps/usr/palm && tar cf - applications/space.nuvio.webos services/space.nuvio.webos.service services/space.nuvio.webos.plugin.service" | tar xf - -C pkg
//   node scripts/nuvio/patch.mjs pkg/applications/space.nuvio.webos
//   npx ares-package pkg/applications/space.nuvio.webos pkg/services/space.nuvio.webos.service pkg/services/space.nuvio.webos.plugin.service -o out
//   npx ares-install -d lgtv out/space.nuvio.webos_1.2.9_all.ipk
//
// The two bundle edits route to __sillOpen (deeplink.js) when launch params
// carry an itemId: once in the webOSRelaunch recovery, once after the
// profile has been entered on a cold start.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const app = resolve(process.argv[2] ?? '');
if (!app) throw new Error('usage: patch.mjs <app dir>');

const edits = [
  ['app.bundle.js',
    'bA.isWebOsResumeRouteRestorable(t)?"function"==typeof bA.persistWebOsResumeRoute&&bA.persistWebOsResumeRoute(t,bA.currentParams||{}):await bA.navigate("home",{},{replaceHistory:!0,skipStackPush:!0})',
    (s) => `window.__sillTarget&&bA.isWebOsResumeRouteRestorable(t)?await window.__sillOpen(bA):${s}`],
  ['app.bundle.js',
    'gR.started?{forceReload:!0}:{}))}',
    () => 'gR.started?{forceReload:!0}:{})),window.__sillTarget&&await window.__sillOpen(bA)}'],
  ['index.html',
    '  <script src="boot-guard.js"></script>\n',
    (s) => `${s}  <script src="deeplink.js"></script>\n`],
];

for (const [file, needle, replace] of edits) {
  const path = resolve(app, file);
  const text = readFileSync(path, 'utf8');
  const n = text.split(needle).length - 1;
  if (n !== 1) throw new Error(`${file}: expected one match for ${needle.slice(0, 40)}…, found ${n}`);
  writeFileSync(path, text.replace(needle, replace(needle)));
}
copyFileSync(resolve(import.meta.dirname, 'deeplink.js'), resolve(app, 'deeplink.js'));
console.log('patched', app);
