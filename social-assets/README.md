# PawStreak social assets

Repeatable Playwright capture for Instagram, TikTok, and Stories.

## Prerequisites

1. Start the local app (dev server — **not** preview for `/demo/app` routes):

```bash
npm run dev
```

2. Playwright Chromium (already in devDependencies):

```bash
npx playwright install chromium
```

First run only if Chromium is missing.

## Commands

```bash
# Screenshots + story-safe PNGs + demo video
npm run social:capture

# Screenshots and story PNGs only
npm run social:capture:screens

# Demo flow video only
npm run social:capture:video
```

### Environment

| Variable | Default | Purpose |
|---|---|---|
| `SOCIAL_BASE_URL` | `http://127.0.0.1:5173` | App base URL |
| `SOCIAL_COMMIT` | git HEAD | Written to `assets.json` |

Example against deployed demo:

```bash
SOCIAL_BASE_URL=https://pawstreak-launch.vercel.app npm run social:capture
```

## Output folders

| Folder | Contents |
|---|---|
| `screenshots/` | Clean 390×844 viewport PNGs |
| `stories/` | Same frames + subtle top/bottom gradient overlay for Story/TikTok text safe zones |
| `videos/` | `pawstreak-demo-flow.webm` screen recording |

## What gets captured

| File | Route / flow |
|---|---|
| `01-today-home` | `/demo/app` → Home |
| `02-plan-adventure` | Plan tab |
| `03-journey-memory` | Journey → memory detail overlay |
| `04-map-path` | Journey → Map view → Torrey Pines pin |
| `05-profile` | Home → Bailey + Omi pill → Profile |
| `06-early-access` | `/` cleared → onboarding welcome |

## Notes

- Demo labels, feedback pill, and toasts are hidden **during capture only** via injected CSS — production UI is unchanged.
- Story overlays are applied only to exports in `stories/`, not in the live app.
- Copy and posting guidance: see [`content-index.md`](./content-index.md).
- Machine-readable manifest: [`assets.json`](./assets.json) (updated each run).

## Core message

> Your dog's best days shouldn't disappear in your camera roll.
