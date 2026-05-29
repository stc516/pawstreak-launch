-- Dog profile photo storage path (object lives in memory-photos bucket)

alter table public.dogs
  add column if not exists photo_path text;

comment on column public.dogs.photo_path is
  'Storage path in memory-photos bucket, e.g. {user_id}/dogs/{dog_id}.jpg';
