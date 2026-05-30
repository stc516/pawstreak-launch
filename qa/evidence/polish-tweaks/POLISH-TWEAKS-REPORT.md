# Polish Tweaks QA Report

**Status:** Ready for review — **not committed**  
**Build:** `npm run build` ✅  
**QA:** iPhone 13 / 15 Pro / Pro Max — all screens GREEN

## Screenshots (iPhone 13)

| Screen | File |
|--------|------|
| Home | `01-home.png` |
| Plan | `02-plan.png` |
| Journey | `03-journey.png` |
| Challenges | `04-challenges.png` |
| Profile | `05-profile.png` |
| Settings | `06-settings.png` |

15 Pro / Pro Max: `iphone-15-pro-*.png`, `iphone-15-pro-max-*.png`

## Layout metrics (iPhone 13)

| Screen | Viewport H | Scroll H | Nav top → bottom | Gap |
|--------|------------|----------|------------------|-----|
| Home | 664px | 1,216px | 618 → 664px | 0px |
| Plan | 664px | 2,300px | 618 → 664px | 0px |
| Journey | 664px | 2,843px | 618 → 664px | 0px |
| Challenges | 664px | 1,542px | 618 → 664px | 0px |
| Profile | 664px | 1,084px | 618 → 664px | 0px |
| Settings | 664px | 834px | 618 → 664px | 0px |

Shell layout guard: all screens pass (nav pinned, no gap below nav).

## What changed

1. **Home headline** — 7 lines rotate by day-of-week (`date.getDay()`); Thursday shows personalized roam line.
2. **Plan map** — Lat/lng pin placement, stylized coastline/terrain, pulse/bob animation, selected pin + tooltip, scroll-to-card sync.
3. **Training** — Section labels: Home “Training Programs”, Plan “Training Opportunities”, Challenges “Training Programs”; Home spotlight card added.
4. **Settings** — Gear icon on Profile → full Settings screen (Account, Notifications coming soon, ZIP, Dog profiles, Privacy/Terms coming soon, Sign out in production).

**Untouched:** shell, layout contract, bottom nav, safe-area rules.
