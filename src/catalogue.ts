// Everything the list can show. A sideloaded app can't list installed apps,
// so the catalogue is static and each entry is checked with getAppLoadStatus.

export interface Entry {
  key: string;
  title: string;
  appId: string;
  colour: string;
  kind: 'app' | 'input' | 'utility';
  params?: Record<string, unknown>;
}

export const CATALOGUE: Entry[] = [
  { key: 'nuvio',   title: 'Nuvio',         appId: 'space.nuvio.webos',  colour: '#7b5cff', kind: 'app' },
  { key: 'youtube', title: 'YouTube',       appId: 'youtube.leanback.v4', colour: '#ff2d2d', kind: 'app' },
  { key: 'netflix', title: 'Netflix',       appId: 'netflix',             colour: '#e50914', kind: 'app' },
  { key: 'prime',   title: 'Prime Video',   appId: 'amazon',              colour: '#00a8e1', kind: 'app' },
  { key: 'hotstar', title: 'JioHotstar',    appId: 'hotstar',             colour: '#1f80e0', kind: 'app' },
  { key: 'spotify', title: 'Spotify',       appId: 'spotify-beehive',     colour: '#1db954', kind: 'app' },
  { key: 'ps5',     title: 'PlayStation 5', appId: 'com.webos.app.hdmi2', colour: '#2f6cff', kind: 'input' },
  { key: 'inputs',  title: 'Inputs',   appId: 'com.webos.app.quickinputpicker', colour: '#9a9a9a', kind: 'utility' },
  { key: 'settings', title: 'Settings', appId: 'com.palm.app.settings',         colour: '#9a9a9a', kind: 'utility' },
  { key: 'lghome',  title: 'LG Home',  appId: 'com.webos.app.home',            colour: '#9a9a9a', kind: 'utility' },
];
