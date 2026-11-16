# Supabase Function Security Audit

Verified against PawStreak project `jifspotggsllxmreoqui` on 2026-11-04. The
review used the live advisor output, `pg_proc` definitions and ACLs, live RLS
policies/triggers, and every repository RPC call site. No production setting or
migration was changed during the audit.

## Decision matrix

| Function | Actual use | Reviewed target | Risk decision |
| --- | --- | --- | --- |
| `accept_pack_invite(text)` | Authenticated Edge Function RPC | `authenticated` only | Intentional privileged RPC; it rejects missing auth, expired tokens, and email mismatch. |
| `create_pack_invite(text,text)` | Authenticated Edge Function RPC | `authenticated` only | Intentional privileged RPC; owner check, role allowlist, and rate limit remain enforced. |
| `can_contribute_to_dog(uuid)` | Authenticated RLS policies | `authenticated` only | RLS helper; result is scoped to `auth.uid()` and member role. |
| `can_view_dog(uuid)` | Authenticated RLS policies | `authenticated` only | RLS helper; result is scoped to `auth.uid()`. |
| `is_internal_user()` | Authenticated feedback RLS policies | `authenticated` only | RLS helper reads protected `app_metadata`, not user-editable metadata. |
| `is_pack_member(uuid)` | Authenticated pack RLS policies | `authenticated` only | RLS helper; result is scoped to `auth.uid()`. |
| `is_pack_owner(uuid)` | Authenticated pack RLS and invite RPC | `authenticated` only | RLS/RPC helper; result is scoped to `auth.uid()`. |
| `assert_rate_limit(text,int,int)` | Called only by trusted functions/triggers | internal only | Direct API execution is unnecessary and lets callers manipulate their rate counters. |
| `create_pack_for_profile()` | Profile trigger | internal only | Trigger function has no direct API use. |
| `ensure_user_pack(uuid)` | Profile trigger and invite RPC | internal only | Highest-risk grant: the arbitrary `target_user_id` parameter permits cross-user state mutation when directly invoked. |
| `rate_limit_challenge_request()` | Challenge insert trigger | internal only | Trigger function has no direct API use. |
| `rate_limit_location_candidate()` | Location-candidate insert trigger | internal only | Trigger function has no direct API use. |
| `rate_limit_memory_photos()` | Memory update trigger | internal only | Trigger function has no direct API use. |
| `set_updated_at()` | Update triggers | internal only, empty `search_path` | No direct API use; immutable lookup context resolves the advisor finding. |

Every reviewed function was owned by `postgres`. All 13 `SECURITY DEFINER`
functions were executable by both `anon` and `authenticated` before the proposed
migration, including functions whose earlier migration only revoked `PUBLIC`.
Live ACL inspection showed Supabase's explicit role grants remained after that
revoke, which is why the new migration names `PUBLIC`, `anon`, and
`authenticated` separately before regranting the seven-item allowlist.

## Authentication setting owner action

The Security Advisor also reports leaked-password protection disabled. Current
Supabase documentation says the HaveIBeenPwned check is enabled from Auth
settings and is available on Pro plans and above. This repository change does
not toggle account settings or incur plan changes. The owner should confirm the
current plan and enable **Prevent use of leaked passwords** in Supabase Auth
settings if available.

## Verification

The migration ends with catalog assertions that abort if:

- `anon` or `PUBLIC` retains `EXECUTE` on any reviewed function;
- an internal-only function remains executable by `authenticated`;
- an RLS/RPC allowlisted function loses authenticated execution; or
- `public.set_updated_at()` does not have an empty `search_path`.

Repository QA also confirms that the only app/Edge Function RPC call sites are
`create_pack_invite` and `accept_pack_invite`.
