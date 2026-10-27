# Nox icon

Production assets for the Nox mark. Every file uses the same geometry and the same 256 × 256 viewBox, and every background is transparent.

## Files

| File | Use it for |
|---|---|
| `svg/nox-icon-master.svg` | Default artwork. The approved metallic treatment. Use it wherever one icon is needed. |
| `svg/nox-icon-idle.svg` | Unfocused state on black. Subdued charcoal-silver. |
| `svg/nox-icon-selected.svg` | Focused or selected state on black. Brighter silver. |
| `svg/nox-icon-mono.svg` | Fallback for flat contexts or renderers without gradient and mask support. Single fill `#D8D9DE`, so it works on dark backgrounds only; change the fill to a near-black on light ones. |
| `png/nox-icon-{48,96,192,256,512}.png` | Raster copies of the master for places that can't take SVG. |
| `png/webos/icon.png` (80) | webOS `appinfo.json` `icon`. `scripts/package.mjs` copies it into the package. |
| `png/webos/largeIcon.png` (130) | webOS `appinfo.json` `largeIcon`. `scripts/package.mjs` copies it into the package. |

## Rules

- Use the metallic files on black or near-black only. On white and mid-grey their light end fades into the background, so use the mono file there with a dark fill.
- Below 32 px, the metallic detail reduces to a plain grey ramp. Keep sizes at 32 px and up when the metal matters.
- Don't edit the path. If the art needs to change, change the gradients only.
- In the launcher, the mark is drawn inline from `src/components/Glyph.tsx`, and those values match these files. If you change either, change both.

## Regenerate the PNGs

```bash
node scripts/export-icon.mjs
```

The script renders `svg/nox-icon-master.svg` with headless Chrome. Set `CHROME=/path/to/chrome` to use a different browser.
