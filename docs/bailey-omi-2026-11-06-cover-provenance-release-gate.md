# Bailey & Omi — November 6 source-of-truth cover and distribution gate

> **November 7 recovery update — real cover now available for submission.** The approved paperback wrap source `Baileys_Big_Climb_Paperback_Cover_8.5x8.5_24pp_PremiumColor.pdf` was located in the user's ChatGPT Library and the **actual right-hand printed front cover** was visually inspected and extracted without changing the source PDF or artwork. The new owner-downloadable `Carroll.jpg` is **1403 × 1418 pixels, 713,910 bytes (below the library's 2 MB limit)**; SHA-256 `0ee32e19116cb2e319e290f44a523a15cce6bfb1fee95ac00f43b122e45e58b2`. The printed title, author credit, Bailey/Omi/Maggie artwork remain intact. A separate illustrated submission-proof PDF and ZIP handoff were created and verified outside GitHub; **the image is not committed to this PR**. Confirm the cover matches the currently published KDP paperback before official registration. This resolves the previous **asset-unavailable** obstacle, not the owner's required form submission or physical bound-copy delivery. No library submission or physical shipment occurred.

**Author:** S.T. Carroll · **Existing title:** *Bailey's Big Climb*, Book 1 · **Status:** working notes only, not submitted/published. No KDP masters, public pages, email data or live bookstore listings changed.

## Significant source correction — do not use scene art as a book-cover upload

I inspected the **actual pixels** of `public/bailey-and-omi/big-climb.webp` on the existing PR branch. The asset is authentic approved watercolor artwork depicting young Bailey facing the staircase. **It does not contain the printed title or author credit.** Therefore it cannot be assumed to be the **final published front cover** for a library registration. In particular:

- It is suitable for a clearly labelled illustrated *story scene* on the reader website, social graphics, and family activity.
- It is **not** the `Carroll.jpg` front-cover file requested for the 2026 San Diego Public Library Local Author Exhibit.
- Previous promotional copy used the inaccurate phrase “published book cover” for this art. Corrected the image description on the PR-branch social studio, library information sheet and family activity to **scene illustration**. These updates do not affect public production pages.
- Obtain the **actual approved published front cover** from the author/KDP final assets or a scan/photo of the finished paperback before converting/renaming. It must show the real final title and S.T. Carroll credit. Do not construct a new cover from the web illustration, regenerate art, or pull a superseded draft PDF.
- A **separate, tested, browser-only HTML converter** was prepared in this run as a downloadable author utility. It takes an author-selected final cover JPG/PNG/WebP, exports uncropped `Carroll.jpg` under 2,000,000 bytes and requires visual approval. It is not deployed or committed here, and has only been exercised using a clearly marked synthetic QA fixture; no actual published cover file was converted.

## City library submission — verified November 6

Primary sources: [Local Author Exhibit rules](https://www.sandiego.gov/public-library/news-events/localauthors) and [official registration form](https://www.sandiego.gov/public-library/news-events/localauthorssubmit).

- **Deadline:** Wednesday **November 25, 2026** — online registration **and receipt of one finished bound paperback** must both be completed. A registration alone is not enough.
- **Eligibility:** current San Diego County resident, book published in 2026, self-publication accepted.
- **Format:** print preferred when both Kindle and paperback exist; one finished copy only, not an ARC, loose pages or proof.
- **Cover upload:** authors' last name used as file stem (`Carroll.jpg`), exactly one JPG/PNG/GIF allowed, **maximum 2 MB**.
- **Form fields:** first and last name *as printed on book*, author's age group (Adult), target audience (Child 0–11), <200-character biography, actual contributors, real contact info, title, publication year (2026), <200-character summary, nearest city library branch, optional Lit Café preference and copy-disposition acknowledgement. Do not invent collaborators, contact details or a physical delivery address.
- **Ready-to-paste verified-length biography/summary:** see `launch/bailey-omi-book1/2026-11-04-san-diego-library-submission-sprint.md`. Check contributor credits against finished paperback first.
- **Action still requiring the owner:** supply/locate the published front-cover master; confirm author contact and contributor fields; submit form; follow *actual* resulting delivery instructions; deliver one print copy before deadline. No submission, purchase, shipment or delivery is claimed.
- For delivery/address questions the program lists `localauthor@sandiego.gov`. Do not infer physical mailing instructions from the Central Library's generic address.

## Book 1 sales funnel — current verification boundaries

- The *source* for `bailey-and-omi/big-climb/index.html` and `bailey-and-omi/index.html` contains Kindle `B0HMDMQ4Y3` and paperback `B0HMFT1R5P` Amazon URLs. The direct Amazon pages and public production URL were not reachable through this run's unauthenticated web access; no actual stock, buyability or current prices established.
- Third-party catalog [ThriftBooks](https://www.thriftbooks.com/w/baileys-big-climb_st-carroll/60626430/) corroborates the paperback title, author and ISBN-13 `9798160563947`. This is not an Amazon checkout test or sales count.
- `src/story-signup.ts` sends book-news email entries to Supabase from the form. A working consent, verification/welcome message, and unsubscribe flow have **not** been established; do not send campaigns to unverified rows.
- Existing SEO metadata and schema are visible in source, not independently confirmed as indexed or converting. Proposed parent-facing FAQs and no-offer ISBN schema notes are in `docs/bailey-omi-2026-11-03-seo-ready-copy.md` for future approval; no published-page edit is authorized here.
- Report traffic, KDP units/royalties and subscriber counts only from connected analytics/KDP/email evidence, none available in this run.

## Content and franchise: reuse, do not duplicate

- **Ranked ten-story slate:** `docs/bailey-omi-books-2-11-story-arcs.md`; ten distinct grounded settings, arcs, illustration hooks and emotional lessons. Status **development only**. The Official Creative Bible v1 (September 2026) preserves Bailey's black/white markings, blue eyes and green collar; Omi's golden-tan body, pointed ears, pink collar and older-sister personality; warm watercolor/pencil style; accurate perspective; and S.T. Carroll credit. The older bible's suggested book sequence and the newer ranked slate are **both proposals**, not canon or publication announcements.
- **Book 2:** initial beat map in `docs/bailey-omi-2026-11-05-book2-development-beats.md`. Require the real outing details before claiming any windy-day incident happened.
- **Existing Instagram rolling buffer:** authored slots already reach **November 28** in `launch/bailey-omi-book1/2026-11-22-to-28-organic-buffer.md`. No need for additional redundant daily posts; prioritize rendering, visual checking and authorized distribution of existing original assets. Correct any references that call `big-climb.webp` the finished *cover*.
- No invented reviews, bestseller status, sales, event attendance, real-world dog incidents or endorsements.

## Immediate release order

1. **Cover export prepared (Nov 7).** Visually compare the new `Carroll.jpg` with the currently published print edition; confirm a finished bound paperback is in hand. The earlier missing-cover blocker is resolved for preparation, but neither library acceptance nor source/KDP parity is established.
2. **Complete city-library form and arrange one bound copy to be received by November 25.** Record only actual confirmation and receipt.
3. **Check Amazon both editions as a real shopper and test consented signup/unsubscribe.** Only after verification, approve one existing social slot, library pitch and the optional free-family-activity site link.
4. **Then** review the actual Book 2 manuscript/illustration needs against the Official Creative Bible, without touching finished Book 1 KDP art.

**Change classification:** 3 corrected previously **unmerged** PR-branch HTML assets, 4 corrected unmerged social-buffer Markdown files, and this new documentation note. No production deployment, social publishing, KDP change, email send, or spending.
