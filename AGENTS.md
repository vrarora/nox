# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot and others) working in this repository. Humans can read [README.md](README.md) instead; this file has the same facts in runbook form.

## What this is

Nox is a home-screen launcher for LG webOS TVs. It is a Preact + TypeScript web app, bundled by Vite into one classic script, packaged as an `.ipk`, and sideloaded through LG Developer Mode. It needs no root and must keep working without root.

- App id: `app.nox.launcher`. Version: `public/appinfo.json`.
- Reference device: LG OLED65G6PLA, webOS 11.2, Chromium 132, not rooted. Other models are untested.
- The user's TV is a real household device. Someone may be watching it while you work.

## Rules

1. **Never disturb what the user is watching.** Before launching an app, sending keys or reloading, check the page visibility:
   ```bash
   node scripts/shot.mjs /tmp/nox.png 'document.visibilityState'
   ```
   `"hidden"` means another app or input is on screen. Then don't run `node scripts/tv.mjs launch`, `npm run tv` or `ares-launch`, and don't dispatch keys. Install with `npm run package && node scripts/tv.mjs install`, which doesn't launch, and ask the user to open Nox.
2. **Stop and ask the user** for every step marked **HUMAN** below. You can't press buttons on the TV, read its screen or scan QR codes.
3. **Don't change TV system settings** and don't call Luna services that change them. Nox only uses the calls listed under [Platform facts](#platform-facts).
4. **Confirm before uninstalling anything** from the TV. Uninstalling deletes that app's saved data.
5. **Never print or log tokens.** Nuvio tokens are in the TV's localStorage under `nox.nuvio.v1`. Check for them with `!!localStorage.getItem(...)`, never by reading the value.
6. **Every change must pass `npm run build`**, which runs the type check and the bundle, before you install it.

## Runbook: install Nox for a user

Do the steps in order. Each one ends with a check. Don't move on until it passes.

### 1. Check the computer

```bash
node -v        # must print v20 or newer
git --version
```

If Node is older or missing, ask the user to install Node.js 20+ from nodejs.org.

### 2. HUMAN: turn on Developer Mode

Ask the user to:

1. Create a free account at https://webostv.developer.lge.com.
2. On the TV, install **Developer Mode** from the LG Content Store and sign in.
3. Turn **Dev Mode Status** on and let the TV restart.
4. Open Developer Mode again, turn **Key Server** on, and tell you the **IP address** and the **passphrase** it shows.

Check: the user has given you an IP like `192.168.x.x` and a passphrase.

### 3. Get the code and register the TV

```bash
git clone https://github.com/vrarora/nox.git
cd nox
npm install
npx ares-setup-device -a lgtv -i "host=<TV IP>" -i "port=9922" -i "username=prisoner"
npx ares-novacom --device lgtv --getkey
```

`--getkey` prompts for the passphrase. If you can't answer prompts, ask the user to run that one command in their terminal.

Check:

```bash
npx ares-device -i -d lgtv
```

It must print the TV's model and webOS version. If it times out, Key Server is off or the IP is wrong.

### 4. Personalise (ask first)

Ask the user which apps and inputs they want, and which city to use for the weather. Then edit:

- **`src/catalogue.ts`**: one entry per row.
  ```ts
  { key: 'netflix', title: 'Netflix', appId: 'netflix', colour: '#e50914', kind: 'app' }
  ```
  - `kind` is `app`, `input` (HDMI) or `utility` (the small icon column).
  - Inputs use `appId: 'com.webos.app.hdmiN'`, where N is the HDMI port.
  - Every `key` needs a mark in `src/components/Glyph.tsx` (a square `viewBox` plus a `mono` silhouette in `currentColor`, and an optional full-colour `lit`). Without one, the row shows a plain circle.
- **`src/hooks/useWeather.ts`**: set `PLACE` to `{ name, lat, lon, tz }` with an IANA time zone. Weather comes from Open-Meteo and needs no key.
- **`config.example.json`**: the default row order and settings. Its keys are catalogue keys.

Known app ids on recent webOS: `netflix`, `amazon` (Prime Video), `youtube.leanback.v4`, `hotstar` (JioHotstar), `spotify-beehive`, `com.webos.app.hdmi1`–`hdmi4`. Ids differ by region and firmware, so confirm them in step 7.

Check: `npm run build` passes.

### 5. Install

```bash
npm run package && node scripts/tv.mjs install
```

Check: the output ends with `Success`, and `npx ares-install -d lgtv -l` lists `app.nox.launcher`.

### 6. Launch (only if nothing else is playing)

Apply rule 1, then:

```bash
node scripts/tv.mjs launch
```

Check: this prints `"visible"`, and the screenshot shows the list.

```bash
node scripts/shot.mjs /tmp/nox.png 'document.visibilityState'
```

If you can view images, look at `/tmp/nox.png`.

### 7. Check which apps the TV has

```bash
node scripts/shot.mjs /tmp/nox.png 'localStorage.getItem("nox.exists.v1")'
```

This prints `{key: true|false}` for every catalogue entry, and rows marked `false` stay hidden. If the user has an app that shows `false`, its id is wrong. Test candidate ids in the running app:

```bash
node scripts/shot.mjs /tmp/nox.png 'new Promise(r => { const b = new PalmServiceBridge(); b.onservicecallback = m => r(m); b.call("luna://com.webos.applicationManager/getAppLoadStatus", JSON.stringify({ appId: "CANDIDATE.ID" })) })'
```

`"exist":true` means the id is right. Fix `src/catalogue.ts` and go back to step 5.

### 8. Settings (optional)

```bash
node scripts/config.mjs push config.example.json   # or a copy edited for the user
node scripts/config.mjs pull                       # prints what the TV has
```

`push` reloads Nox, so apply rule 1 first.

### 9. HUMAN: finish on the TV

Tell the user to:

- **Pin the Nox tile** first in LG Home's app row. The Home button can't open Nox directly (see below).
- **Optional, Nuvio users:** focus the Nuvio row and scan the QR code with a phone signed in to Nuvio.
- **Keep Developer Mode alive.** The session lasts about 50 hours. Press **Extend** in the Developer Mode app before it runs out, or the TV deletes every sideloaded app, Nox included.

## Developing

```bash
npm run dev      # Vite on the computer; every app counts as installed off the TV
npm run build    # tsc --noEmit + vite build → dist/
npm run tv       # build + package + install + launch (rule 1 applies)
```

### Code map

```
public/appinfo.json        webOS metadata: id, version, icon file names, splash
index.html                 first-paint CSS, Inter preload, window.__nox boot timing
src/app.tsx                state: config, screen (home | settings), move mode, installed map, inputs, idle, Nuvio
src/catalogue.ts           static list of apps, inputs and utilities
src/lib/luna.ts            PalmServiceBridge wrapper: launch, appExists, inputStatus, toast
src/lib/config.ts          settings object in localStorage nox.config.v1
src/lib/nuvio.ts           Nuvio QR device login and continue-watching (optional)
src/hooks/useFocus.ts      focus engine: index-based, two zones, OK fires on key-up, hold 600 ms
src/hooks/useIdle.ts       ambient timer; the first key after idle only wakes
src/screens/Home.tsx       list, preview, utility column, ambient
src/screens/Settings.tsx   Nox's own settings screen
src/components/Glyph.tsx   app logos; the Nox mark and its metallic finish (noxMetal)
src/styles/*.css           tokens, home, settings
scripts/                   package, tv, shot, measure, config, export-icon, nuvio/ (optional Nuvio patch)
brand/nox-icon/            icon set and its README
docs/                      original brief, plan, platform research, design references
```

localStorage keys: `nox.config.v1`, `nox.exists.v1`, `nox.timeFormat`, `nox.weather.v1`, `nox.nuvio.v1`, `nox.nuvio.cw.v1`, `nox.nuvio.meta.v1`. A test override, `nox.idleMs`, sets the ambient delay in ms and survives reinstalls, so remove it after testing.

### Conventions

- Preact + Vite + plain CSS. One IIFE bundle (module scripts fail from `file://` on the TV). No router, no state library.
- True black background, one colour at a time: only the focused app wears its brand colour. No backdrop blur; the TV's GPU can't afford it.
- Animate only `transform`, `opacity` and colour, using `--focus-ms` and `--ease-out` from `src/styles/tokens.css`.
- Near-black gradients band visibly on OLED, so large soft gradients need a noise dither (see the glare in `src/styles/home.css`).
- Code comments are short, present-tense and functional.

### Icon and splash

- Source of truth: `brand/nox-icon/svg/nox-icon-master.svg`. Never edit the path; change gradients only.
- After an art change, run `node scripts/export-icon.mjs`. It writes the PNGs, the webOS icons and the splash.
- **LG Home caches tile icons by file name.** When the icon changes, rename the files in `public/appinfo.json` (`icon`, `largeIcon`). `scripts/package.mjs` reads the names from there.

## Platform facts

Measured on webOS 11.2 with an unrooted, sideloaded app:

- **Allowed:** `applicationManager/launch`, `applicationManager/getAppLoadStatus`, `eim/getAllInputStatus`, `connectionmanager/getStatus`, `audio/getVolume`, `systemservice/time/getSystemTime`, `tv.systemproperty/getSystemInfo`, `systemservice/getPreferences`, `notification/createToast`.
- **Denied:** `listLaunchPoints`, `listApps`, `running`, `getForegroundAppInfo`, `tvpower/*`, `settingsservice/getSystemSettings`. So Nox can't list installed apps or turn the screen off.
- The Home button (key 773) never reaches a web app. Back from another app lands on LG Home.
- The TV keeps Nox resident, so returning from an app is a warm `webOSRelaunch`.
- Remote key codes: Left 37, Up 38, Right 39, Down 40, OK 13, Back 461. To drive the UI from DevTools, dispatch both events: `keydown` then `keyup` with `keyCode`, because OK acts on key-up.
- A PS5 in rest mode and one that's fully off look identical over HDMI-CEC, so the row says "Off" for both.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `ares-*` commands time out | The TV is asleep, Key Server is off, or the IP changed. Ask the user to open Developer Mode, then check with `npx ares-device -i -d lgtv`. |
| `shot.mjs` hangs | It attached to another resident app. It picks the page whose URL contains the app id; set `APP_ID` if you renamed the app. |
| A blank tile in LG Home | The icon is cached by file name. Rename the icon files in `appinfo.json`, then repackage and reinstall. |
| An app's row is missing | Its id is wrong (step 7) or the app isn't installed. |
| All sideloaded apps vanished | Developer Mode expired. HUMAN: turn it on again, then reinstall (step 5). |
