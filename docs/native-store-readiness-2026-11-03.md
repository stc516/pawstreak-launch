# PawStreak native store readiness package — 2026-11-03

Candidate source: local branch `codex/app-execution-20261103`, commit `136c320`. This commit is not pushed, merged, deployed, signed, or submitted.

## Listing identity

| Field | Draft |
| --- | --- |
| App name | PawStreak |
| Bundle/application ID | `com.pawstreak.app` |
| Primary category | Lifestyle |
| Secondary category | Travel (preferred) or Health & Fitness (owner decision) |
| Support URL | `https://pawstreakapp.com/support` |
| Privacy URL | `https://pawstreakapp.com/privacy` |
| Account deletion URL | `https://pawstreakapp.com/delete-account` |
| Subtitle / short description | Better dog days near you |

## Promotional text

Find dog-friendly places, turn an ordinary walk into an adventure, and save the memories that prove your dog had a better day.

## Full description

PawStreak helps dog parents give their dogs better days.

Discover dog-friendly places, choose an adventure, get out the door, and save the memory when you are done. PawStreak is built around one simple loop: discover, go, remember, and find the next good day together.

With PawStreak you can:

- Find useful dog-friendly outing ideas near you
- Start a Quick Walk when you just need to get moving
- Save photos, notes, and favorite moments from the day
- Build a Journey of the places and adventures you have shared
- Use optional reminders to keep better dog days from slipping away
- Create a clean image card for the native share sheet

PawStreak is not a veterinary tool, a hardcore GPS tracker, or a guarantee that a place's rules have not changed. Always confirm posted access and leash rules before you go.

Your dog's best days should not disappear in your camera roll.

## Keyword starting set

dog walking, dog friendly, dog parks, dog beach, dog adventure, dog places, dog trails, dog memories, pet parents, local outings

Verify the current console's field and character limits before entry. Do not add unsupported claims such as nationwide coverage, live route tracking, guaranteed dog-friendly access, or direct Instagram publishing.

## Release notes draft

### Version 1.0 beta

- Discover outing ideas and dog-friendly places in supported areas.
- Start a Quick Walk or selected adventure.
- Add a photo, finish the outing, and save the memory to Journey.
- Create an image card and open the native share sheet.
- Return from supported PawStreak auth and invite links.
- Get clear recovery messages when a photo or phone-gallery save does not complete.

Native reminders are not release-ready until APNs/FCM delivery passes on physical devices. Do not mention them in public release notes before that gate passes.

## Privacy-answer evidence draft

These are preparation notes, not final legal or console answers. Final selections must match the production deployment and the store's current definitions.

| Data area | Repository evidence | Linked to account? | Used for tracking? | Draft disclosure |
| --- | --- | --- | --- | --- |
| Email and profile name | Supabase Auth and `profiles` | Yes | No evidence of cross-company tracking | Contact info / account management |
| Dog profile | Name, breed, age, avatar/photo | Yes | No | User content |
| Photos and memory text | Private storage plus `memories` | Yes | No | Photos/videos and other user content |
| Approximate location/ZIP | Profile location query/label; optional expansion requests | Yes | No | Approximate location / app functionality |
| Adventure coordinates | Optional location-candidate start/end coordinates | Yes | No | Precise location only if production enables and stores these flows; verify before answering |
| Pack invite email | `pack_invites.email` | Yes | No | Contact info / app functionality |
| Product events | `user_events` event name, metadata, path, optional user ID | Sometimes | No evidence of ad tracking | Product interaction / analytics |
| Push identifiers | Web endpoint today; planned APNs/FCM token | Yes | No | Device or other identifier / app functionality |
| Feedback/support | Product feedback text and optional contact context | Sometimes | No | User content / support |

Repository inspection found no third-party advertising SDK and no evidence of data broker or cross-app advertising use. This is not proof of production-console configuration; verify Vercel, Supabase, Mapbox, Resend, and any monitoring/analytics services before final submission.

## Permission-purpose drafts

- Camera: Capture photos from your dog's adventures.
- Photo library read: Choose a photo to save with an adventure memory.
- Photo library add: Save an adventure photo or share card to your phone when you choose.
- Location while using the app: Find nearby outing ideas and optionally attach location context to an adventure.
- Notifications: Receive optional morning or evening reminders after enabling them in PawStreak.

The committed iOS usage strings already cover camera, photo library, photo-library add, and while-in-use location. Android currently declares internet, location, legacy media permissions, and notification permission. Review platform data-safety implications after the final native implementation.

## Screenshot inventory

Fresh, current demo captures generated from `/demo/app` are stored in `launch/native-store/2026-11-03/captures/` with a manifest and source commit.

| Order | File | Store story | Readiness |
| --- | --- | --- | --- |
| 1 | `01-today-home.png` | One clear next dog adventure | Ready as authentic demo UI |
| 2 | `02-explore.png` | Explore current outing options | Ready for layout review; recapture with production Mapbox token for final store set |
| 3 | `03-active-adventure.png` | Start and finish an outing | Ready as authentic demo UI |
| 4 | `04-share-card.png` | Create a shareable image | Ready as authentic demo UI |
| 5 | `05-saved-memory.png` | Keep the day in Journey | Ready as authentic demo UI |
| 6 | `06-reminders-settings.png` | Optional reminders | Hold until native APNs/FCM is verified |
| — | `pawstreak-current-demo-flow.webm` | Current end-to-end demo recording | Internal review/source material; not a store upload format |

Every asset must retain the demo disclosure internally. Do not present Bailey, Meiomi, demo memories, or demo progress as customer activity.

## Submission blockers

- [ ] Real iPhone signing, install, camera, Photos, background/resume, auth, deep-link, and share-sheet pass.
- [ ] Real Android device auth, camera/gallery, background/resume, deep-link, and share-sheet pass.
- [ ] APNs/FCM implementation and real-device delivery pass, or reminders removed from store claims/screenshots.
- [ ] App Store Connect and Play Console access confirmed by the owner.
- [ ] Final category, age/content ratings, privacy answers, data-safety answers, support ownership, and legal review approved.
- [ ] Final screenshots recaptured from the signed release candidate at required device sizes.
- [ ] Release candidate SHA recorded and full release checklist passed.

No submission, upload, release, purchase, or public listing change is authorized by this document.
