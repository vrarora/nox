# Launcher brief (decided 2026-10-27)

A home-screen launcher for an unrooted LG OLED65G6 (webOS 11.2, Chromium 132), sideloaded in Developer Mode. Working name TBD.

## Non-negotiables

- Craft first. Every surface, motion and type choice must survive a side-by-side with tvOS.
- Snappy. Cold start to usable dock under 400 ms on the TV; focus moves at 60 fps; nothing blocks first paint.
- Unrooted. No Homebrew Channel, no root shell. Only public Luna calls and SSAP.
- Scalable. Dock items, shelf providers and widgets are data-driven plugins, not hardcoded screens.

## Decisions

| Area | Decision |
|---|---|
| Entry point | Pinned first in LG's app row. Home → OK. LG Home flashes briefly; accepted. |
| Home model | Hybrid. Glass dock of apps and inputs at the bottom, one hero shelf above it. |
| Dock, day one | NuvioTV, YouTube Ad-Free, Netflix, Prime Video, JioHotstar, Spotify, PS5 (HDMI 2). Then quiet utility tiles: Inputs, LG Settings, LG Home. |
| PS5 tile | Switches to HDMI 2, sends CEC wake, shows live state (on / rest / no signal). Degrades to switch + state if wake is impossible unrooted. |
| Hero shelf | Nuvio continue-watching if its API allows; otherwise a curated shelf with TMDB artwork and deep links. |
| Idle | Ambient after ~30 s: dock fades, wallpaper drifts, clock + date + weather remain, OLED pixel shift. Any key restores the dock. |
| Wallpaper | Curated still photography bundled with the app, pre-sized, offline. Picked in the moodboard round. |
| Input | D-pad and Magic Remote pointer both first-class. |
| Visual direction | **G · Ledger** (chosen 2026-10-27). True black. Left: vertical list of glyph + wordmark (Inter, ~62 px), focused row white and bold, others dimming downward. Only the focused app wears its brand colour: its glyph in colour, and a soft colour glare pooling behind a dark glass preview panel on the right that shows the app's icon large plus the "Continue" line (real artwork when the shelf has it). Small clock + weather top-right, three utility glyphs bottom-right. Lineage: Nathan Clark's launcher (X, see DESIGN-REFERENCES.md). |
| Motion | Restrained. Focus moves are opacity/weight/colour changes and the glare recolouring, ~180 ms ease-out; the preview panel cross-fades. No scale on list rows. |
| Sound | Subtle focus ticks and a select tone, with a mute setting. |
| Settings | On the TV (hold OK on a tile for move/hide; a settings screen) plus one JSON config file pushable from the Mac. |
| Growth | Widgets (weather, calendar, smart home, now-playing, PS5 status) as small glass cards. |
| Users | One person. Power-user settings are fine. |
| Name | Five proposals come with the moodboards. |

## Open spikes (technical, mine to verify on the TV)

1. SSAP from inside the app (`ws://127.0.0.1:3000`, PROMPT pairing): gives an installed-app list with icons, running apps, and possibly screen-off and toasts. Untested on webOS 11.
2. JioHotstar's app id, via `getAppLoadStatus` probes.
3. CEC wake of the PS5 from a launch of `com.webos.app.hdmi2` with `params:{id:'uniqueId', value:'4'}` (GlassHouse's route, tested as root only).
4. Real cold-start time of a minimal app on this TV, and whether the memory manager keeps it alive across app switches.
5. Nuvio continue-watching API and deep links (agent researching).
6. Weather city: Mumbai (Asia/Kolkata, the TV's timezone).

## Probe results (2026-10-27, dev.probe.launcher on the TV)

- Chromium 132.0.6834, 1920×1080, DPR 1. `webOSSystem`, `PalmSystem`, `PalmServiceBridge` all present.
- Allowed: `applicationManager/launch`, `getAppLoadStatus`, `eim/getAllInputStatus`, `connectionmanager/getStatus`, `audio/getVolume`, `systemservice/time/getSystemTime`, `tv.systemproperty/getSystemInfo`, `systemservice/getPreferences`, `notification/createToast`.
- Denied: `listLaunchPoints`, `listApps`, `running`, `getForegroundAppInfo`, `tvpower/power/getPowerState`, `settingsservice/getSystemSettings`.
- Installed: `netflix`, `amazon`, `hotstar` (JioHotstar), `youtube.leanback.v4`, `space.nuvio.webos`, `com.webos.app.hdmi1-4`, `com.webos.app.livetv`, `com.webos.app.browser`, `com.palm.app.settings`, `com.webos.app.home`, `com.webos.app.quickinputpicker`, `com.webos.app.screensaver`. Not installed: Spotify (user will install; id to confirm), Apple TV, Disney+, Plex.
- SSAP: port 3000 closes at once, port 3001 (wss) opens but never answers the register; no prompt on the TV. "LG Connect Apps" is presumably off. Optional; retry after the user toggles it.
