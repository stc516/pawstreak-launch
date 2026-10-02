# Social asset checklist

## Rights and truth

- [ ] Owner approved the exact asset for publication.
- [ ] Source, creator, and usage permission are recorded.
- [ ] A place photo shows the named place; no generic beach or park is implied
      to be a specific listing.
- [ ] App captures come from the current production or named preview build.
- [ ] Gameplay captures come from the named Pickle Boo commit or PR.
- [ ] No private profile, email, dog, location history, notification token, or
      other user data is visible.
- [ ] No fake likes, scores, reviews, player counts, or testimonials appear.
- [ ] Any time-sensitive hours, rules, event dates, or business policy were
      rechecked on the day the post was approved.

## Capture set

PawStreak:

- Current onboarding/product-loop screen.
- Explore screen with location permission state understood.
- Adventure completion and memory screen using approved test data.
- Owner-approved Bailey/Meiomi photos, if available, with date and permission.

Places:

- One real photo each for Dog Beach Ocean Beach, Fiesta Island, and Nate's
  Point.
- Listing-page screenshots after the `/san-diego` route fix is deployed.
- Optional short route carousel: place, rule reminder, nearby pairing.

Pickle Boo:

- School Lunch gameplay without QA/debug overlays.
- Chapter transition and Cornichon Quick recruitment.
- Corner Deli chop station and Big Cheese encounter.
- Physical-device footage after installation; until then label captures as
  prototype gameplay.
- Approved app icon and splash artwork are still required; generated Capacitor
  placeholders are not social assets.

## Delivery formats

- Feed portrait: 1080×1350.
- Square fallback: 1080×1080.
- Story/Reel: 1080×1920 with controls and captions inside safe margins.
- Video: H.264 MP4, captions burned in or supplied, with a readable first
  frame.
- Provide plain-language alt text describing what is visible, not marketing
  copy.

## File naming

```text
<yyyymmdd>_<brand>_<topic>_<format>_v<revision>.<ext>
```

Example: `20261002_places_fiesta_island_feed_v1.jpg`.
