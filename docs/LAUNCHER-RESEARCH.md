# Launcher research digest (2026-10-27)

What four open-source LG launchers teach us, filtered for an **unrooted webOS 11.2 (Chromium 132)** TV.

## The TV as a runtime

| Fact | Value | Source |
|---|---|---|
| Viewport for a sideloaded web app | 1920×1080, devicePixelRatio 1 | DevTools on youtube.leanback.v4 |
| SoC | 4× Cortex-A76, 2 GB RAM (~440 MB free), Mali-G510, WebGL 2 | /proc, DevTools |
| Browser | Chromium 132 (webOS 11) | GlassHouse tv-specs |
| `backdrop-filter` | Supported | DevTools |
| HDMI 2 | Labelled "PS5 Game Console", CEC name "PlayStation 5", `cecPower` reported | `eim/getAllInputStatus` over SSH |

## What a sideloaded (Developer Mode) app can do without root

Works, confirmed by Hearth and Lumen on real TVs:

- Launch any app: `luna://com.webos.applicationManager/launch {id, params}`.
- Switch HDMI input the same way. Inputs are apps: `com.webos.app.hdmi1`…`hdmi4`, `com.webos.app.livetv`.
- Check an app exists: `applicationManager/getAppLoadStatus {appId}` → `exist`.
- List inputs with labels, plug state and CEC devices: `com.webos.service.eim/getAllInputStatus`.
- Read time format: `systemservice/getPreferences`. Network: `connectionmanager/getStatus`. Volume: `com.webos.audio/getVolume|setVolume|setMuted`.
- Hide the Magic Remote pointer: `webOSSystem.setCursorHidden(true)`.
- Receive keys: arrows 37–40, OK 13, Back 461 (needs `"disableBackHistoryAPI": true` in appinfo.json), colour keys, digits. Pointer state via keys 1536/1537 and `cursorStateChange`.
- `webOSRelaunch` event when launched again while alive.

Denied to a sideloaded app (confirmed over SSH as `prisoner`, and by the repos):

- `listApps` / `listLaunchPoints` / `getForegroundAppInfo` / `settingsservice/getSystemSettings`. So **no installed-app list and no system icons**.
- Everything privileged: Home-key capture, power, screen off, picture settings, privacy toggles, screensaver, notifications.

Two workarounds for the app list:

1. **Catalogue** (Hearth, Lumen): a hardcoded list of ids + bundled icons, each checked with `getAppLoadStatus`. Reliable, needs us to supply artwork.
2. **SSAP from inside the app** (Hearth, experimental): WebSocket to `ws://127.0.0.1:3000`, `pairingType: PROMPT`, permissions `LAUNCH, READ_INSTALLED_APPS, READ_RUNNING_APPS`. One-time OK prompt on the TV, then `listLaunchPoints` with icon paths loadable as `file://`. Needs "LG Connect Apps" on. Untested on webOS 11. May also expose screen-off and toasts. **Worth a spike.**

## Hard constraints to design around

- **The Home button cannot open our launcher.** A web app never receives key 773. Only LG Home gets it. Unrooted entry points: LG's app row, LG "Quick Access" (hold a digit key, assignable to an app, to verify for sideloaded apps), SSAP from a phone/Mac, and possibly registering as the `home` category default (`appCategory:["home"]` + `setDefaultApp`, untested on webOS 11).
- **Back out of an app lands on LG Home**, not on us.
- **webOS's memory manager usually kills the launcher when another app opens.** Every return is a cold start. Lumen measured 3–7 s cold vs 0.5–1.4 s warm on a weaker TV. Cold-start speed is the whole snappiness story: tiny single-file bundle, inline first-paint CSS, localStorage boot cache, wallpaper painted by an inline script before JS runs.
- **OLED burn-in**: Hearth does an 8-step pixel shift every 60 s and fades the UI after idle; GlassHouse drifts the wallpaper over 180 s.

## Glass on a Mali GPU (Lumen's measurements, webOS 25)

- Each live `backdrop-filter` adds ~2 ms GPU per frame while anything changes; any backdrop blur roughly halves fps when something moves over it. 21 live blurs in a panel → 16–20 fps.
- Only transform and opacity may animate. Animating box-shadow/background stuttered scrolling (Hearth).
- Full-screen frosted backdrop = a 480×270 pre-blurred canvas copy of the wallpaper scaled up by the GPU, not a live blur. Took a transition from 7–10 fps to 37–42 fps.
- Live blur only on the one focused control. Dock "glass" = tint + gradient sheen + inset rim highlights, no blur by default.
- Liquid-glass refraction (`feDisplacementMap` in `backdrop-filter: url()`) works but is dock-only; on panels it fell to 7 fps.
- `will-change: transform` on rows and first-row tiles; never write CSS variables on a large glass surface per move (0.7 MP repaint).
- Our TV is a 2026 SoC and renders at DPR 1, so budgets should be looser than Lumen's, but the shape of the rules holds. Measure on device.

## Craft details worth taking

- Tiles 5:3 landscape, radius 34; focus = `perspective(900px) rotateX/Y scale(1.14) translateY(-7.5px)`, 160 ms; shadow `0 26px 40px rgba(0,0,0,.42)`; glare `::after` gradient; "lit from above" `::before` rim. (Lumen)
- Pointer parallax tilt ±5°/±6°, one write per rAF. (Lumen)
- Resting state: nothing focused on launch; first key only reveals focus. (Lumen)
- OK on key-up with 600 ms hold = long press (move/hide menu). (Hearth, Lumen)
- Motion tokens: focus 160, scroll 260 `cubic-bezier(.2,.7,.2,1)`, fade 220, slide 320; staggered 150–350 ms delays. (Lumen)
- Pointer hover selects without scrolling; `realPointer` guard against synthetic mouseover when rows slide under a still pointer. (Lumen, Lightkeeper)
- Wallpaper cross-fade 1400 ms with pre-decode at opacity 0.01 before fade-in. (Hearth)
- HDMI tiles get a device logo from the EIM label (PS5, Xbox, Switch…). (Lightkeeper)
- Warm near-black `rgb(18,13,8)` instead of pure black; text-shadow on everything over photos. (Lightkeeper)
- Clock digits only via subsetted fonts, 2–4 KB. (Lightkeeper)
- Toasts that give an actionable reason on failure. (Hearth)

## Stack the others use

Preact 10 + Vite 5 + TypeScript, one IIFE bundle (module scripts fail from `file://`), plain CSS with custom-property tokens, localStorage for everything, `ares-package` → `.ipk`. No router, no state library. Chromium 132 frees us from their ES5/Chrome-79 constraints (nesting, `gap`, `inset`, `aspect-ratio`, container queries all fine).

## Known app ids

`netflix`, `amazon` (Prime Video), `youtube.leanback.v4`, `com.apple.appletv`, `com.disney.disneyplus-prod`, `cdp-30` (Plex), `spotify-beehive`, `com.webos.app.browser` (with `params.target`), `com.palm.app.settings` / `com.webos.app.settings`, `com.webos.app.home`, `com.webos.app.quickinputpicker`. **JioHotstar's id is unknown**; probe with `getAppLoadStatus`.

## Nuvio integration (NuvioTVSmart 1.2.9 source, read 2026-10-27)

- **Continue-watching and library are readable.** Nuvio syncs to a Supabase backend at `https://api.nuvio.tv` (fallback `https://api-two.nuvioapp.space`). Public anon key is in the release's `nuvio.env.js`. Calls are PostgREST RPCs with `apikey: <anon>` + `Authorization: Bearer <user JWT>`.
  - `POST /rest/v1/rpc/sync_pull_watch_progress {p_profile_id}` → rows `content_id (tt…), content_type, season, episode, position, duration (ms), last_watched, progress_key`.
  - `POST /rest/v1/rpc/sync_pull_library {p_profile_id, p_limit, p_offset}` → `content_id, name, poster, background, description, release_info, imdb_rating, genres`.
  - Add-on list: `GET /rest/v1/addons?user_id=eq.<uuid>&profile_id=eq.<n>` after `rpc/get_sync_owner`.
- **The launcher does its own QR login** (don't reuse Nuvio's refresh token, Supabase rotates it): anonymous signup → `rpc/start_device_login_session` → show `verificationUriComplete` as a QR → poll `rpc/poll_tv_login_session` → `POST /functions/v1/tv-logins-exchange` → own token pair.
- **Artwork:** "continue watching" is built client-side from progress rows enriched via Stremio meta: `https://v3-cinemeta.strem.io/meta/{movie|series}/{tt}.json` → `poster`, `background` (metahub URLs). TMDB images at `https://image.tmdb.org/t/p/w780/...` with the key in `nuvio.env.js`.
- **No deep links in 1.2.9.** `webOSSystem.launchParams` is never read; relaunch always lands on Home. Launching `space.nuvio.webos` opens the app's Home. A ~15-line upstream patch to `recover()` in `js/app.js` (route to `detail {itemId, itemType}`) would add it; worth a PR to NuvioMedia later.
- localStorage is per-origin, no DB8, no shared files. Nothing readable from another app on the TV.
- Nuvio's own bundle is 3.4 MB and stays resident when backgrounded; relaunch is a fast `webOSRelaunch`.
