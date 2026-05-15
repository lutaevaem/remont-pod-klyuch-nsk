-- Lock admin editing to authenticated users.
-- Run in Supabase SQL Editor after creating the administrator user in Authentication > Users.
-- IMPORTANT: This removes temporary anon edit access from admin tables and storage.

-- Table grants: public visitors can read published/active public data; authenticated admin can edit.
grant usage on schema public to anon, authenticated;

grant select on table public.projects to anon;
grant select, insert, update, delete on table public.projects to authenticated;

grant select on table public.site_content to anon;
grant select, insert, update, delete on table public.site_content to authenticated;

grant select on table public.site_images to anon;
grant select, insert, update, delete on table public.site_images to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- PROJECTS POLICIES
alter table public.projects enable row level security;

drop policy if exists "Temporary admin select projects" on public.projects;
drop policy if exists "Temporary admin insert projects" on public.projects;
drop policy if exists "Temporary admin update projects" on public.projects;
drop policy if exists "Temporary admin delete projects" on public.projects;
drop policy if exists "Public can read published projects" on public.projects;
drop policy if exists "Public can read published projects only" on public.projects;
drop policy if exists "Authenticated admin can read all projects" on public.projects;
drop policy if exists "Authenticated admin can insert projects" on public.projects;
drop policy if exists "Authenticated admin can update projects" on public.projects;
drop policy if exists "Authenticated admin can delete projects" on public.projects;

create policy "Public can read published projects only"
  on public.projects for select
  to anon
  using (is_published = true);

create policy "Authenticated admin can read all projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Authenticated admin can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated admin can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admin can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- SITE CONTENT POLICIES
alter table public.site_content enable row level security;

drop policy if exists "Temporary admin select site content" on public.site_content;
drop policy if exists "Temporary admin insert site content" on public.site_content;
drop policy if exists "Temporary admin update site content" on public.site_content;
drop policy if exists "Temporary admin delete site content" on public.site_content;
drop policy if exists "Public can read active site content" on public.site_content;
drop policy if exists "Public can read active site content only" on public.site_content;
drop policy if exists "Authenticated admin can read all site content" on public.site_content;
drop policy if exists "Authenticated admin can insert site content" on public.site_content;
drop policy if exists "Authenticated admin can update site content" on public.site_content;
drop policy if exists "Authenticated admin can delete site content" on public.site_content;

create policy "Public can read active site content only"
  on public.site_content for select
  to anon
  using (is_active = true);

create policy "Authenticated admin can read all site content"
  on public.site_content for select
  to authenticated
  using (true);

create policy "Authenticated admin can insert site content"
  on public.site_content for insert
  to authenticated
  with check (true);

create policy "Authenticated admin can update site content"
  on public.site_content for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admin can delete site content"
  on public.site_content for delete
  to authenticated
  using (true);

-- SITE IMAGES POLICIES
alter table public.site_images enable row level security;

drop policy if exists "Temporary admin select site images" on public.site_images;
drop policy if exists "Temporary admin insert site images" on public.site_images;
drop policy if exists "Temporary admin update site images" on public.site_images;
drop policy if exists "Temporary admin delete site images" on public.site_images;
drop policy if exists "Public can read active site images" on public.site_images;
drop policy if exists "Public can read active site images only" on public.site_images;
drop policy if exists "Authenticated admin can read all site images" on public.site_images;
drop policy if exists "Authenticated admin can insert site images" on public.site_images;
drop policy if exists "Authenticated admin can update site images" on public.site_images;
drop policy if exists "Authenticated admin can delete site images" on public.site_images;

create policy "Public can read active site images only"
  on public.site_images for select
  to anon
  using (is_active = true);

create policy "Authenticated admin can read all site images"
  on public.site_images for select
  to authenticated
  using (true);

create policy "Authenticated admin can insert site images"
  on public.site_images for insert
  to authenticated
  with check (true);

create policy "Authenticated admin can update site images"
  on public.site_images for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admin can delete site images"
  on public.site_images for delete
  to authenticated
  using (true);

-- STORAGE POLICIES
-- Public can read images. Only authenticated users can upload/update/delete.

drop policy if exists "Temporary admin upload project images" on storage.objects;
drop policy if exists "Temporary admin update project images" on storage.objects;
drop policy if exists "Temporary admin delete project images" on storage.objects;
drop policy if exists "Public can read project images" on storage.objects;
drop policy if exists "Public can read project images only" on storage.objects;
drop policy if exists "Authenticated admin can upload project images" on storage.objects;
drop policy if exists "Authenticated admin can update project images" on storage.objects;
drop policy if exists "Authenticated admin can delete project images" on storage.objects;

create policy "Public can read project images only"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "Authenticated admin can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "Authenticated admin can update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "Authenticated admin can delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Temporary admin upload site images" on storage.objects;
drop policy if exists "Temporary admin update site images" on storage.objects;
drop policy if exists "Temporary admin delete site images" on storage.objects;
drop policy if exists "Public can read site images" on storage.objects;
drop policy if exists "Public can read site images only" on storage.objects;
drop policy if exists "Authenticated admin can upload site images" on storage.objects;
drop policy if exists "Authenticated admin can update site images" on storage.objects;
drop policy if exists "Authenticated admin can delete site images" on storage.objects;

create policy "Public can read site images only"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

create policy "Authenticated admin can upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images');

create policy "Authenticated admin can update site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');

create policy "Authenticated admin can delete site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images');
