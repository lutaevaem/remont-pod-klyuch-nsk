-- SEO settings setup for admin panel.
-- Run in Supabase SQL Editor.

create table if not exists public.site_seo (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  seo_title text,
  seo_description text,
  h1 text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  is_indexed boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_seo enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.site_seo to anon;
grant select, insert, update, delete on table public.site_seo to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Public can read active SEO" on public.site_seo;
create policy "Public can read active SEO"
  on public.site_seo for select
  to anon
  using (is_active = true);

drop policy if exists "Authenticated admin can read all SEO" on public.site_seo;
create policy "Authenticated admin can read all SEO"
  on public.site_seo for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admin can insert SEO" on public.site_seo;
create policy "Authenticated admin can insert SEO"
  on public.site_seo for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admin can update SEO" on public.site_seo;
create policy "Authenticated admin can update SEO"
  on public.site_seo for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin can delete SEO" on public.site_seo;
create policy "Authenticated admin can delete SEO"
  on public.site_seo for delete
  to authenticated
  using (true);

insert into public.site_seo (page_path, seo_title, seo_description, h1, canonical_url, og_title, og_description, sort_order, is_indexed, is_active) values
('/', 'Ремонт, строительство и комплектация под ключ в Новосибирске | Александр Усольцев', 'Комплексное ведение объектов в Новосибирске: строительство, ремонт, отделка, комплектация, мебель, техника и финальная подготовка пространства.', 'Не просто ремонт под ключ. Пространство, доведённое до финала.', 'https://remont-pod-klyuch-nsk.vercel.app/', 'Пространства под ключ в Новосибирске', 'Строительство, ремонт и комплектация объектов до состояния полной готовности.', 10, true, true),
('/projects/', 'Проекты под ключ в Новосибирске | Александр Усольцев', 'Реализованные проекты: строительство, ремонт, комплектация, квартиры, дома и коммерческие помещения под ключ в Новосибирске.', 'Проекты, доведённые до финала', 'https://remont-pod-klyuch-nsk.vercel.app/projects/', 'Проекты, доведённые до финала', 'Кейсы с исходной точкой, задачей, объёмом работ и результатом.', 20, true, true),
('/services/remont-pod-klyuch/', 'Ремонт под ключ в Новосибирске | Александр Усольцев', 'Ремонт под ключ в Новосибирске: квартиры, дома и помещения. От визуальной концепции и сметы до отделки, комплектации и финальной подготовки.', 'Ремонт под ключ — чтобы после работ не оставалось списка «ещё нужно»', 'https://remont-pod-klyuch-nsk.vercel.app/services/remont-pod-klyuch/', 'Ремонт под ключ в Новосибирске', 'Ремонт квартир, домов и помещений с организацией работ, материалов и финальной подготовки.', 30, true, true),
('/services/stroitelstvo-pod-klyuch/', 'Строительство под ключ в Новосибирске | Александр Усольцев', 'Строительство под ключ в Новосибирске и районе: от участка, идеи и первых решений до отделки, комплектации и сдачи готового пространства.', 'Строительство под ключ — чтобы путь от идеи до дома был понятным', 'https://remont-pod-klyuch-nsk.vercel.app/services/stroitelstvo-pod-klyuch/', 'Строительство под ключ в Новосибирске', 'Помогаем пройти путь от участка и идеи до дома, который можно довести до финала.', 40, true, true),
('/services/komplektatsiya-obekta/', 'Комплектация объекта под ключ | Александр Усольцев', 'Комплектация объекта под ключ в Новосибирске: мебель, техника, свет, текстиль, посуда, детали и финальная подготовка пространства.', 'Комплектация объекта — чтобы пространство выглядело завершённым', 'https://remont-pod-klyuch-nsk.vercel.app/services/komplektatsiya-obekta/', 'Комплектация объекта под ключ', 'Мебель, техника, свет, текстиль, детали и финальная подготовка объекта.', 50, true, true),
('/contacts/', 'Контакты | Александр Усольцев', 'Контакты Александра Усольцева: строительство, ремонт и комплектация пространств под ключ в Новосибирске и районе.', 'Расскажите об объекте — подскажем маршрут к готовому пространству', 'https://remont-pod-klyuch-nsk.vercel.app/contacts/', 'Контакты Александра Усольцева', 'Оставьте заявку на предварительный разбор объекта в Новосибирске и Новосибирском районе.', 60, true, true)
on conflict (page_path) do update set
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  h1 = excluded.h1,
  canonical_url = excluded.canonical_url,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  sort_order = excluded.sort_order,
  is_indexed = excluded.is_indexed,
  is_active = excluded.is_active,
  updated_at = now();
