# Build plan

Direction G · Ledger. Unrooted LG G6, webOS 11.2, Chromium 132. See BRIEF.md for decisions and LAUNCHER-RESEARCH.md for the constraints behind them.

## Stack

| Layer | Choice | Why |
|---|---|---|
| UI | Preact 10 + TypeScript, no router, no state library | Tiny, fast cold start; what Hearth and Lumen proved on LG |
| Build | Vite 5 → one IIFE `app.js`, classic `<script defer>`, `base: './'` | Module scripts fail from `file://` on webOS |
| Styles | Plain CSS, custom-property tokens, one file per screen | Chromium 132 allows modern CSS; no runtime cost |
| Fonts | Inter variable, latin subset, self-hosted woff2 (~48 KB) | Offline, instant |
| Glyphs | Inline SVG, traced from brand press kits, monochrome | No image files to load |
| Persistence | `localStorage` config + boot cache; one `config.json` pushable from the Mac | Cold start paints from cache before any Luna call |
| TV calls | `PalmServiceBridge` wrapper with timeouts | Only the public calls the probe confirmed |
| Package | `ares-package` → `.ipk`, `ares-install -d lgtv` | Existing CLI setup works |
| Measure | CDP harness: cold-start ms, key-to-paint ms, frame times | Numbers decide, not opinions |

## Architecture

- `apps/` **catalogue**: id, title, glyph, brand colour, launch params. Each checked with `getAppLoadStatus` on boot; missing apps stay hidden (Spotify until installed).
- `inputs/`: `eim/getAllInputStatus` → HDMI tiles with labels, plug state, CEC device name and `cecPower`. PS5 tile = HDMI 2 + CEC wake attempt.
- `focus/`: one index-based focus engine for the list, the preview panel and settings. D-pad moves, OK on key-up with 600 ms hold = context menu, Back = up one level. Pointer hover selects, click activates, `realPointer` guard against synthetic mouseover.
- `providers/`: shelf providers behind one interface (`load() → items[]`). First provider: Nuvio continue-watching (own QR login, `sync_pull_watch_progress`, Cinemeta posters). Second: curated JSON.
- `widgets/`: small glass cards with the same interface for the ambient state (clock, weather first).
- `ambient/`: idle timer → list fades, wallpaper fades in, clock/weather stay, pixel shift every 60 s.
- `sound/`: two short samples, muted by setting.

## Phases

1. **Skeleton on the TV.** Scaffold, build, install, launch from LG's row. Black screen with the list, static catalogue, launch works for every app and HDMI 2. CDP harness reports cold start. Target: list visible under 400 ms after `navigationStart`.
2. **The look.** Inter, real glyphs, dimming list, the preview panel with glare recolouring on focus, clock and weather (Open-Meteo, Mumbai), utility glyphs, pointer support. Measure frame times on focus moves.
3. **PS5 and inputs.** Live state from EIM, CEC wake attempt, input labels, Inputs utility screen.
4. **Ambient.** Idle fade, bundled wallpapers (chosen with you), pixel shift, wake on any key.
5. **Nuvio shelf.** QR login screen, continue-watching in the preview panel with real posters, deep-link into Nuvio home.
6. **Settings and config.** Hold-OK reorder/hide, settings screen, `config.json` push script, sounds and mute.
7. **Polish passes.** Burn-in review, motion timing on device, failure toasts, cold-start trim.

Each phase ends installed on the TV and measured, not just built.

## Open

- Name. Candidates: Sill, Foyer, Halo, Dusk, Aperture.
- SSAP retry once LG Link / LG Connect Apps is on (would add the real app list and icons).
- Brand glyph sources for Netflix, Prime Video, JioHotstar, Spotify, PlayStation, Nuvio, YouTube.
