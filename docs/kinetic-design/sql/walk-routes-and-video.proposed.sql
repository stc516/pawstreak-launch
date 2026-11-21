-- Proposed migration, NOT applied. Generate its migration filename with
-- `supabase migration new walk_routes_and_memory_video` in a working CLI environment,
-- then copy this SQL into that generated migration. Test against staging first.
alter table public.memories add column if not exists route_points jsonb not null default '[]'::jsonb;
alter table public.memories add constraint memory_route_points_array check (jsonb_typeof(route_points) = 'array' and jsonb_array_length(route_points) <= 2000 and pg_column_size(route_points) <= 262144);
alter table public.memories add column if not exists video_path text;
alter table public.memories add constraint memory_video_owned_path check (video_path is null or video_path = user_id::text || '/' || id::text || '/clip');

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('memory-videos','memory-videos',false,26214400,array['video/mp4','video/quicktime','video/webm']);

-- Owner-only clip access. A shared Pack does not automatically share video.
create policy memory_videos_read on storage.objects for select to authenticated using (
 bucket_id='memory-videos' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy memory_videos_insert on storage.objects for insert to authenticated with check (
 bucket_id='memory-videos' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.memories m where m.user_id=(select auth.uid()) and name=m.user_id::text || '/' || m.id::text || '/clip')
 and (select count(*) from storage.objects o where o.bucket_id='memory-videos' and (storage.foldername(o.name))[1]=(select auth.uid())::text) < 10
);
create policy memory_videos_update on storage.objects for update to authenticated using (
 bucket_id='memory-videos' and (storage.foldername(name))[1]=(select auth.uid())::text
) with check (
 bucket_id='memory-videos' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.memories m where m.user_id=(select auth.uid()) and name=m.user_id::text || '/' || m.id::text || '/clip')
);
create policy memory_videos_delete on storage.objects for delete to authenticated using (
 bucket_id='memory-videos' and (storage.foldername(name))[1]=(select auth.uid())::text
);
