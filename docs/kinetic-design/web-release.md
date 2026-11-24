# Kinetic web release

Release scope: the selected Kinetic redesign from 7a6a4a8, based on production main 62e443c. Uses existing authentication, persistence, uploads and walk navigation. Supersedes the publication hold for the web app only.

This release contains no changes to Supabase, native projects, schedules, feature flags, deployment configuration or existing backend behavior. No Apple authentication, native notifications, video storage or route-recording additions are included. Those remain in draft PR #91. No PawStreak Places code is included.

GitHub/Vercel evidence: production deployment at main 62e443c; Vercel bot links repository to project prj_huCsxa2BNU06r2PcZNDcO8S3o6HL in team_VnpKP7VwuXGJpHMFZecOE0pm. Repository README identifies pawstreakapp.com as production and origin/main as release base. Direct Vercel connector access is unavailable; release uses the established GitHub integration. A merge alone is not proof of a live domain update.

The full draft's Beta CI failure was a Node 22 Apple plugin module import in native feature tests, outside this web release. Its screenshot job failed on retired Home selectors. Screenshot capture now targets the actual Kinetic Home, timer, controls and recap rather than the retired layout, preserving all captures/assertions.
