-- Supabase setup for remont-pod-klyuch-nsk admin
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  category text not null default 'apartment',
  area text,
  location text,
  timeline text,
  start_point text,
  client_task text,
  scope text,
  result text,
  review text,
  images jsonb not null default '[]'::jsonb,
  sort_order int not null default 100,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Public site can read only published projects.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select
  using (is_published = true);

-- Temporary admin MVP policies.
-- IMPORTANT: These allow project editing from the public publishable key.
-- Keep only while testing MVP. Later replace with authenticated admin-only policies.
drop policy if exists "Temporary admin insert projects" on public.projects;
create policy "Temporary admin insert projects"
  on public.projects for insert
  with check (true);

drop policy if exists "Temporary admin update projects" on public.projects;
create policy "Temporary admin update projects"
  on public.projects for update
  using (true)
  with check (true);

drop policy if exists "Temporary admin delete projects" on public.projects;
create policy "Temporary admin delete projects"
  on public.projects for delete
  using (true);

-- Storage bucket for project images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Public can read project images.
drop policy if exists "Public can read project images" on storage.objects;
create policy "Public can read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

-- Temporary upload policy for MVP admin.
-- IMPORTANT: Later replace with authenticated admin-only policy.
drop policy if exists "Temporary admin upload project images" on storage.objects;
create policy "Temporary admin upload project images"
  on storage.objects for insert
  with check (bucket_id = 'project-images');

drop policy if exists "Temporary admin update project images" on storage.objects;
create policy "Temporary admin update project images"
  on storage.objects for update
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

drop policy if exists "Temporary admin delete project images" on storage.objects;
create policy "Temporary admin delete project images"
  on storage.objects for delete
  using (bucket_id = 'project-images');
