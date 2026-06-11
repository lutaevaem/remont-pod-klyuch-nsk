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

  function getPreviewImage(project) {
    const images = normalizeImages(project.images);
    return images.cover || images.after || images.before || images.concept || images.process || images.extra[0];
  }

  function getProjectUrl(project) {
    return `/projects/project/?slug=${encodeURIComponent(project.slug || project.id)}`;
  }

  function getDescription(project) {
    return project.result || project.client_task || project.scope || 'Проект добавлен в портфолио. Описание можно дополнить в админке.';
  }

  function renderProjectCards(projects) {
    if (!projectContainer) return;
    projectContainer.innerHTML = projects.map((project) => {
      const preview = getPreviewImage(project);
      const projectUrl = getProjectUrl(project);
      return `
        <article class="project-card project-item unified-project-card" data-category="${escapeHtml(categoryToFilter(project.category))}">
          ${preview ? `<a class="project-photo has-image" href="${escapeHtml(projectUrl)}"><img src="${escapeHtml(preview)}" alt="${escapeHtml(project.title)}"><span>${escapeHtml(categoryLabel(project.category))}</span></a>` : `<a class="project-photo" href="${escapeHtml(projectUrl)}"><span>${escapeHtml(categoryLabel(project.category))}</span></a>`}
          <div class="project-card-body">
            <div class="project-card-meta">
              <span>${escapeHtml(categoryLabel(project.category))}</span>
              ${project.area ? `<span>${escapeHtml(project.area)}</span>` : ''}
              ${project.location ? `<span>${escapeHtml(project.location)}</span>` : ''}
            </div>
            <h3><a href="${escapeHtml(projectUrl)}">${escapeHtml(project.title)}</a></h3>
            <p>${escapeHtml(getDescription(project))}</p>
            <a href="${escapeHtml(projectUrl)}">Смотреть кейс</a>
          </div>
        </article>
      `;
    }).join('');
  }

  async function loadProjects() {
    if (!config || !window.supabase || !projectContainer) {
      console.warn('Projects: Supabase config or container is missing');
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

      if (featuredContainer) featuredContainer.innerHTML = '';
      if (staticFeatured) staticFeatured.hidden = true;
      if (staticCards) staticCards.hidden = true;
      renderProjectCards(data);
    } catch (error) {
      console.error('Projects loading failed:', error);
      if (staticFeatured) staticFeatured.hidden = false;
      if (staticCards) staticCards.hidden = false;
    }
  }

  loadProjects();
});
