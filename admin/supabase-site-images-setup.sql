-- Site images setup for admin image slots.
-- Run in Supabase SQL Editor.

create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  page_label text not null,
  image_key text not null unique,
  label text not null,
  description text,
  recommended_size text,
  crop_hint text,
  image_url text,
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_images enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.site_images to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

drop policy if exists "Public can read active site images" on public.site_images;
create policy "Public can read active site images"
  on public.site_images for select
  using (is_active = true);

-- Temporary admin MVP policies. Replace with authenticated admin-only policies later.
drop policy if exists "Temporary admin select site images" on public.site_images;
create policy "Temporary admin select site images"
  on public.site_images for select
  using (true);

drop policy if exists "Temporary admin insert site images" on public.site_images;
create policy "Temporary admin insert site images"
  on public.site_images for insert
  with check (true);

drop policy if exists "Temporary admin update site images" on public.site_images;
create policy "Temporary admin update site images"
  on public.site_images for update
  using (true)
  with check (true);

drop policy if exists "Temporary admin delete site images" on public.site_images;
create policy "Temporary admin delete site images"
  on public.site_images for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read site images" on storage.objects;
create policy "Public can read site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "Temporary admin upload site images" on storage.objects;
create policy "Temporary admin upload site images"
  on storage.objects for insert
  with check (bucket_id = 'site-images');

drop policy if exists "Temporary admin update site images" on storage.objects;
create policy "Temporary admin update site images"
  on storage.objects for update
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');

drop policy if exists "Temporary admin delete site images" on storage.objects;
create policy "Temporary admin delete site images"
  on storage.objects for delete
  using (bucket_id = 'site-images');

insert into public.site_images (page, page_label, image_key, label, description, recommended_size, crop_hint, sort_order, is_active) values
('home','Главная','home.hero.alexander','Главная: фото Александра в первом экране','Вертикальное портретное фото в правом блоке первого экрана. Используется для доверия и личной ответственности.','1200 × 1600 px','Вертикальный портрет 3:4. Лицо и корпус держать по центру, не обрезать голову и плечи. Фон спокойный, премиальный, без лишнего шума.',10,true),
('home','Главная','home.about.alexander','Главная: фото Александра в блоке “Кто отвечает за проект”','Крупное фото для блока личной ответственности ниже по странице.','1400 × 1200 px','Горизонтальное или почти квадратное фото. Александр должен занимать центральную часть кадра, важные детали не ближе 120 px к краям.',20,true),
('home','Главная','home.projects.preview1','Главная: превью проекта “Дом с нуля”','Картинка для карточки проекта на главной странице.','1200 × 900 px','Горизонтальный кадр 4:3. Важный объект по центру, без мелкого текста. Лучше экстерьер/дом/архитектура.',30,true),
('home','Главная','home.projects.preview2','Главная: превью проекта “Квартира под сдачу”','Картинка для карточки проекта на главной странице.','1200 × 900 px','Горизонтальный интерьерный кадр 4:3. Главный визуальный акцент в центре, без сильного захламления.',40,true),
('home','Главная','home.projects.preview3','Главная: превью проекта “Коммерция”','Картинка для карточки коммерческого проекта на главной странице.','1200 × 900 px','Горизонтальный кадр 4:3. Подойдёт интерьер коммерческого помещения, офис, студия, салон, входная зона.',50,true),
('renovation','Ремонт','renovation.visual.main','Ремонт: изображение в мраморном визуальном блоке','Фоновая/визуальная вставка для блока “Порядок вместо хаоса ремонта”.','1800 × 700 px','Широкий баннер. Важные детали держать в левой и центральной части, справа можно оставить мягкий фон под градиент.',100,true),
('construction','Строительство','construction.visual.main','Строительство: изображение в мраморном визуальном блоке','Фоновая/визуальная вставка для блока про путь от участка к дому.','1800 × 700 px','Широкий баннер. Подойдёт архитектура, участок, дом, стройка без визуального хаоса. Важные детали не у краёв.',110,true),
('furnishing','Комплектация','furnishing.visual.main','Комплектация: изображение в мраморном визуальном блоке','Фоновая/визуальная вставка для блока про детали и финальное ощущение.','1800 × 700 px','Широкий баннер. Подойдут мебель, детали, свет, текстиль. Важные объекты держать в центре или правой трети.',120,true),
('contacts','Контакты','contacts.hero.background','Контакты: изображение или фон первого экрана','Опциональная фоновая картинка для первого экрана контактов.','1920 × 900 px','Широкий hero-кадр. Без мелкого текста. Важные детали не ближе 160 px к краям, чтобы не конфликтовали с заголовком.',200,true),
('global','Общее','global.logo.symbol','Общее: знак/логотип АУ','Опциональное изображение логотипа, если вместо текстового знака потребуется использовать картинку.','512 × 512 px','Квадратный PNG/SVG/WebP. Логотип должен быть по центру с внутренними полями 15–20%.',300,true)
on conflict (image_key) do update set
  page = excluded.page,
  page_label = excluded.page_label,
  label = excluded.label,
  description = excluded.description,
  recommended_size = excluded.recommended_size,
  crop_hint = excluded.crop_hint,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();
