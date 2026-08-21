# Dog City Guide — Rapid MVP

Working name: **PawStreak Places** (temporary; brand is not locked).

## Product thesis

Build the best answer to: **Where can I go with my dog?**

The website is a public, SEO-first dog-friendly city guide. PawStreak remains the app that turns discovery into an adventure, memory, and repeat behavior.

This is not a generic business directory. The differentiator is dog-specific decision data, strong local editorial, freshness/verification, and direct PawStreak actions.

## MVP launch market

San Diego first. Reuse the existing curated PawStreak SD/OC location dataset where appropriate, but treat every public listing as needing source/provenance and freshness metadata.

## MVP surfaces

1. Homepage / city discovery
2. San Diego city hub
3. Category landing pages
4. Neighborhood landing pages
5. Individual place pages
6. Search + filters
7. Map/list toggle
8. Editorial guide/blog pages
9. Submit/correct a place
10. PawStreak save/start CTA

## Initial categories

- Restaurants & patios
- Coffee
- Breweries & bars
- Dog parks
- Beaches
- Trails & hikes
- Parks
- Hotels/stays
- Stores
- Events
- Groomers
- Trainers
- Daycare/boarding
- Veterinarians / emergency vets

## Dog-specific place schema

Core:
- name
- slug
- category
- address
- neighborhood
- city/state/ZIP
- latitude/longitude
- website
- phone
- hours
- hero image
- short editorial summary
- source/provenance
- last verified date
- verification status

Dog data:
- dogs allowed
- patio only / indoor allowed
- leash rule
- off-leash status
- fenced
- shade
- water available
- dog menu/treats
- large-dog suitability
- puppy suitability
- senior-dog suitability
- noise/crowd level
- terrain
- parking
- accessibility
- fee
- restrictions/notes

## PawScore

Do not launch a fake algorithmic score. MVP uses transparent attributes and an editorial **Dog-Friendly Pick** badge only when verified. A future PawScore can be calculated after real reviews exist.

## SEO architecture

- `/san-diego/`
- `/san-diego/restaurants/`
- `/san-diego/dog-parks/`
- `/san-diego/beaches/`
- `/san-diego/trails/`
- `/san-diego/north-park/`
- `/san-diego/ocean-beach/`
- `/san-diego/la-jolla/`
- `/places/{slug}/`
- `/guides/{slug}/`

Every indexable page must have real utility. Do not mass-generate thin city/category combinations.

Place pages should include structured data where applicable, canonical URLs, breadcrumbs, related places, nearby dog adventures, verification date, and internal links to city/category/neighborhood hubs.

## First editorial cluster

Launch with a small, high-quality cluster instead of dozens of filler posts:

1. Best Dog-Friendly Restaurants in San Diego
2. Best Dog-Friendly Breweries in San Diego
3. Best Dog Beaches in San Diego
4. Best Dog Parks in San Diego
5. Best Dog-Friendly Hikes in San Diego
6. Dog-Friendly North Park Guide
7. Dog-Friendly Ocean Beach Guide
8. Dog-Friendly La Jolla Guide
9. Things to Do With Your Dog This Weekend in San Diego
10. A Perfect Dog-Friendly Saturday in San Diego

## Homepage concept directions

### A — Local Explorer (recommended)
Large location search: **What are we doing with the dog today?**
Quick chips: Eat, Drink, Hike, Beach, Park, Coffee.
Map/list results immediately below.
Editorial strip: This weekend in San Diego.
PawStreak CTA: Save an outing / start an adventure.

### B — Dog Yelp
Search-first utility: **Find places that actually welcome your dog.**
Dense cards with dog-specific attributes, verification dates and filters.
Best for high-intent SEO and repeat utility.

### C — City Magazine
Editorial hero: **San Diego is better with your dog.**
Neighborhood guides, weekend itineraries, curated lists and beautiful photography.
Directory search remains prominent but secondary.
Best brand feel; weaker pure utility than A/B.

Recommended hybrid: A's homepage + B's results/place pages + C's editorial guides.

## Place page concept

Hero photo + place name + category/neighborhood.

Immediate dog facts above the fold:
- Dog access
- Leash rule
- Shade
- Water
- Space/noise
- Last verified

Primary CTAs:
- Directions
- Website
- Save to PawStreak

Then:
- Why bring your dog here
- Know before you go
- Dog-specific amenities
- Photos
- Nearby dog-friendly places
- Pair it with an adventure
- Corrections / last verified
- Reviews later

## Data flywheel

Curated seed -> source verification -> publish -> user corrections -> owner claims -> dog-parent reviews -> freshness signals.

Never publish a dog-friendly claim solely because an AI inferred it.

## Rapid build plan

### Day 1
- Freeze MVP schema and information architecture.
- Build reusable city/category/place data model.
- Import existing San Diego seed data into a normalized staging dataset.
- Create homepage, city hub, category template and place template.

### Day 2
- Search/filter/map.
- Neighborhood pages.
- SEO metadata, sitemap, breadcrumbs, schema markup.
- PawStreak deep-link/save CTA architecture.

### Day 3
- Editorial guide template and first guides.
- Submit/correction workflow.
- Verification/source fields.
- Mobile QA and performance pass.

### Days 4–5
- Curate/verify top San Diego inventory.
- Launch public beta.
- Submit sitemap/Search Console.
- Start publishing local content and measuring search impressions.

Target: **working public San Diego MVP in 3–5 focused build days**, not 90 days.

## Expansion pipeline

Once San Diego templates are proven, a new city should mostly be a data/editorial operation rather than a new software project.

Candidate pipeline:
1. discover candidate places
2. normalize/dedupe
3. attach official/public sources
4. classify dog-specific evidence
5. confidence flag
6. human review questionable claims
7. publish
8. monitor corrections/freshness

## Core metrics

- indexed pages
- search impressions
- organic clicks
- search-to-place CTR
- place-page engagement
- directions/website clicks
- PawStreak saves
- PawStreak signups from directory
- corrections/submissions
- verified listings
- returning visitors

## Guardrails

- No fake reviews.
- No fake ratings.
- No scraped/copied editorial descriptions.
- No unverified dog policies presented as fact.
- No thousands of thin SEO pages.
- No feature work that delays the first useful San Diego launch.
- Keep the website public/searchable and PawStreak product behavior distinct.
