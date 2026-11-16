-- Book-news permission and source-scoped deduplication.
-- REVIEW REQUIRED: apply before releasing the matching book-news form code.
-- Historical records are left unverified (consent_version / consented_at NULL).
-- Does not send email or provide an automated unsubscribe endpoint.

alter table public.waitlist_signups
  add column if not exists book_news_consent_version text,
  add column if not exists book_news_consented_at timestamptz,
  add column if not exists book_news_unsubscribed_at timestamptz;

-- Existing email-only unique index prevents a PawStreak waitlist user
-- from separately joining Bailey & Omi book news with the same email.
-- Verify no duplicate normalized emails per source before applying.
create unique index if not exists waitlist_signups_source_email_ci_idx
  on public.waitlist_signups (source, lower(btrim(email)));
drop index if exists public.waitlist_signups_email_idx;

create or replace function public.stamp_book_news_consent()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.source = 'bailey_omi_book_news'
     and new.book_news_consent_version = '2026-11-v1' then
    new.book_news_consented_at := now();
  else
    new.book_news_consented_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_book_news_consent on public.waitlist_signups;
create trigger stamp_book_news_consent
  before insert on public.waitlist_signups
  for each row execute function public.stamp_book_news_consent();

comment on column public.waitlist_signups.book_news_consent_version is
  'Non-null for a newly submitted, explicitly checked book-news form; historical records remain NULL.';
comment on column public.waitlist_signups.book_news_consented_at is
  'Database-stamped submission time, not double-opt-in or proof of mailbox ownership.';
comment on column public.waitlist_signups.book_news_unsubscribed_at is
  'Set by an authorized operator when an opt-out request is processed. No public update policy.';

-- Release gate: confirm duplicate check, apply migration with approval,
-- then release the UI; test first and duplicate signups, opt-out mailbox,
-- and avoid emailing old records with unverified consent.
