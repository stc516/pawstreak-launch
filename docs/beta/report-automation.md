# Beta report automation

The `Beta health report` GitHub workflow runs weekly and can also be started manually. It produces aggregate JSON and Markdown artifacts without exporting email addresses, user IDs, dog details, notes, photos, or raw feedback.

Configure these as secrets in the protected GitHub `production` environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is intentionally used only inside the protected, read-only reporting job. Never put it in a Vite variable, application bundle, repository file, workflow log, or chat message. Protect the GitHub environment with appropriate reviewers before enabling production access.

The report covers a rolling 30-day window and evaluates the beta thresholds from `docs/beta/founder-dashboard-spec.md`. A passing number is a prompt for qualitative review, not an automatic launch or monetization decision.
