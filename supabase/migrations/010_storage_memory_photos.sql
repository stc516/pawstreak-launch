-- Supabase Storage bucket for memory photos

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do nothing;

create policy "memory_photos_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "memory_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "memory_photos_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "memory_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
