-- Leads setup for site forms and admin leads page.
-- Run in Supabase SQL Editor.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  object_type text,
  work_format text,
  area_location_comment text,
  page_url text,
  utm jsonb not null default '{}'::jsonb,
  personal_data_consent boolean not null default false,
  marketing_consent boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon;
grant select, insert, update, delete on table public.leads to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Public visitors can only create a lead.
drop policy if exists "Public can create leads" on public.leads;
create policy "Public can create leads"
  on public.leads for insert
  to anon
  with check (true);

-- Authenticated admin can manage leads.
drop policy if exists "Authenticated admin can read leads" on public.leads;
create policy "Authenticated admin can read leads"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admin can insert leads" on public.leads;
create policy "Authenticated admin can insert leads"
  on public.leads for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admin can update leads" on public.leads;
create policy "Authenticated admin can update leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin can delete leads" on public.leads;
create policy "Authenticated admin can delete leads"
  on public.leads for delete
  to authenticated
  using (true);
