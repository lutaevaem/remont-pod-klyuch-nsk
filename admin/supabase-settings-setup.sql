-- Global site settings setup.
-- Run in Supabase SQL Editor.

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  label text not null,
  value text,
  group_label text not null default 'Общее',
  description text,
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.site_settings to anon;
grant select, insert, update, delete on table public.site_settings to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Public can read active site settings" on public.site_settings;
create policy "Public can read active site settings"
  on public.site_settings for select
  to anon
  using (is_active = true);

drop policy if exists "Authenticated admin can read all site settings" on public.site_settings;
create policy "Authenticated admin can read all site settings"
  on public.site_settings for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admin can insert site settings" on public.site_settings;
create policy "Authenticated admin can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admin can update site settings" on public.site_settings;
create policy "Authenticated admin can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admin can delete site settings" on public.site_settings;
create policy "Authenticated admin can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (true);

insert into public.site_settings (setting_key, label, value, group_label, description, sort_order, is_active) values
('brand_name', 'Название бренда в шапке', 'Александр Усольцев', 'Бренд', 'Основное имя/бренд в логотипе сайта.', 10, true),
('brand_subtitle', 'Подпись под брендом', 'пространства под ключ', 'Бренд', 'Короткая подпись под именем в шапке и футере.', 20, true),
('region', 'Регион работы', 'Новосибирск и Новосибирский район', 'География', 'Используется в текстах и локальном позиционировании.', 30, true),
('phone_display', 'Телефон для сайта', '+7 (913) 799-88-08', 'Контакты', 'Отображается в шапке, футере и CTA. Ссылка tel формируется автоматически.', 40, true),
('telegram_url', 'Ссылка Telegram', 'https://t.me/UsoltcevAG', 'Контакты', 'Ссылка для кнопок Telegram.', 50, true),
('whatsapp_url', 'Ссылка WhatsApp', 'https://wa.me/79137998808', 'Контакты', 'Ссылка для кнопок WhatsApp.', 60, true),
('email', 'Email', 'i@usoltsev-top.ru', 'Контакты', 'Почта для футера и служебных обращений.', 70, true),
('site_url', 'Основной адрес сайта', 'https://remont-pod-klyuch-nsk.vercel.app', 'Служебное', 'Используется для canonical, ссылок и интеграций.', 80, true),
('legal_name', 'Юридическое название', 'УСОЛЬЦЕВ АЛЕКСАНДР ГЕННАДЬЕВИЧ (ИП)', 'Реквизиты', 'Юридическое наименование для документов и реквизитов.', 90, true),
('inn', 'ИНН', '540233113084', 'Реквизиты', 'ИНН для юридического блока.', 100, true)
on conflict (setting_key) do update set
  label = excluded.label,
  value = excluded.value,
  group_label = excluded.group_label,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();
