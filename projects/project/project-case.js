document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#project-case-root');
  const config = window.SUPABASE_CONFIG;

  const categoryMap = {
    apartment: 'Квартира',
    house: 'Дом',
    building: 'Строительство',
    commercial: 'Коммерция',
    furnishing: 'Комплектация',
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function normalizeImages(images) {
    if (!images) return { cover: null, before: null, concept: null, process: null, after: null, extra: [] };
    if (Array.isArray(images)) {
      return { cover: images[0] || null, before: images[0] || null, concept: images[1] || null, process: images[2] || null, after: images[3] || null, extra: images.slice(4) };
    }
    return {
      cover: images.cover || null,
      before: images.before || null,
      concept: images.concept || null,
      process: images.process || null,
      after: images.after || null,
      extra: Array.isArray(images.extra) ? images.extra : [],
    };
  }

  function getProjectIdentifier() {
    const params = new URLSearchParams(window.location.search);
    return {
      slug: params.get('slug') || params.get('project') || '',
      id: params.get('id') || '',
    };
  }

  function updateMeta(project, cover) {
    const title = `${project.title} | Александр Усольцев`;
    const description = project.result || project.client_task || project.scope || 'Подробная страница проекта с описанием работ и галереей фотографий.';
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = description.slice(0, 220);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = project.title;
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = description.slice(0, 220);
    if (cover) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = cover;
    }
  }

  function imageCard(url, title, caption, wide = false) {
    if (!url) return '';
    return `
      <button class="case-gallery-card${wide ? ' case-gallery-card--wide' : ''}" type="button" data-lightbox-title="${escapeHtml(title)}" data-lightbox-caption="${escapeHtml(caption || title)}">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(title)}" loading="lazy">
        <span class="case-gallery-card__meta"><b>${escapeHtml(title)}</b><small>Открыть фото</small></span>
      </button>`;
  }

  function renderGallery(images) {
    const sections = [
      { title: 'Главные фото', cards: [imageCard(images.cover, 'Обложка проекта', 'Главное фото проекта.', true), imageCard(images.after, 'Результат', 'Финальный вид объекта.'), imageCard(images.before, 'Исходная точка', 'С чего начинался проект.')] },
      { title: 'Процесс и концепция', cards: [imageCard(images.process, 'Процесс работ', 'Рабочий этап проекта.', true), imageCard(images.concept, 'Концепция / дизайн', 'Визуальная или проектная часть.')] },
      { title: 'Дополнительные фото', cards: images.extra.map((url, index) => imageCard(url, `Фото ${index + 1}`, 'Дополнительное фото проекта.', index % 5 === 0)) },
    ];

    return sections.map((section) => {
      const cards = section.cards.filter(Boolean).join('');
      if (!cards) return '';
      return `<div class="case-gallery-section"><div class="case-gallery-section__head"><h2>${escapeHtml(section.title)}</h2></div><div class="case-gallery-grid">${cards}</div></div>`;
    }).join('');
  }

  function renderProject(project) {
    const images = normalizeImages(project.images);
    const cover = images.cover || images.after || images.before || images.process || images.concept || images.extra[0] || '';
    const category = categoryMap[project.category] || 'Проект';
    updateMeta(project, cover);

    root.innerHTML = `
      <section class="hero section-dark case-hero"><div class="hero-bg"></div><div class="container case-hero-grid"><div class="case-hero-copy"><p class="eyebrow">Кейс · ${escapeHtml(category)}</p><h1>${escapeHtml(project.title)}</h1><p class="hero-lead">${escapeHtml(project.client_task || project.result || 'Подробный кейс проекта: исходная ситуация, задача, выполненные работы, результат и фотографии.')}</p>${project.timeline ? `<p class="hero-note">Сроки: ${escapeHtml(project.timeline)}</p>` : ''}<div class="hero-actions"><a class="btn btn-primary" href="/contacts/">Обсудить похожий проект</a><a class="btn btn-secondary" href="/projects/">Вернуться к проектам</a></div></div>${cover ? `<button class="case-hero-visual" type="button" data-lightbox-title="${escapeHtml(project.title)}" data-lightbox-caption="Главное фото проекта."><img src="${escapeHtml(cover)}" alt="${escapeHtml(project.title)}"><span>Открыть фото</span></button>` : ''}</div></section>
      <section class="section soft case-summary"><div class="container case-summary-grid"><article><span>Тип</span><b>${escapeHtml(category)}</b></article><article><span>Площадь</span><b>${escapeHtml(project.area || 'Уточняется')}</b></article><article><span>Локация</span><b>${escapeHtml(project.location || 'Новосибирск и область')}</b></article><article><span>Формат</span><b>Под ключ</b></article></div></section>
      <section class="section"><div class="container section-head wide"><p class="eyebrow">История проекта</p><h2>Как задача превратилась в готовое пространство</h2><p>Эта страница собирается из данных админки: описание, этапы, результат и фотографии можно обновлять без ручной правки кода.</p></div><div class="container case-story-grid"><article class="case-story-card"><h2>С чего начали</h2><p>${escapeHtml(project.start_point || 'Исходная ситуация проекта будет дополнена в админке.')}</p></article><article class="case-story-card"><h2>Задача клиента</h2><p>${escapeHtml(project.client_task || 'Задача клиента будет дополнена в админке.')}</p></article><article class="case-story-card"><h2>Что сделали</h2><p>${escapeHtml(project.scope || 'Состав работ будет дополнен в админке.')}</p></article><article class="case-story-card case-story-card--dark"><h2>Результат</h2><p>${escapeHtml(project.result || 'Результат проекта будет дополнен в админке.')}</p></article></div></section>
      <section class="section section-dark case-gallery-block"><div class="container section-head wide"><p class="eyebrow">Галерея проекта</p><h2>Фотографии проекта</h2><p>Фотографии открываются крупно. Новые изображения можно добавить в админке проекта.</p></div><div class="container case-gallery-wrap">${renderGallery(images) || '<p class="hero-note">Фото пока не загружены. Добавьте изображения в админке проекта.</p>'}</div></section>
      <section class="section soft"><div class="container page-cta-card"><h2>Хотите похожий результат?</h2><p>Расскажите, на каком этапе сейчас объект. Подскажем, какой маршрут будет логичнее: строительство, ремонт, комплектация или полный цикл.</p><a class="btn btn-primary" href="/contacts/">Получить предварительный разбор</a></div></section>
    `;

    if (typeof window.initCaseGallery === 'function') window.initCaseGallery();
  }

  function renderError(message) {
    root.innerHTML = `<section class="hero section-dark case-hero"><div class="hero-bg"></div><div class="container"><p class="eyebrow">Кейс не найден</p><h1>Не удалось открыть проект</h1><p class="hero-lead">${escapeHtml(message)}</p><div class="hero-actions"><a class="btn btn-primary" href="/projects/">Вернуться к проектам</a></div></div></section>`;
  }

  async function loadProject() {
    const { slug, id } = getProjectIdentifier();
    if (!slug && !id) return renderError('В адресе не указан проект. Откройте проект из раздела “Проекты”.');
    if (!config || !window.supabase) return renderError('Supabase не подключился. Обновите страницу через несколько секунд.');

    try {
      const client = window.supabase.createClient(config.url, config.publishableKey);
      let query = client.from('projects').select('*').eq('is_published', true);
      query = id ? query.eq('id', id) : query.eq('slug', slug);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return renderError('Проект не найден или снят с публикации.');
      renderProject(data);
    } catch (error) {
      console.error('Project case loading failed:', error);
      renderError(`Ошибка загрузки проекта: ${error.message}`);
    }
  }

  loadProject();
});
