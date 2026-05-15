document.addEventListener('DOMContentLoaded', () => {
  const config = window.SUPABASE_CONFIG;
  const projectContainer = document.querySelector('#dynamic-projects');
  const featuredContainer = document.querySelector('#dynamic-featured-project');
  const staticFeatured = document.querySelector('#static-featured-project');
  const staticCards = document.querySelector('#static-project-cards');

  function categoryToFilter(category) {
    const map = { apartment: 'apartment', house: 'house', building: 'building house', commercial: 'commercial', furnishing: 'furnishing' };
    return map[category] || category || 'apartment';
  }

  function categoryLabel(category) {
    const map = { apartment: 'Квартира', house: 'Дом', building: 'Строительство', commercial: 'Коммерция', furnishing: 'Комплектация' };
    return map[category] || 'Проект';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function getProjectImages(project) {
    return Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  }

  function imageBlock(src, label) {
    if (src) return `<div class="project-photo has-image"><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}"><span>${escapeHtml(label)}</span></div>`;
    return `<div class="project-photo"><span>${escapeHtml(label)}</span></div>`;
  }

  function renderFeatured(project) {
    const images = getProjectImages(project);
    featuredContainer.innerHTML = `
      <div class="container featured-project project-item" data-category="${escapeHtml(categoryToFilter(project.category))}">
        <div class="project-gallery editorial-gallery">
          ${imageBlock(images[0], 'До')}
          ${imageBlock(images[1], 'Концепция')}
          ${imageBlock(images[2], 'Процесс')}
          ${imageBlock(images[3], 'После')}
        </div>
        <div class="project-info">
          <p class="eyebrow">${escapeHtml(categoryLabel(project.category))}</p>
          <h3>${escapeHtml(project.title)}</h3>
          <dl>
            <dt>Стартовая точка</dt><dd>${escapeHtml(project.start_point || 'Опишем после уточнения проекта.')}</dd>
            <dt>Задача</dt><dd>${escapeHtml(project.client_task || 'Задача клиента будет добавлена в описание проекта.')}</dd>
            <dt>Что взяли на себя</dt><dd>${escapeHtml(project.scope || 'Работы, материалы, организацию и контроль этапов.')}</dd>
            <dt>Результат</dt><dd>${escapeHtml(project.result || 'Пространство доведено до согласованного результата.')}</dd>
          </dl>
          <a class="btn btn-primary" href="/contacts/">Обсудить похожий проект</a>
        </div>
      </div>
    `;
  }

  function renderProjectCards(projects) {
    if (!projectContainer) return;
    projectContainer.innerHTML = projects.map((project) => {
      const images = getProjectImages(project);
      const preview = images[0];
      return `
        <article class="project-card project-item" data-category="${escapeHtml(categoryToFilter(project.category))}">
          ${preview ? `<div class="project-photo has-image"><img src="${escapeHtml(preview)}" alt="${escapeHtml(project.title)}"></div>` : `<div class="project-photo"><span>${escapeHtml(categoryLabel(project.category))}</span></div>`}
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.result || project.client_task || project.scope || 'Проект добавлен в портфолио. Описание можно дополнить в админке.')}</p>
          <a href="/contacts/">Обсудить похожий маршрут</a>
        </article>
      `;
    }).join('');
  }

  async function loadProjects() {
    if (!config || !window.supabase || !projectContainer || !featuredContainer) {
      console.warn('Projects: Supabase config or containers are missing');
      return;
    }

    try {
      const client = window.supabase.createClient(config.url, config.publishableKey);
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || !data.length) {
        if (staticFeatured) staticFeatured.hidden = false;
        if (staticCards) staticCards.hidden = false;
        return;
      }

      if (staticFeatured) staticFeatured.hidden = true;
      if (staticCards) staticCards.hidden = true;
      renderFeatured(data[0]);
      renderProjectCards(data.slice(1));
    } catch (error) {
      console.error('Projects loading failed:', error);
      if (staticFeatured) staticFeatured.hidden = false;
      if (staticCards) staticCards.hidden = false;
    }
  }

  loadProjects();
});
