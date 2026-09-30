# Bailey & Omi public story foundation

Permanent destinations:
- https://pawstreakapp.com/bailey-and-omi
- https://pawstreakapp.com/bailey-and-omi/big-climb (Book 1 printed QR)

These are Vite multi-page HTML entries with static metadata and no JavaScript requirement. Vercel's specific rewrites precede the app fallback. The service worker excludes these routes from its app-shell navigation fallback. The original app and authentication flow remain intact. The landing footer links to the series.

## Assets and editorial completion
The two optimized WebP illustrations were extracted from Stephen's `baileys_big_climb_V3.pdf`: the first page illustration and a crop of page 4 excluding baked-in story text. They are book illustrations, never labeled real photographs. Keep the source PDF private; it is not included in this repository or downloadable from the site.

The series uses one shared photograph above the two dog bios, cropped from Stephen’s uploaded `B51640CB-814B-4AED-AF7C-7368FDF94CAC.jpeg`. The Book 1 real-dogs photograph uses a crop of `D293E317-9854-474A-94DF-A81E071E873E.jpeg`. These are optimized WebP copies with no EXIF metadata; source uploads remain unchanged. Both dogs are identified in alt text and the joint-photo caption. No purchasing, availability, release-date, award, or review claims are made. Add only real future books as new cards in the bookshelf and independent HTML entries with their own canonical metadata.

## Future Story Adventure
`data-story-adventure-id="big-climb"` is the stable content identifier. It is an extension point, not an implemented app feature. Replace or extend the current parent CTA only when the app can accept the story identifier, preserve it through signup/login, and associate it with the existing adventure completion and memory records. Then add an idempotent achievement rule linked to a completed experience, with multi-dog support and no automatic reward from merely opening the page. No new database schema or gamification is introduced here.

Keep the printed URL unchanged. Story content must remain public even when an optional app adventure requires an adult account. Future hosting migrations must retain these URLs or explicitly redirect them to equivalent public pages, never the app login screen.

## Verification
- `npm run lint`
- `npx tsc -b`
- `npm run build`
- `node qa/story-pages.mjs --static`
- `node qa/story-pages.mjs` against preview (320, 390, 768, 1440 px, JavaScript disabled)
- Existing native/release/browser QA; do not infer real-device or production evidence from emulation.

The dedicated PR workflow uploads full-page browser screenshots. No production checklist items are completed by this feature. Merge and deploy remain separate, explicitly excluded from this task. Test the canonical production Book 1 URL after an eventual approved release before printing QR codes.
