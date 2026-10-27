// Monochrome marks, drawn in currentColor. Phase 1 placeholders; phase 2
// replaces each with a traced brand mark.

const paths: Record<string, preact.JSX.Element> = {
  nuvio:   <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.9" /><path d="M10 8.5v7l5.5-3.5z" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.9" /><path d="M10 9v6l5-3z" /></>,
  netflix: <path d="M6.5 3h3.2l4.3 9.6V3h3.5v18h-3.2L10 11.4V21H6.5z" />,
  prime:   <g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7.5h6M5 11.5h4" /><path d="M14 7.5l3 4-3 4" /><path d="M3.5 17.5c4 2.6 13 2.6 17 0" /><path d="M18.5 16.2l2 1.3-.6 2.3" /></g>,
  hotstar: <path d="M12 2.5l2.4 6.1 6.6.5-5 4.2 1.6 6.4L12 16.2l-5.6 3.5L8 13.3l-5-4.2 6.6-.5z" />,
  spotify: <g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9.2" /><path d="M7.2 9.6c3.2-1 7.2-.8 9.9.8M7.8 12.6c2.6-.8 5.8-.6 8.1.6M8.4 15.4c2-.6 4.4-.5 6.2.4" /></g>,
  ps5:     <g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.4a2.4 2.4 0 0 1-4.2.7L14.5 15h-5l-1.6 2.4a2.4 2.4 0 0 1-4.2-.7l-1-3.4A4.5 4.5 0 0 1 7 7.5z" /><path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01" /></g>,
  inputs:  <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 9V6h8v3" /><path d="M10 16v2M14 16v2" /></g>,
  settings: <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></g>,
  lghome:  <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7" /><path d="M6 10v9h12v-9" /></g>,
};

export function Glyph({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      {paths[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
