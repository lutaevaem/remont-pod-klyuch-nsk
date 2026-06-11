document.addEventListener('DOMContentLoaded', () => {
  const config = window.SUPABASE_CONFIG;
  const projectContainer = document.querySelector('#dynamic-projects');
  const featuredContainer = document.querySelector('#dynamic-featured-project');
  const staticFeatured = document.querySelector('#static-featured-project');
  const staticLocalFeatured = document.querySelector('.local-case-card');
  const staticCards = document.querySelector('#static-project-cards');

  if (staticLocalFeatured) staticLocalFeatured.hidden = true;

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

  function getProjectImages(project) {
    const images = normalizeImages(project.images);
    return [images.cover, images.after, images.before, images.concept, images.process, ...images.extra].filter(Boolean);
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

  function injectFeaturedCarouselStyles() {
    if (document.querySelector('#featured-project-carousel-styles')) return;

    const style = document.createElement('style');
    style.id = 'featured-project-carousel-styles';
    style.textContent = `
      #dynamic-featured-project .local-case-card { margin-top: 24px !important; margin-bottom: 26px !important; }
      .featured-project-carousel {
        position: relative;
        min-height: 420px;
        border-radius: 30px;
        overflow: hidden;
        background: #15130f;
      }
      .featured-project-carousel__slide {
        position: absolute;
        inset: 0;
        opacity: 0;
        animation: featuredProjectFade calc(var(--slide-count, 5) * 4s) infinite;
        animation-delay: calc(var(--slide-index, 0) * 4s);
      }
      .featured-project-carousel__slide:first-child { opacity: 1; }
      .featured-project-carousel__slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.02);
      }
      .featured-project-carousel::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(0deg, rgba(0,0,0,.48), transparent 64%);
        pointer-events: none;
      }
      .featured-project-carousel__label {
        position: absolute;
        left: 20px;
        bottom: 20px;
        z-index: 2;
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        padding: 0 16px;
        border-radius: 999px;
        border: 1px solid rgba(224,187,114,.34);
        background: rgba(14,12,9,.72);
        color: #f7f1e8;
        font-size: 12px;
        font-weight: 800;
        backdrop-filter: blur(12px);
      }
      .featured-project-carousel__thumbs {
        position: absolute;
        right: 18px;
        bottom: 18px;
        z-index: 2;
        display: flex;
        gap: 8px;
      }
      .featured-project-carousel__thumbs span {
        width: 34px;
        height: 5px;
        border-radius: 999px;
        background: rgba(255,250,242,.55);
        box-shadow: 0 0 0 1px rgba(224,187,114,.22);
      }
      @keyframes featuredProjectFade {
        0%, 18% { opacity: 1; }
        24%, 100% { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .featured-project-carousel__slide { animation: none; }
        .featured-project-carousel__slide:not(:first-child) { display: none; }
      }
      @media (max-width: 640px) {
        .featured-project-carousel { min-height: 300px; border-radius: 24px; }
        .featured-project-carousel__thumbs { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderFeaturedProject(project) {
    if (!featuredContainer || !project) return;

    injectFeaturedCarouselStyles();

    const projectUrl = getProjectUrl(project);
    const galleryImages = getProjectImages(project).slice(0, 5);
    const slideCount = Math.max(galleryImages.length, 1);
    const slides = galleryImages.map((image, index) => `
      <a class="featured-project-carousel__slide" href="${escapeHtml(projectUrl)}" style="--slide-index:${index};--slide-count:${slideCount};">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)}">
      </a>
    `).join('');
    const thumbs = galleryImages.map(() => '<span></span>').join('');

    featuredContainer.innerHTML = `
      <div class="container featured-project project-item local-case-card dynamic-featured-case" data-category="${escapeHtml(categoryToFilter(project.category))}">
        <div class="project-gallery editorial-gallery featured-project-carousel">
          ${slides || `<a class="featured-project-carousel__slide" href="${escapeHtml(projectUrl)}" style="--slide-index:0;--slide-count:1;"></a>`}
          <span class="featured-project-carousel__label">${escapeHtml(categoryLabel(project.category))}</span>
          ${thumbs ? `<div class="featured-project-carousel__thumbs" aria-hidden="true">${thumbs}</div>` : ''}
        </div>
        <div class="project-info">
          <p class="eyebrow">Главный кейс</p>
          <h3>${escapeHtml(project.title)}</h3>
          <dl>
            <dt>Стартовая точка</dt>
            <dd>${escapeHtml(project.start_point || '')}</dd>
            <dt>Что взяли на себя</dt>
            <dd>${escapeHtml(project.scope || project.client_task || '')}</dd>
            <dt>Результат</dt>
            <dd>${escapeHtml(project.result || '')}</dd>
          </dl>
          <a class="btn btn-primary" href="${escapeHtml(projectUrl)}">Смотреть полный кейс</a>
        </div>
      </div>
    `;
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

      if (staticFeatured) staticFeatured.hidden = true;
      if (staticLocalFeatured) staticLocalFeatured.hidden = true;
      if (staticCards) staticCards.hidden = true;

      if (featuredContainer) {
        renderFeaturedProject(data[0]);
        renderProjectCards(data.slice(1));
      } else {
        renderProjectCards(data);
      }
    } catch (error) {
      console.error('Projects loading failed:', error);
      if (staticFeatured) staticFeatured.hidden = false;
      if (staticCards) staticCards.hidden = false;
    }
  }

  loadProjects();
});
