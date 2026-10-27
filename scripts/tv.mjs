// Talk to the TV through the webOS CLI. Usage: node scripts/tv.mjs install launch | close | inspect
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'public/appinfo.json'), 'utf8'));
const device = process.env.TV_DEVICE ?? 'lgtv';
const ipk = resolve(root, 'build', `${info.id}_${info.version}_all.ipk`);

const run = (args) => execFileSync('npx', args, { stdio: 'inherit', cwd: root });

for (const step of process.argv.slice(2)) {
  if (step === 'install') run(['ares-install', '-d', device, ipk]);
  else if (step === 'launch') { console.log('launch at', Date.now()); run(['ares-launch', '-d', device, info.id]); }
  else if (step === 'close') run(['ares-launch', '-d', device, '--close', info.id]);
  else if (step === 'remove') run(['ares-install', '-d', device, '-r', info.id]);
  else if (step === 'inspect') run(['ares-inspect', '-d', device, '-a', info.id]);
  else throw new Error(`unknown step ${step}`);
}
