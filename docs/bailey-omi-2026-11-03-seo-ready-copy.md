# Bailey & Omi Adventures — ready-to-review SEO copy and paperback schema
**Prepared:** November 3, 2026 · **Not deployed or applied to published pages**

## Where this fits
The existing [Book 1 page](https://pawstreakapp.com/bailey-and-omi/big-climb) already has descriptive metadata, a canonical URL, social tags, the published cover and a `Book` JSON-LD script in `bailey-and-omi/big-climb/index.html`. The official pages were reviewed **in GitHub source**, not live-HTTP verified. This pack is optional original copy for a future approved edit, not a demand to change published files.

## Four actual caregiver questions for Book 1 page (ready-to-place below the family activity)
### What is *Bailey's Big Climb* about?
Bailey is a young Husky puppy facing a staircase that seems enormous. With Maggie encouraging her and her older sister Omi close by, she decides how to approach something unfamiliar, one small step at a time. The story invites children to talk about courage, patience and encouragement.

### What ages is *Bailey's Big Climb* for?
The illustrated picture book is designed for ages 3–7 and for families reading together. A grown-up can pause to ask what Bailey might be feeling and what helps someone feel safe when learning something new.

### Are Bailey and Omi real dogs?
Yes. Bailey, a blue-eyed black-and-white female Husky, and Omi/Meiomi, her older golden-tan rescue sister, are real dogs. Their personalities inspire fictional, watercolor-illustrated Bailey & Omi Adventures. The book is fiction inspired by the dogs, not a literal recording of a specific incident.

### Is there a family activity to try after reading?
Yes. The [Book 1 activity](https://pawstreakapp.com/bailey-and-omi/big-climb#try-big-climb) suggests choosing a small, safe discovery for your own dog, allowing plenty of pauses and recording a memory only when everyone is comfortable. Supervise children and never force dogs onto stairs or into unfamiliar situations.

## Optional 2-sentence organic-search intro
*Bailey's Big Climb*, Book 1 in Bailey & Omi Adventures by S.T. Carroll, is a watercolor-illustrated picture book about a Husky puppy learning to meet a big challenge with patience and encouragement. Inspired by real dog sisters Bailey and Omi, it's a gentle read-aloud for ages 3–7, with a safe family activity after the story.

**Placement:** Parent/teacher reading page, bookstore press handout, or future approved official-page FAQ section. Do not copy identical blocks onto several indexed pages.

## Paperback ISBN: optional JSON-LD addition
Independent catalogs on November 3 confirmed paperback ISBN-13 `9798160563947` for *Bailey's Big Climb* by S.T. Carroll: [ThriftBooks](https://www.thriftbooks.com/w/baileys-big-climb_st-carroll/60626430/) and [IBS](https://www.ibs.it/bailey-s-big-climb-libro-inglese-s-t-carroll/e/9798160563947). This supports **bibliographic metadata only**. It does not prove a currently buyable Amazon listing, an edition's retail price, availability or any sales.

Current Book 1 JSON-LD on `main` is a `Book` object. Once publisher metadata is re-checked and the site edit approved, this `workExample` property may be included in that existing Book object (not as another competing Book block):

```json
"workExample": {
  "@type": "Book",
  "name": "Bailey’s Big Climb (paperback)",
  "bookFormat": "https://schema.org/Paperback",
  "isbn": "9798160563947",
  "inLanguage": "en",
  "author": {
    "@type": "Person",
    "name": "S.T. Carroll"
  }
}
```

Do not add `Offer`, `price`, `availability`, `aggregateRating`, `review`, `award` or publication-count claims without primary proof. The eBook ASIN `B0HMDMQ4Y3` exists in website source only and should not be asserted as live retailer data.

## Helpful internal linking (requires separate approval on published files)
1. On the series page, keep a descriptive link to the Book 1 details page, not just a buy button.
2. On the Book 1 page, link the free **existing** in-page activity `#try-big-climb` from the body copy and consider linking the printable only once its unmerged route is deployed and checked.
3. From the approved librarian handout, use the full official Book 1 URL, not direct unverified Amazon ASIN links.

## Search Console validation after an authorized deployment
- Inspect the canonical URL for both book and series pages, confirm they resolve and are indexable, check robots and canonical.
- Validate Book structured data and image URLs via an authorized current-page fetch. Avoid claiming rich results just because JSON-LD exists.
- Review search impressions and actual clicks for child-book/courage/read-aloud queries; no fabricated SEO growth percentage.
- Avoid indiscriminate paid backlink placements, misleading review solicitation or making PawStreak itself look like a children's app.

**Status:** ready-to-review copy and metadata suggestion only; neither live SEO nor retailer configuration changed.
