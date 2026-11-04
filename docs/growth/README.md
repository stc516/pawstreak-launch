# Social growth operating system

This folder is the approval and measurement system for PawStreak, PawStreak
Places, and—after its mobile playtest is ready—Pickle Boo.

The operating rule is simple: publish from evidence. Every claim must point to
a working product screen, a verified place page, an approved photo, or captured
gameplay from the named build. Never invent a customer, review, metric, event,
or launch state.

## Content themes

| Brand | Theme | Useful proof | Primary action |
| --- | --- | --- | --- |
| PawStreak | Better dog days | Current app screen or approved dog photo | Reply with the outing a dog loves |
| PawStreak | Building the product | Tested product behavior or release evidence | Volunteer for controlled beta testing |
| Places | A real place for a real dog day | Verified listing plus approved place photo | Open the guide and plan the outing |
| Places | Know before you go | Current first-party rule source | Save the guide or share a correction |
| Pickle Boo | Build-in-public game progress | Current gameplay capture | Choose a favorite crew member, weapon, or boss |
| Pickle Boo | Chapter moments | Capture from a tested chapter | Follow development; no release claim |

## Voice guardrails

- PawStreak and Places: warm, local, adventurous, useful, and written for
  adults. Small outings count; avoid baby talk and guilt.
- Pickle Boo: playful, punchy, and specific about the game. Do not call a
  browser prototype a released mobile game.
- Say “we are testing” when that is the real state. “Live,” “available,” and
  “launching” require an observed public release and owner approval.
- Ask for corrections on place information. Policies and posted rules can
  change after verification.

## Approval states

Every scheduled item moves through these states:

1. `DRAFT` — copy exists but assets or facts may still be missing.
2. `FACT CHECKED` — every factual claim and destination link was checked.
3. `ASSET APPROVED` — the owner approved the exact image/video and its rights.
4. `OWNER APPROVED` — caption, CTA, destination, date, and channel approved.
5. `SCHEDULED` — entered in Buffer by the connected account owner/operator.
6. `PUBLISHED` — live URL recorded.
7. `REVIEWED` — results added to the weekly review.

No item skips `OWNER APPROVED`.

## Buffer recommendation and connection

Buffer's official pricing page was checked on September 24, 2026. Its Free
plan lists three connected channels, ten scheduled posts per channel, one user,
and 30-day Insights. That is enough to test this calendar without purchasing a
subscription. Team approval workflows are not included in Free, so approval
stays in this repository before scheduling.

Connection steps for the owner:

1. Open <https://buffer.com/pricing> and choose **Free**—do not start a paid
   trial for this test.
2. Sign in to Buffer and connect the exact social accounts that will publish.
   A channel means one account on one platform, not one brand.
3. Enable two-factor authentication on Buffer.
4. Tell the operator which connected account represents PawStreak, Places, and
   Pickle Boo. If Pickle Boo has no approved social account, leave its drafts
   outside Buffer.
5. Approve the calendar rows and exact assets before anything is scheduled.

Do not upgrade for custom UTM fields or approvals yet. Tracking links can be
built before scheduling, and owner approval can remain in the pull request. A
paid plan becomes worth reconsidering only if the ten-post queue or single-user
workflow repeatedly blocks publishing.

## Tracking links

Use lowercase values and retain one content identifier from draft through
review:

```text
utm_source=<instagram|facebook|threads|linkedin>
utm_medium=organic_social
utm_campaign=2026q3_better_dog_days
utm_content=<yyyymmdd>_<brand>_<topic>
```

Example:

```text
https://places.pawstreakapp.com/san-diego/places/fiesta-island?utm_source=instagram&utm_medium=organic_social&utm_campaign=2026q3_better_dog_days&utm_content=20261002_places_fiesta_island
```

Buffer Free does not list custom UTM parameters, so paste the complete tracked
URL into the post. Always test the final URL in a signed-out browser before
scheduling.

## Files

- [Two-week calendar](./calendar-2026-09-28.md)
- [Reusable templates and ready copy](./post-templates.md)
- [Asset checklist](./asset-checklist.md)
- [Weekly review](./weekly-review.md)
