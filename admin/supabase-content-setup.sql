-- Site content setup for admin text editor.
-- Run in Supabase SQL Editor.

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  content_key text not null unique,
  label text not null,
  field_type text not null default 'textarea',
  value text not null,
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.site_content to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Public can read active site content" on public.site_content;
create policy "Public can read active site content"
  on public.site_content for select
  using (is_active = true);

-- Temporary admin MVP policies. Replace with authenticated admin-only policies later.
drop policy if exists "Temporary admin select site content" on public.site_content;
create policy "Temporary admin select site content"
  on public.site_content for select
  using (true);

drop policy if exists "Temporary admin insert site content" on public.site_content;
create policy "Temporary admin insert site content"
  on public.site_content for insert
  with check (true);

drop policy if exists "Temporary admin update site content" on public.site_content;
create policy "Temporary admin update site content"
  on public.site_content for update
  using (true)
  with check (true);

drop policy if exists "Temporary admin delete site content" on public.site_content;
create policy "Temporary admin delete site content"
  on public.site_content for delete
  using (true);

insert into public.site_content (page, content_key, label, field_type, value, sort_order, is_active) values
('projects','projects.hero.kicker','Проекты — надзаголовок hero','text','Портфолио',10,true),
('projects','projects.hero.title','Проекты — заголовок hero','textarea','Проекты, доведённые до финала',20,true),
('projects','projects.hero.lead','Проекты — подзаголовок hero','textarea','Показываем путь от исходного состояния до пространства, в котором всё собрано: ремонт, отделка, материалы, мебель, техника, детали и финальная подготовка — в том объёме, который был нужен клиенту.',30,true),
('projects','projects.hero.note','Проекты — акцент hero','textarea','Здесь видно не только результат, но и подход: как задача превращается в понятный маршрут и завершённое пространство.',40,true),
('projects','projects.filters.kicker','Проекты — надзаголовок фильтров','text','Выберите тип проекта',50,true),
('projects','projects.filters.title','Проекты — заголовок фильтров','textarea','Посмотрите объекты, близкие к вашей задаче',60,true),
('projects','projects.filters.text','Проекты — текст фильтров','textarea','Можно выбрать строительство, квартиру, дом, коммерческое помещение или комплектацию. Так проще понять, какой маршрут может подойти вашему объекту.',70,true),
('projects','projects.cta.title','Проекты — CTA заголовок','textarea','Есть объект, который нужно довести до финала?',80,true),
('projects','projects.cta.text','Проекты — CTA текст','textarea','Напишите, на каком этапе сейчас проект: участок, черновая отделка, ремонт, коробка, комплектация или коммерческое помещение. Подскажем, какой маршрут выбрать.',90,true),
('projects','projects.cta.button','Проекты — CTA кнопка','text','Получить предварительный разбор',100,true)
on conflict (content_key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  value = excluded.value,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();
