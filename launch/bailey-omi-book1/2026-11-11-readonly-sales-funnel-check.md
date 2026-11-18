# Bailey's Big Climb — November 11 read-only conversion and audience check
**S.T. Carroll · Status: verified source/database facts + approval-gated actions only.** Nothing published, merged, mailed, sold, submitted, deployed, or changed in a subscriber database.

## What was actually inspected today
- **Current GitHub `main` source:** `bailey-and-omi/index.html` and `bailey-and-omi/big-climb/index.html` include descriptive metadata, canonical story URLs, book-news form, Book 1 details, and **two real Amazon destination IDs**. Source code presence is not equivalent to a live buyer checkout.
  - Paperback link in source: https://www.amazon.com/dp/B0HMFT1R5P
  - Kindle link in source: https://www.amazon.com/dp/B0HMDMQ4Y3
  - Book information page: https://pawstreakapp.com/bailey-and-omi/big-climb
  - Series page: https://pawstreakapp.com/bailey-and-omi
- **Public buyer check:** Direct Amazon URLs and the live PawStreak book pages were **not accessible to this session on Nov 11**. No current price, stock, Kindle match, cart/checkout result, live traffic or conversion is claimed. Earlier paperback metadata verification remains historical only.
- **Database, read-only:** PawStreak Supabase project; `public.waitlist_signups` table. Exact aggregate query (no emails selected):
  ```sql
  SELECT source, COUNT(*)::int AS records,
         COUNT(DISTINCT lower(email))::int AS distinct_addresses,
         MAX(created_at) AS latest_signup_utc
  FROM public.waitlist_signups
  WHERE source = 'bailey_omi_book_news'
  GROUP BY source;
  ```
  **Returned:** 2 signup records, 2 distinct addresses, latest 2026-11-03 14:28:27 UTC. These are **not two confirmed marketing-opt-in contacts**.
- **Actual signup schema:** `id, name, email, dog_name, zip_code, source, created_at`. It has **no dedicated opt-in consent timestamp/version, confirmation state, unsubscribe/suppression field, or consent audit column**. This does not prove no external provider exists, but none was verified. Do not send a promotional campaign to those two records.
- **Social content:** Unmerged editorial buffer currently runs through **November 28** ([Nov 22–28](./2026-11-22-to-28-organic-buffer.md)). Four authentic cover-based visuals were exported outside GitHub on Nov 10; they are **not automatically approved/published**. No need for duplicate filler content today.

## Practical conversion-release order (no unapproved public changes)
1. **Time-sensitive library exposure:** SDPL's official [61st Local Author Exhibit eligibility page](https://www.sandiego.gov/public-library/news-events/localauthors) again confirms **Wednesday, November 25, 2026** as the deadline for both completed online registration and **receipt of one finished bound paperback**. The [registration form](https://www.sandiego.gov/public-library/news-events/localauthorssubmit) requires 200-character-max author bio and summary, and one `Carroll.jpg` or equivalent allowed cover no larger than 2 MB. The authentic cover export already exists in prior approved-source handoff, but published-version parity and delivery remain owner-gated. See [submission sprint](./2026-11-04-san-diego-library-submission-sprint.md).
2. **Shopper CTA check:** On an authorized real browser, open both Amazon links from a signed-out mobile and desktop session. Record precise redirect, displayed book author/edition, price currency, ordering availability and final purchase CTA **without buying**. Correct mismatched labels only in a reviewed PR.
3. **Email consent and suppression:** Before any send, document lawful consent wording, source, timestamp/version, whether confirmation is required, suppression/unsubscribe token lifecycle and sender identity. Implement and test a real one-click unsubscribe and a blocked-send test for unsubscribed contacts; reject address collisions and ensure book-news recipients are isolated from app marketing. No actual send without owner approval.
4. **SEO source truth:** The existing `og:image:alt` on the Book 1 page refers to `big-climb.webp` as a published cover, when it is illustrated **staircase scene art**. The proposed accurate replacement is already in the [A+ content draft](./2026-11-09-kdp-aplus-content.md). Do not modify the live page until approved. Verify Search Console indexing/actual impressions with account access before claiming SEO progress.
5. **Distribution after confirmation:** Use the existing authentic character graphics and educator/library sheet to drive an approved Book 1 CTA; track only real posts, visitors, subscriber consent and KDP royalties. Avoid fabricated reviews, ratings, buyers, or library acceptance.

## Separate repository security issue spotted while inspecting book-news schema
Supabase's `list_tables` advisory reports **row-level security disabled on `public.push_cron_tokens`**, a table outside the Bailey & Omi funnel. **No change made.** Review actual clients/policies before considering:
```sql
ALTER TABLE public.push_cron_tokens ENABLE ROW LEVEL SECURITY;
```
Enabling without suitable policies could block current operations. Escalate to the PawStreak app security lane; do not handle it as part of this book PR.

**Evidence level:** Current GitHub source and a read-only SQL aggregate are verified November 11; Amazon checkout, production web pages, marketing-consent workflow, KDP sales and author submission are **not** verified today.
