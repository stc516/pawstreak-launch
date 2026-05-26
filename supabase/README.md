# Supabase — demo feedback

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the migration in **SQL Editor**:

   `supabase/migrations/001_demo_feedback.sql`

3. Copy project URL and anon key into `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

4. Restart the dev server after adding env vars.

## Table: `demo_feedback`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Matches client-generated id |
| `submitted_at` | timestamptz | When tester submitted |
| `what_is_it_for` | text | |
| `would_use_with_dog` | text | |
| `what_confused` | text | |
| `what_liked_most` | text | |
| `premium_value` | text nullable | Optional premium question |
| `user_agent` | text nullable | Browser user agent |
| `page_path` | text nullable | Path when submitted |
| `source` | text | Default `demo` |
| `created_at` | timestamptz | Server insert time |

## View feedback

- Internal dashboard: `/internal/feedback`
- Supabase Table Editor: `public.demo_feedback`

Without env vars, feedback still saves to browser `localStorage` only.
