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
| `01-adventure-launch-home` | Current Home product preview |
| `02-todays-pick-card` | Current secondary Home recommendation; audit-only while PR #39 is open |
| `03-discover-adventure-mode` | Current Plan / Explore product preview |
| `04-adventure-detail` | Current place detail and adventure CTA |
| `05-adventure-ready` | Current pre-adventure confirmation |
| `06-save-memory-payoff` | Current active-adventure completion payoff |
| `07-journey-memory` | Current saved-memory share view |

## Notes

- The visible `DEMO` label is intentionally retained. These captures are current product previews, not authenticated production-user evidence.
- Story overlays are applied only to exports in `stories/`, not in the live app.
- Copy and posting guidance: see [`content-index.md`](./content-index.md).
- Machine-readable manifest: [`assets.json`](./assets.json) (updated each run).
- The retired dotted Journey map and seeded `47 adventures / 22 places` statistics are excluded from the capture flow and must not be reintroduced.

## Core message

> Your dog's best days shouldn't disappear in your camera roll.
