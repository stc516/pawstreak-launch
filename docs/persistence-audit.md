# PawStreak Persistence Audit

Last updated: 2026-06-18

## Backend-backed today

- Account profile, onboarding status, display name, email, location, dog vibes, selected categories, and active dog.
- Dog profiles, including name, breed, age, labels, sort order, and stored dog photo paths.
- Adventures started from catalog, neighborhood, or custom flows.
- Completed adventures, memory entries, recap labels, notes, and memory photos.
- Scheduled adventures.
- Location expansion requests and candidate place signals.
- Basic analytics events in `user_events`.

## Local-only today

- Pack Access members and pending invites.
- Joined challenges and challenge progress.
- Training lesson completions and reward unlocks.
- Favorite places.
- Monthly plan and random plan selections.
- Community posts and social activity.
- Dismissed app banners, overlays, active tab, and other session UI state.

## Product copy guardrails

- Pack Access can collect a name, role, permissions, and contact, but the invite is only saved locally right now.
- Do not say an invitation was sent until an email/SMS backend exists.
- Use "saved on this device" for pending Pack Access invites.

## Launch-ready backend tickets

1. Add Pack Access tables for members, pending invites, roles, permissions, invite status, and accepted account links.
2. Add invite delivery for email/SMS with resend, cancel, and expiration.
3. Add challenge enrollment/progress persistence per user and dog.
4. Add favorite places persistence.
5. Add saved monthly plans/custom plans.
6. Decide whether training progress should sync. Training is secondary, so local-only is acceptable for early launch if clearly treated as lightweight resources.
