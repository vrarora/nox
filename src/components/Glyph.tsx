import type { JSX } from 'preact';

// Brand marks. Each has a square viewBox and a silhouette in currentColor;
// the ones with a `lit` variant draw the logo in its own colours when the
// row is focused or the preview shows it. Netflix, YouTube, Spotify,
// PlayStation and the Prime smile come from the owner's brand SVGs; the Nuvio
// mark is traced from the app's PNG; JioHotstar is traced from the 2025 logo.

interface Mark { vb: string; mono: JSX.Element; lit?: JSX.Element; rest?: JSX.Element }

// Nox's own mark keeps its metal in both states: `rest` is the subdued
// finish, `lit` the bright one. Path and lighting match brand/nox-icon/svg.
const NOX = 'M56.01 44L151.93 96.9L151.93 131.34L86.17 95.07L86.17 212L56.01 212ZM199.99 212L104.07 159.1L104.07 124.66L169.83 160.93L169.83 44L199.99 44Z';
const NOX_BODY_AT = [0, 0.3, 0.5, 0.63, 0.84, 1];
interface Metal { body: string[]; pool: number; sheen: number; crease: number; falloff: number; rim: number }
const NOX_IDLE: Metal = { body: ['#6F7277', '#56585D', '#3E4044', '#46484C', '#2A2B2E', '#26272A'], pool: 0.1, sheen: 0.07, crease: 0.2, falloff: 0.22, rim: 0.1 };
const NOX_SELECTED: Metal = { body: ['#E6E8EC', '#ADB0B6', '#7F8288', '#91949A', '#56595E', '#3B3D41'], pool: 0.3, sheen: 0.22, crease: 0.22, falloff: 0.2, rim: 0.14 };

function noxMetal(id: string, t: Metal) {
  const ref = (n: string) => `url(#${id}-${n})`;
  return <g>
    <defs>
      <clipPath id={`${id}-clip`}><path d={NOX} /></clipPath>
      <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1="56" y1="44" x2="200" y2="212">
        {t.body.map((c, i) => <stop offset={NOX_BODY_AT[i]} stop-color={c} />)}
      </linearGradient>
      <linearGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" x1="70" y1="150" x2="150" y2="40"><stop offset="0.25" stop-color="#fff" stop-opacity="0" /><stop offset="0.55" stop-color="#fff" stop-opacity={t.sheen} /><stop offset="0.8" stop-color="#fff" stop-opacity="0" /></linearGradient>
      <radialGradient id={`${id}-pool`} gradientUnits="userSpaceOnUse" cx="64" cy="48" r="110"><stop offset="0" stop-color="#fff" stop-opacity={t.pool} /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
      <linearGradient id={`${id}-crease`} gradientUnits="userSpaceOnUse" x1="164" y1="119.3" x2="139.9" y2="163.1"><stop offset="0" stop-color="#000" stop-opacity="0" /><stop offset="0.33" stop-color="#000" stop-opacity={t.crease} /><stop offset="0.67" stop-color="#000" stop-opacity={t.crease} /><stop offset="1" stop-color="#000" stop-opacity="0" /></linearGradient>
      <linearGradient id={`${id}-arms-fade`} gradientUnits="userSpaceOnUse" x1="86.17" x2="169.83"><stop offset="0" stop-color="#000" /><stop offset="0.25" stop-color="#fff" /><stop offset="0.75" stop-color="#fff" /><stop offset="1" stop-color="#000" /></linearGradient>
      <mask id={`${id}-arms`}><rect width="256" height="256" fill={ref('arms-fade')} /></mask>
      <linearGradient id={`${id}-falloff`} gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="212"><stop offset="0" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity={t.falloff} /></linearGradient>
    </defs>
    <path d={NOX} fill={ref('body')} />
    <g clip-path={ref('clip')}>
      <rect width="256" height="256" fill={ref('pool')} />
      <rect width="256" height="256" fill={ref('sheen')} />
      <rect width="256" height="256" fill={ref('crease')} mask={ref('arms')} />
      <rect width="256" height="256" fill={ref('falloff')} />
      <path d={NOX} transform="translate(0 .8)" fill="#000" fill-opacity={t.rim} />
    </g>
  </g>;
}

const NUVIO_OUTER = 'M8.2 2.6c-1.9-1.1-4.3.3-4.3 2.5v13.8c0 2.2 2.4 3.6 4.3 2.5l12-6.9c1.9-1.1 1.9-3.9 0-5z';
const NUVIO_INNER = 'M9.9 8.1c-.8-.5-1.9.1-1.9 1.1v5.6c0 1 1.1 1.6 1.9 1.1l4.9-2.8c.8-.5.8-1.7 0-2.2z';
const NUVIO_PLAY = 'M10.9 10.1v3.8l3.3-1.9z';
const PRIME_SMILE = "M2246 2723.1a2591.3 2591.3 0 0 1-591.4-83.5 2159.7 2159.7 0 0 1-516.8-208.3A1728.5 1728.5 0 0 1 679.1 2060c-55.6-63.6-86-106.3-101-141.4a93 93 0 0 1-9-35.5c-1.2-22.7 6-36.6 23.6-45.2 6.3-3.2 7-3.3 18.6-3.3a51 51 0 0 1 19 2.3c20.3 6.6 46.1 22.7 79.5 49.4a2069.6 2069.6 0 0 0 372.5 240.3c147.7 74.5 292.3 128.2 473.7 176a3157 3157 0 0 0 627.8 98.4c72.8 4.1 93.8 4.6 189.5 4.6 105.9 0 154.2-1.5 242-7.5 361.5-24.8 718.7-108.9 984.8-231.8a2156 2156 0 0 0 63-31c45.1-22.7 57-28.2 75.7-35 26.3-9.4 44.4-6.3 59.7 10.2a50.4 50.4 0 0 1 14.8 38.5c-5.1 41.5-59 100.4-163.7 179.3-249.6 188-594.4 319.3-974.8 371.2a2718 2718 0 0 1-263.5 22.6 3806 3806 0 0 1-165.4 1zm1615-239.4a51.1 51.1 0 0 1-26.8-24c-7.7-16.8-5.3-31.5 10.4-64.1a572 572 0 0 1 31.9-56.5c41.2-68.3 82.6-159.4 102.1-224.6 19.6-65.4 22-102.6 8-123.8-12-18.2-50.5-29.6-113.2-33.7-24.5-1.6-103.2-.6-126.7 1.5-52.5 4.9-89 10.2-138 20.1-35 7.1-41.8 8-66.5 8-23.9 0-28.8-.7-38.5-5.5a41 41 0 0 1-21-41.6c2.5-13.7 11.4-26.6 27.8-40.3 41.9-35 107.4-69 178.7-92.6a654.9 654.9 0 0 1 232.5-33.3 596 596 0 0 1 133 19.4c71.2 18.4 114.3 42 129.3 71 11.5 22.3 15.8 44.9 15.7 83.6a617 617 0 0 1-33.6 195.2 608 608 0 0 1-156.5 249.2c-53 52.3-89.7 80-119.5 90a57.3 57.3 0 0 1-29 2z";

const marks: Record<string, Mark> = {
  netflix: {
    vb: '16 16 480 480',
    mono: <g><path d="m216.398 16h-91.87v480c30.128-7.135 61.601-10.708 91.87-12.052z" /><path d="m387.472 496v-480h-91.87v468.904c53.636 3.416 91.87 11.096 91.87 11.096z" /><path d="m387.472 496-171.074-480h-91.87l167.03 468.655c55.75 3.276 95.914 11.345 95.914 11.345z" /></g>,
    lit: <g>
      <defs>
        <linearGradient id="nf-a" gradientUnits="userSpaceOnUse" x1="108.142" x2="176.518" y1="240.643" y2="189.038"><stop offset="0" stop-color="#c20000" stop-opacity="0" /><stop offset="1" stop-color="#9d0000" /></linearGradient>
        <linearGradient id="nf-b" gradientUnits="userSpaceOnUse" x1="400.786" x2="338.861" y1="312.035" y2="337.837"><stop offset="0" stop-color="#c20000" stop-opacity="0" /><stop offset="1" stop-color="#9d0000" /></linearGradient>
      </defs>
      <path d="m216.398 16h-91.87v480c30.128-7.135 61.601-10.708 91.87-12.052z" fill="#c20000" />
      <path d="m216.398 16h-91.87v367.267c30.128-7.135 61.601-10.707 91.87-12.051z" fill="url(#nf-a)" />
      <path d="m387.472 496v-480h-91.87v468.904c53.636 3.416 91.87 11.096 91.87 11.096z" fill="#c20000" />
      <path d="m387.472 496v-318.555h-91.87v307.459c53.636 3.416 91.87 11.096 91.87 11.096z" fill="url(#nf-b)" />
      <path d="m387.472 496-171.074-480h-91.87l167.03 468.655c55.75 3.276 95.914 11.345 95.914 11.345z" fill="#fa0000" />
    </g>,
  },
  youtube: {
    vb: '1.376 -35.167 243.258 243.258',
    mono: <g><path d="m239.564 27.912c-2.786-10.449-11.03-18.69-21.516-21.516-18.962-5.07-95.043-5.07-95.043-5.07s-76.042 0-95.043 5.07c-10.448 2.786-18.692 11.03-21.516 21.516-5.07 18.962-5.07 58.55-5.07 58.55s0 39.59 5.07 58.551c2.786 10.45 11.029 18.691 21.516 21.516 19 5.07 95.043 5.07 95.043 5.07s76.08 0 95.043-5.07c10.449-2.786 18.69-11.029 21.516-21.516 5.07-18.962 5.07-58.55 5.07-58.55s0-39.589-5.07-58.55z" /><path d="m98.703 122.955 63.194-36.493-63.194-36.492z" fill="#000" /></g>,
    lit: <g><path d="m239.564 27.912c-2.786-10.449-11.03-18.69-21.516-21.516-18.962-5.07-95.043-5.07-95.043-5.07s-76.042 0-95.043 5.07c-10.448 2.786-18.692 11.03-21.516 21.516-5.07 18.962-5.07 58.55-5.07 58.55s0 39.59 5.07 58.551c2.786 10.45 11.029 18.691 21.516 21.516 19 5.07 95.043 5.07 95.043 5.07s76.08 0 95.043-5.07c10.449-2.786 18.69-11.029 21.516-21.516 5.07-18.962 5.07-58.55 5.07-58.55s0-39.589-5.07-58.55z" fill="#f00" /><path d="m98.703 122.955 63.194-36.493-63.194-36.492z" fill="#fff" /></g>,
  },
  spotify: {
    vb: '0 0 2931 2931',
    mono: <path d="M1465.5 0C656.1 0 0 656.1 0 1465.5S656.1 2931 1465.5 2931 2931 2274.9 2931 1465.5C2931 656.2 2274.9.1 1465.5 0zm672.1 2113.6c-26.3 43.2-82.6 56.7-125.6 30.4-344.1-210.3-777.3-257.8-1287.4-141.3-49.2 11.3-98.2-19.5-109.4-68.7-11.3-49.2 19.4-98.2 68.7-109.4C1242.1 1697.1 1721 1752 2107.3 1988c43 26.5 56.7 82.6 30.3 125.6zm179.3-398.9c-33.1 53.8-103.5 70.6-157.2 37.6-393.8-242.1-994.4-312.2-1460.3-170.8-60.4 18.3-124.2-15.8-142.6-76.1-18.2-60.4 15.9-124.1 76.2-142.5 532.2-161.5 1193.9-83.3 1646.2 194.7 53.8 33.1 70.8 103.4 37.7 157.1zm15.4-415.6c-472.4-280.5-1251.6-306.3-1702.6-169.5-72.4 22-149-18.9-170.9-91.3-21.9-72.4 18.9-149 91.4-171 517.7-157.1 1378.2-126.8 1922 196 65.1 38.7 86.5 122.8 47.9 187.8-38.5 65.2-122.8 86.7-187.8 48z" />,
    lit: <path fill="#2ebd59" d="M1465.5 0C656.1 0 0 656.1 0 1465.5S656.1 2931 1465.5 2931 2931 2274.9 2931 1465.5C2931 656.2 2274.9.1 1465.5 0zm672.1 2113.6c-26.3 43.2-82.6 56.7-125.6 30.4-344.1-210.3-777.3-257.8-1287.4-141.3-49.2 11.3-98.2-19.5-109.4-68.7-11.3-49.2 19.4-98.2 68.7-109.4C1242.1 1697.1 1721 1752 2107.3 1988c43 26.5 56.7 82.6 30.3 125.6zm179.3-398.9c-33.1 53.8-103.5 70.6-157.2 37.6-393.8-242.1-994.4-312.2-1460.3-170.8-60.4 18.3-124.2-15.8-142.6-76.1-18.2-60.4 15.9-124.1 76.2-142.5 532.2-161.5 1193.9-83.3 1646.2 194.7 53.8 33.1 70.8 103.4 37.7 157.1zm15.4-415.6c-472.4-280.5-1251.6-306.3-1702.6-169.5-72.4 22-149-18.9-170.9-91.3-21.9-72.4 18.9-149 91.4-171 517.7-157.1 1378.2-126.8 1922 196 65.1 38.7 86.5 122.8 47.9 187.8-38.5 65.2-122.8 86.7-187.8 48z" />,
  },
  ps5: {
    vb: '4.3 4.45 41.1 41.1',
    mono: <path d="M5.8 32.1c-1.5 1-1 2.9 2.2 3.8 3.3 1.1 6.9 1.4 10.4.8.2 0 .4-.1.5-.1v-3.4l-3.4 1.1c-1.3.4-2.6.5-3.9.2-1-.3-.8-.9.4-1.4l6.9-2.4V27l-9.6 3.3c-1.2.4-2.4 1-3.5 1.8zm23.2-15v9.7c4.1 2 7.3 0 7.3-5.2 0-5.3-1.9-7.7-7.4-9.6C26 11 23 10.1 20 9.5v28.9l7 2.1V16.2c0-1.1 0-1.9.8-1.6 1.1.3 1.2 1.4 1.2 2.5zm13 12.7c-2.9-1-6-1.4-9-1.1-1.6.1-3.1.5-4.5 1l-.3.1v3.9l6.5-2.4c1.3-.4 2.6-.5 3.9-.2 1 .3.8.9-.4 1.4l-10 3.7V40L42 34.9c1-.4 1.9-.9 2.7-1.7.7-1 .4-2.4-2.7-3.4z" />,
  },
  prime: {
    vb: '568.97 432.84 3630.73 3630.73',
    mono: <path d={PRIME_SMILE} />,
    lit: <path fill="#0779ff" d={PRIME_SMILE} />,
  },
  nuvio: {
    vb: '0 0 24 24',
    mono: <path fill-rule="evenodd" d={NUVIO_OUTER + NUVIO_INNER + NUVIO_PLAY} />,
    lit: <g>
      <defs>
        <linearGradient id="nv-a" gradientUnits="userSpaceOnUse" x1="4" y1="3" x2="20" y2="20"><stop offset="0" stop-color="#4fe3ef" /><stop offset="0.45" stop-color="#2f6fe0" /><stop offset="1" stop-color="#a04bf0" /></linearGradient>
      </defs>
      <path d={NUVIO_OUTER} fill="url(#nv-a)" />
      <path d={NUVIO_INNER} fill="#0b0f1f" />
      <path d={NUVIO_PLAY} fill="#fff" />
    </g>,
  },
  hotstar: { vb: '0 0 24 24', mono: <path d="M15.33 10.65L15.23 11.40L14.94 12.10L14.48 12.71L13.88 13.17L13.18 13.46L12.42 13.56L11.67 13.46L10.97 13.17L10.37 12.71L9.90 12.10L9.61 11.40L9.51 10.65L9.61 9.90L9.90 9.20L10.37 8.59L10.97 8.13L11.67 7.84L12.42 7.74L13.18 7.84L13.88 8.13L14.48 8.59L14.94 9.20L15.23 9.90ZM14.90 10.90L23.00 13.33L14.25 12.33ZM13.31 12.97L10.95 22.02L11.57 12.98ZM10.90 12.61L4.93 15.19L10.15 11.66ZM9.96 10.98L1.00 7.65L10.17 9.61ZM10.50 9.07L7.99 5.61L11.26 8.46ZM12.27 8.17L13.61 1.98L13.47 8.40ZM14.09 8.81L23.00 2.06L14.87 10.25Z" /> },
  nox: { vb: '16 16 224 224', mono: <path d={NOX} />, rest: noxMetal('nox-rest', NOX_IDLE), lit: noxMetal('nox-lit', NOX_SELECTED) },
  inputs: { vb: '0 0 24 24', mono: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 9V6h8v3" /><path d="M10 16v2M14 16v2" /></g> },
  settings: { vb: '0 0 24 24', mono: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g> },
  lghome: { vb: '0 0 24 24', mono: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7" /><path d="M6 10v9h12v-9" /></g> },
  ambient: { vb: '0 0 24 24', mono: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></g> },
};

export const hasRest = (name: string) => !!marks[name]?.rest;

export function Glyph({ name, lit = false, rest = false }: { name: string; lit?: boolean; rest?: boolean }) {
  const m = marks[name];
  return (
    <svg viewBox={m?.vb ?? '0 0 24 24'} width="1em" height="1em" fill="currentColor" aria-hidden="true">
      {m ? (lit && m.lit) || (rest && m.rest) || m.mono : <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
