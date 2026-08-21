# PawStreak City Data Discovery Standard

## Goal
Build the most comprehensive, source-backed dog-friendly activity and place dataset possible for each market. Do not rely on one directory or generic searches.

## Source hierarchy
1. Official government / park / beach / trail / tourism sources
2. Official business or venue websites and current policy pages
3. Structured map/business directories and outdoor databases
4. Local publications, neighborhood blogs, dog blogs and tourism guides
5. Current social posts from businesses, creators and local dog communities
6. Community discussion/reviews (Reddit, review platforms, local groups)

Community/social evidence is valuable for discovery and qualitative attributes but should not override a contradictory current first-party rule.

## Discovery passes
For every market run all of these passes:

### Government and public land
- City parks and recreation
- County parks
- State parks/beaches
- National parks/forests where relevant
- Port/harbor/waterfront agencies
- Open-space preserves
- Municipal beach rules
- Tourism authority
- Transit/ferry agencies when dogs can participate

### Commercial places
Search by city AND neighborhood for:
- restaurants
- coffee
- breweries/taprooms
- wineries
- bars
- hotels
- shopping districts
- markets
- retail
- paddle/boat/outdoor rentals
- campgrounds
- unusual attractions and activities

### Outdoor activities
- dog parks
- beaches
- trails
- scenic walks
- lakes
- parks
- picnic areas
- camping
- waterfronts
- neighborhood walking routes

### Events
- recurring dog events
- adoption events
- Bark-at-the-Park style sports events
- markets
- outdoor movies/concerts
- seasonal events
- dog surfing/races/festivals

### Community long tail
Search Reddit, local blogs, review sites, Instagram/TikTok discovery and neighborhood sources for places that do not rank for generic dog-friendly searches.

## Neighborhood sweep
Never stop at city-level queries. Enumerate neighborhoods/submarkets and repeat category discovery for each one.

## Candidate record
Every candidate should support:
- canonical name
- category/subcategory
- address + coordinates
- city/neighborhood
- official URL
- source URLs / source types
- discovery source
- dog policy
- leash status
- indoor/outdoor/patio status
- fenced
- water
- shade
- dog amenities
- size suitability
- puppy/senior suitability where evidence supports it
- noise/crowd notes
- parking/access notes
- hours
- price band
- why-go editorial note
- nearby pairings
- last checked date
- verification status
- confidence score
- conflict flag

## Verification states
- VERIFIED_OFFICIAL: current first-party/authority evidence explicitly supports the dog policy
- CORROBORATED: multiple current independent sources support it, but no explicit first-party policy found
- COMMUNITY_REPORTED: useful current community evidence only
- NEEDS_VERIFICATION: insufficient/conflicting evidence
- NOT_DOG_FRIENDLY: current evidence says dogs are prohibited (retain when useful to prevent bad recommendations)
- STALE: evidence is too old or business/status changed

## Confidence
Do not convert confidence into fake certainty. Store why confidence exists.

Suggested scoring inputs:
- official current policy: strongest
- government rule/designation: strongest
- current business statement/social post: strong
- multiple recent independent sources: medium/strong
- structured directory attribute: medium
- single review/community comment: weak
- old blog/listicle: discovery only until corroborated

## San Diego initial authority facts
The City of San Diego currently publishes 20+ designated off-leash areas. Its current rules state dogs generally must be leashed in city parks/trails/canyons except designated off-leash areas. Dog Beach and Fiesta Island are designated beach/bay off-leash areas. Beach access outside designated areas is time/rule restricted and must be represented precisely rather than simply tagged dog-friendly.

## Publishing rule
A candidate can exist internally before verification. Public pages must clearly distinguish verified policy from community-reported information. Never invent dog amenities, policies, reviews, ratings, verification dates, or firsthand visits.

## City completion
A city is not considered deeply curated until discovery has covered:
- every official dog/off-leash public facility source available
- every major neighborhood
- every core commercial category
- outdoor/activity sources
- current local editorial/blog sources
- community/social long-tail discovery
- duplicate resolution
- closed-business/status checks
- verification/conflict queue

The objective is breadth first for candidate discovery, then evidence-backed enrichment and verification before claiming certainty.