# PawStreak autonomous engineering guide

## Mission
Help dog parents give their dogs better days. PawStreak should make it easier and more motivating to discover a worthwhile outing, actually go, and keep the memory afterward.

PawStreak is **not** a generic pet-care utility, GPS tracker, health dashboard, Rover clone, or walk counter. Optimize for adventures, discovery, motivation, memories, and a warm local feel.

## Autonomous work loop
For unattended engineering runs:

1. Read this file and inspect the latest commits before changing code.
2. Inspect open issues/PRs and the current implementation around the most important user loop.
3. Pick the highest-impact safe task that can be completed and verified in the current run. Prefer fixing a real product/reliability problem over creating speculative infrastructure.
4. Make the smallest coherent change that fully solves the selected problem.
5. Run the relevant targeted QA plus `npm run lint` and `npm run build` when the execution environment permits. For release-sensitive changes, use `npm run qa:release`.
6. Commit with a concise message describing user impact.
7. Re-read the resulting diff/state. If capacity remains, select the next safe task and continue.
8. Leave the repository in a state the next run can understand without asking the owner what to do next.

Do not stop merely because the previous task is complete. Stop only when the run ends, a meaningful approval is required, or there is no safe useful work remaining.

## Priority order
Use this order unless repository evidence clearly points to a more urgent regression:

1. **Core loop reliability:** discover/pick an adventure → start → active adventure → finish → save memory → Journey/reward payoff.
2. **Launch/native readiness:** mobile shell, authentication, deep links, camera/photos, production configuration guards, release QA.
3. **Discovery quality:** useful nearby places, accurate Places deep links, supported/unsupported-region behavior, saved/planned outings.
4. **Retention/payoff:** weekly recap, Journey, challenge progress, achievements, streaks, shareable memories. Reward the life given to the dog, not raw miles.
5. **UX polish:** remove confusing/redundant UI, improve hierarchy, accessibility and mobile ergonomics, replace uncanny/low-quality imagery when safe assets are available.
6. **Community/growth surfaces** that strengthen the adventure loop without distracting from it.

## Product guardrails
- Preserve multi-dog behavior. Never silently assume one dog or invent dog personalities.
- Keep the experience energetic, warm, adventurous, local and adult-friendly.
- Avoid cinematic melancholy, childish/cartoon-heavy treatment, fake dog emotions and hardcore RPG framing.
- Prefer real user state over demo/fake progress. Demo fixtures must never leak into authenticated production state.
- Do not fabricate place facts, opening hours, leash rules, amenities, distances or availability.
- Unsupported regions should remain useful through generic adventures and expansion requests rather than pretending curated coverage exists.
- Preserve active-adventure persistence, pause/resume/abandon behavior, duplicate-completion prevention and memory/reward integrity.
- Do not weaken existing release gates simply to make a build pass.

## Current architecture
- Vite + React + TypeScript
- Tailwind/custom CSS
- Supabase for auth/data/storage
- Mapbox for geocoding/maps
- PWA plus Capacitor native foundation
- Production domain: `pawstreakapp.com`
- Places discovery has a separate web property; app deep links should resolve to the intended canonical PawStreak place when an ID is available.

## High-value known product areas
Treat these as context, not an immutable backlog. Verify current code before acting.

- Home should quickly answer: what can I do with my dog today?
- Plan is the main discovery/planning surface.
- Journey should make completed adventures and memories feel valuable.
- Challenges and Achievements should motivate variety and better dog days rather than arbitrary grinding.
- Nearby lists should be digestible rather than endless; clear “see more” behavior is preferable to overwhelming Home.
- Training language should not appear as unexplained “up next” content.
- Places → app deep links should focus the exact intended place when possible.
- Share UI must describe the real image/share-sheet behavior and must not promise direct Instagram publishing if the platform does not support it.

## Approval boundaries
Proceed without owner approval for routine bug fixes, tests, accessibility fixes, copy clarification consistent with established voice, refactors with preserved behavior, and contained product improvements supported by existing direction.

Require owner input before:
- destructive production data operations;
- paid services or material new recurring spend;
- domain/DNS changes;
- authentication/security model changes with migration risk;
- irreversible production migrations;
- major navigation/product-positioning changes;
- deleting a major feature or changing the established brand direction.

When blocked, state the exact decision required and why. Do not ask the owner to choose between routine implementation details that can be resolved from code, tests, product guardrails, or standard engineering judgment.

## Definition of done
A task is not done because code was written. It is done when behavior is coherent, obvious regressions have been checked, relevant tests/QA have been run when possible, and the next unattended run can understand the resulting state from the repository and commit history.
