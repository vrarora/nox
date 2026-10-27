import { siNetflix, siYoutube, siSpotify, siPlaystation } from 'simple-icons';

// Monochrome brand marks in currentColor. Netflix, YouTube, Spotify and
// PlayStation come from simple-icons (CC0). Prime Video is the smile from the
// 2024 wordmark (public domain), JioHotstar is traced from the 2025 logo,
// Nuvio is drawn from the app's own mark.

const marks: Record<string, preact.JSX.Element> = {
  netflix: <path d={siNetflix.path} />,
  youtube: <path d={siYoutube.path} />,
  spotify: <path d={siSpotify.path} />,
  ps5: <path d={siPlaystation.path} />,
  nuvio: <path fill-rule="evenodd" d="M8.2 2.6c-1.9-1.1-4.3.3-4.3 2.5v13.8c0 2.2 2.4 3.6 4.3 2.5l12-6.9c1.9-1.1 1.9-3.9 0-5zM9.9 8.1c-.8-.5-1.9.1-1.9 1.1v5.6c0 1 1.1 1.6 1.9 1.1l4.9-2.8c.8-.5.8-1.7 0-2.2zM10.9 10.1v3.8l3.3-1.9z" />,
  prime: <path stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" transform="translate(1 9.2) scale(0.478) translate(-20 -13)" d="M39.08 26.46a29.04 29.04 0 0 1-11.33-3 19.2 19.2 0 0 1-5.44-3.86c-1.26-1.27-1.89-2.1-2.01-2.68-.1-.46.08-.75.5-.75.27 0 .71.26 1.47.85 3.32 2.58 7.94 4.45 13.08 5.28a41.02 41.02 0 0 0 19.1-1.46c1.1-.37 1.8-.66 2.93-1.21.74-.37.97-.46 1.21-.47.29-.03.3-.02.46.15.23.25.22.58-.03.96-.23.35-.64.76-1.25 1.25-3.13 2.52-8.22 4.33-13.68 4.86-.98.1-4.15.14-5.01.08zm20.48-2.98c-.32-.27-.26-.57.25-1.42a11.28 11.28 0 0 0 1.4-3.31c.11-.7-.07-.93-.84-1.07-.72-.12-2.41-.03-3.48.19-.2.04-.55.07-.78.07-.4 0-.45 0-.55-.12a.7.7 0 0 1-.15-.33c-.02-.18 0-.23.15-.4a7.1 7.1 0 0 1 4.59-1.6c1.57 0 2.84.38 3.26.98.15.22.16.24.18.97.01.54 0 .87-.07 1.21a7.9 7.9 0 0 1-1.45 3.24 8.82 8.82 0 0 1-1.74 1.59c-.4.2-.55.2-.77 0z" />,
  hotstar: <path d="M15.33 10.65L15.23 11.40L14.94 12.10L14.48 12.71L13.88 13.17L13.18 13.46L12.42 13.56L11.67 13.46L10.97 13.17L10.37 12.71L9.90 12.10L9.61 11.40L9.51 10.65L9.61 9.90L9.90 9.20L10.37 8.59L10.97 8.13L11.67 7.84L12.42 7.74L13.18 7.84L13.88 8.13L14.48 8.59L14.94 9.20L15.23 9.90ZM14.90 10.90L23.00 13.33L14.25 12.33ZM13.31 12.97L10.95 22.02L11.57 12.98ZM10.90 12.61L4.93 15.19L10.15 11.66ZM9.96 10.98L1.00 7.65L10.17 9.61ZM10.50 9.07L7.99 5.61L11.26 8.46ZM12.27 8.17L13.61 1.98L13.47 8.40ZM14.09 8.81L23.00 2.06L14.87 10.25Z" />,
  sill: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="#000" /><circle cx="15" cy="12" r="2" fill="#000" /><circle cx="8" cy="17" r="2" fill="#000" /></g>,
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
