# Bailey & Omi — verified Book 1 discovery and conversion audit
**Date:** November 2, 2026 · **Scope:** current \`main\` source plus the open, unmerged franchise PR #53. This is a technical/editorial assessment, not a live-site or Amazon availability certification.

## Current reader journey — what source actually implements

| Stage | Evidence in inspected repository | Honest interpretation / remaining gap |
|---|---|---|
| Discover | \`bailey-and-omi/index.html\` and \`bailey-and-omi/big-climb/index.html\` have human-readable metadata, canonical links, social OG/Twitter images and basic structured data. | Search-friendly page source exists; rankings, Google indexing and live URL response are not verified by source alone. |
| Understand | Book 1 page explains the story, shows approved art and real dogs, states ages 3–7 and offers a dog-friendly activity. | Useful family value is present without forcing PawStreak signup. |
| Purchase | Book 1 source contains direct Amazon \`/dp/B0HMDMQ4Y3\` (Kindle) and \`/dp/B0HMFT1R5P\` (paperback) buttons, and static $3.99/$12.99 labels. | Amazon directly rejected external fetch on November 2. Do not repeat prices or guarantee availability from those source claims. Independently corroborated paperback ISBN-13 \`9798160563947\` via [ThriftBooks](https://www.thriftbooks.com/w/baileys-big-climb_st-carroll/60626430/) and [AbeBooks](https://www.abebooks.it/9798160563947/Bailey%E2%80%99s-Big-Climb-Carroll-S.T/plp); this does **not** prove Amazon stock. |
| Free activity | An in-page \`#try-big-climb\` activity exists now. New \`public/bailey-and-omi/one-small-brave-step.html\` and \`one-small-brave-step.js\` sit in unmerged PR #53. | The standalone printable must not be promoted as a live URL before an owner-authorized merge/deployment and mobile/print QA. |
| Book-news signup | \`src/story-signup.ts\` performs a client-side POST to \`/rest/v1/waitlist_signups\` with \`{email,source:"bailey_omi_book_news"}\`. The pages promise “Book news only. Unsubscribe anytime.” | A successful POST proves only that the endpoint accepted a record. It does not prove confirmation email, double opt-in, subscriber consent history, welcome delivery, segmentation, working unsubscribe, or absence of duplicate accounts. Do **not** send until those are validated. |
| Retail/library outreach | Existing author email and Book 1 page are in source; a printable one-page sell sheet and second-week editorial buffer have been added to PR #53. | Outreach copy/sell sheet are prepared, not sent or distributed. No claimed event, placement, stocking or endorsement. |

## Conversion and SEO priorities — ranked by practical impact

1. **Verify Amazon listings as an actual shopper, including both edition ASINs.** Check title/author, buyability, edition linking, displayed pricing and region. KDP Bookshelf remains authoritative for publishing configuration. Record screenshots/date before publishing pricing in promotions. Direct retailer fetch was blocked on November 2.
2. **Make the already-authored free activity discoverable after approval.** Once PR #53 is authorized and deployed, add a small contextual link near \`#try-big-climb\` (after page QA) and, where appropriate, in the Book 1 news follow-up. Keep the printable no-signup-required.
3. **Prove the email welcome + consent/unsubscribe lifecycle, not just a database write.** Check a consented test opt-in through Supabase and the sending platform, including duplicate behavior and a functional unsubscribe. Do not infer consent from legacy waitlist rows. Keep book-news distinct from the PawStreak app waitlist and do not send unsolicited email.
4. **Make the purchase choice measurable without inventing sales.** Use existing analytics if connected; track impressions/clicks from \`/bailey-and-omi/big-climb\`, outbound Amazon Kindle/paperback click events, landing sources, activity views, signup start/success (never transmit raw email in analytic event properties). UTM-tag social links only when analytics is ready. *An outbound click is not a sale.*
5. **Enhance schema when authoritative publication metadata is confirmed.** Consider adding paperback ISBN to the \`Book\` JSON-LD and linking the verified edition pages with schema-aligned properties; do not assert unverified pricing or invent reviews/aggregateRating. The current \`Book\` JSON-LD already has author, series, target age, genre and image.
6. **Use the second-week social buffer to diversify the creative.** Shift from "meet the dogs" repeated posts toward reading prompts, family activities, humor between sisters, librarians and early future-book conversation. Post only approved imagery with real caption-to-image correspondence.

## Approval-ready source copy (not applied to published pages)

**Suggested optional link near existing Book 1 activity after deployment:**

> Want a quiet activity after storytime? Print **One Small Brave Step**, a free drawing and conversation sheet for ages 3–7. No sign-up required.

**Destination after deployment and verification only:** \`/bailey-and-omi/one-small-brave-step.html\`.

**Suggested optional email welcome, to use only with verified opt-in/unsubscribe mechanism:**

**Subject:** Meet Bailey and Omi — and one small brave step

Welcome to Bailey & Omi book news. Bailey is a curious blue-eyed Husky, and Omi is her golden-tan older rescue sister. Their real-life bond inspired *Bailey’s Big Climb*, the first picture book by S.T. Carroll.

Read about the book, meet the real dogs, and try a gentle family storytime activity here: https://pawstreakapp.com/bailey-and-omi/big-climb

We’ll write when there is real book or series news to share.

S.T. Carroll

**Email compliance gate:** Provide a tested unsubscribe link, genuine sender contact information and all required platform/legal footer details before any send. This copy is not proof of consent or deliverability.

## Lightweight measurement sheet (all values intentionally blank)

| Week ending | Book page visits | Source campaign | Kindle outbound clicks | Paperback outbound clicks | Signup attempts | Accepted signups | Verified subscribed contacts | Confirmed KDP unit sales |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| 2026-11-08 | — | — | — | — | — | — | — | — |
| 2026-11-15 | — | — | — | — | — | — | — | — |
| 2026-11-22 | — | — | — | — | — | — | — | — |

Do not populate the sales column with website analytics, review counts or retailer listing totals. KDP sales data must be obtained from the actual owner-authorized account.

## Franchise continuity

The ranked **10 distinct future-book concepts** are already prepared in \`docs/bailey-omi-books-2-11-story-arcs.md\` (Books 2–11). Book 2 *The Windy-Day Chase* remains concept-only until a genuine safe real-world inspiration/location is confirmed. Preserve approved watercolor-character features and avoid commissioning replacement illustrations or modifying published Book 1 files without authorization.

## Evidence limits
- GitHub source and PR branch were inspected November 2.
- Browser retrieval of the public series/Book 1 pages and Amazon edition pages failed; no fresh production browser screenshot, verified live sales count, email deliverability result or Search Console metrics can be claimed from this audit.
- Neither PR content nor the separate PDF sell sheet is a live website update. No KDP, email or social publishing is authorized by the preparation of these assets.
