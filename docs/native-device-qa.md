# PawStreak Native Device QA

Run this on real devices before inviting external TestFlight users. Simulator is useful, but it does not prove camera, Photos, push, or share behavior.

## Device matrix

Minimum first pass:

- iPhone current iOS
- iPhone one older supported iOS version if available
- Android current version after iOS is stable

## Install and first launch

- App installs from TestFlight
- App icon is correct
- Splash screen is branded and does not feel generic
- App opens to the correct PawStreak entry
- No blank screen after cold start
- App resumes from background without resetting state

## Auth

- Email signup succeeds
- Email login succeeds
- Magic link or email confirmation returns to PawStreak when used
- Google OAuth returns to PawStreak, not stranded in Safari/browser
- Sign out works
- Returning signed-in user stays signed in

## Onboarding

- Create dog profile
- Dog name/photo persist after restart
- Location prompt is understandable
- User can skip optional permissions without dead end
- No fake dog/place/social data appears in production account mode

## Core adventure loop

- Today/Home loads with clear primary action
- Explore opens curated places
- Mapbox map renders
- Place cards/details are readable on iPhone
- Start adventure works
- Timer starts and keeps usable after screen lock/background/resume
- Add photo works from camera
- Add photo works from photo library if supported
- Finish adventure works
- Save memory succeeds
- Saved memory appears in Journey
- Next adventure path is obvious

## Photos

Native goal:

- Photo captured inside PawStreak can be saved to Photos/gallery with permission
- If permission is denied, PawStreak explains how to continue
- Memory still saves to PawStreak even if phone gallery save fails
- Uploaded/saved photos do not disappear after app restart

Current PWA fallback:

- Photo save opens system share sheet
- User can choose Save Image where iOS exposes it
- Download fallback is understandable

## Sharing

- Share card generates with real user/adventure content only
- No fake metrics or fake memories appear
- Instagram/share sheet receives the image file
- If Instagram drops the image, PawStreak gives a useful fallback
- Save to Photos works from share card path

## Push/reminders

- Reminder setup asks permission at the right moment
- Denied permission does not trap the user
- Morning reminder can be received
- Evening reminder can be received
- Notification tap opens PawStreak
- Reminder settings can be paused/changed

Native note: browser push subscriptions and native APNs/FCM tokens are different. Do not mark native push PASS until a real device receives APNs/FCM-backed notifications.

## Location/map

- Allow location flow works
- Deny location flow remains usable
- Explore still shows curated places without exact location
- Map does not create horizontal overflow
- Curated place directions/open-map behavior works or is clearly deferred

## Account and trust

- Privacy Policy opens
- Terms open
- Support opens
- Account deletion is discoverable
- Account deletion flow works against production backend before launch

## Performance acceptance

- Cold launch feels acceptable on iPhone
- Main app bundle does not create a long blank screen
- Map loading delay has a reasonable fallback/loading state
- No recurring console/runtime errors during the core loop

## Beta stop conditions

Pause external invites if any of these occur:

- Users cannot sign up or log in
- First adventure cannot be completed
- Memories/photos fail to persist honestly
- Map blocks discovery entirely
- Push/reminder setup creates repeated errors
- Account deletion is broken
- Production shows fake/demo data to real users
