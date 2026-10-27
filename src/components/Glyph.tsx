import { siNetflix, siYoutube, siSpotify, siPlaystation } from 'simple-icons';

// Monochrome brand marks in currentColor. Netflix, YouTube, Spotify and
// PlayStation come from simple-icons (CC0). Prime Video, JioHotstar and Nuvio
// are drawn here and still approximate.

const marks: Record<string, preact.JSX.Element> = {
  netflix: <path d={siNetflix.path} />,
  youtube: <path d={siYoutube.path} />,
  spotify: <path d={siSpotify.path} />,
  ps5: <path d={siPlaystation.path} />,
  nuvio: <><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2" /><path d="M9.5 8v8l6.5-4z" /></>,
  prime: <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h7M4 10.5h5" /><path d="M14.5 6.5l3.5 4-3.5 4" /><path d="M3 17.5c4.5 3 13.5 3 18 0" /><path d="M19.2 16l1.9 1.5-.6 2.3" /></g>,
  hotstar: <path d="M12 2.2l2.6 6.5 7 .5-5.4 4.5 1.8 6.8L12 16.8l-6 3.7 1.8-6.8L2.4 9.2l7-.5z" />,
  inputs: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 9V6h8v3" /><path d="M10 16v2M14 16v2" /></g>,
  settings: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g>,
  lghome: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7" /><path d="M6 10v9h12v-9" /></g>,
  ambient: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></g>,
};

export function Glyph({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      {marks[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
