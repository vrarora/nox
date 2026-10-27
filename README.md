# Nox

A quiet home screen for an LG OLED, sideloaded in Developer Mode. No root.

True black. A list of your apps and the PS5 on the left, the focused one lit in its own colour, a preview panel on the right that shows what you were watching in Nuvio. After half a minute it fades to a clock.

## Run it

```bash
npm install
npm run tv          # build, package, install on the TV named "lgtv", launch
```

Other scripts:

| Command | Does |
|---|---|
| `npm run build` | Type-check and bundle to `dist/` |
| `npm run package` | Build and make `build/app.nox.launcher_<version>_all.ipk` |
| `npm run measure -- 3` | Launch three times and print cold-start timings from the TV |
| `node scripts/shot.mjs out.png [js]` | Screenshot the running app, optionally evaluating an expression first |
| `node scripts/config.mjs pull` | Print the settings saved on the TV |
| `node scripts/config.mjs push config.json` | Replace the settings and reload the app |

The TV must be registered with the webOS CLI as `lgtv` (set `TV_DEVICE` to use another name).

## Remote

| Key | Home screen |
|---|---|
| Up / Down | Move through the list |
| Right / Left | Jump to the utility glyphs and back |
| OK | Open the app or switch the input |
| Hold OK | Lift the row to move it; Up/Down move, OK places, Back cancels |
| Back | Nothing on the home screen; returns from Settings |

Any key or pointer move wakes the ambient screen without doing anything else.

## Layout of the code

- `src/catalogue.ts`: every app, input and utility the list can show. Apps are checked against the TV with `getAppLoadStatus`, so an uninstalled one stays hidden.
- `src/lib/luna.ts`: the few public Luna calls an unrooted app is allowed.
- `src/lib/nuvio.ts`: QR device login and continue-watching from Nuvio's backend, artwork from Cinemeta.
- `src/hooks/useFocus.ts`: the focus engine. Index-based, two zones, hold-OK.
- `src/screens/Home.tsx`, `src/components/Preview.tsx`, `src/components/Ambient.tsx`: the three states of the screen.
- `src/lib/config.ts`: settings, one JSON object in `localStorage`.

Design decisions, research and the moodboards are in `docs/`.

## What the TV does not allow

A sideloaded app can launch any app and any HDMI input, read input states, make toasts and read volume and time. It cannot list installed apps, capture the Home button, or turn the screen or TV off. Returning from another app is a warm relaunch, because the TV keeps the launcher resident.
