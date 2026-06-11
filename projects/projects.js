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

  function compactText(value, limit = 260) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).replace(/\s+\S*$/, '')}...`;
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
      #dynamic-featured-project .dynamic-featured-case {
        position: relative;
        overflow: hidden;
        margin-top: 18px !important;
        margin-bottom: 30px !important;
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(360px, .78fr);
        gap: 30px;
        align-items: stretch;
        padding: 30px;
        border-radius: 38px;
        border: 1px solid rgba(202,161,90,.30);
        background:
          radial-gradient(circle at 18% 8%, rgba(224,187,114,.14), transparent 32%),
          linear-gradient(135deg, #15130f 0%, #211b14 58%, #10100e 100%);
        color: #f7f3ea;
        box-shadow: 0 30px 90px rgba(17,16,14,.28);
      }
      #dynamic-featured-project .dynamic-featured-case::before {
        content: "";
        position: absolute;
        inset: 1px;
        border-radius: 37px;
        pointer-events: none;
        background: linear-gradient(135deg, rgba(255,255,255,.08), transparent 40%, rgba(224,187,114,.08));
        opacity: .72;
      }
      #dynamic-featured-project .dynamic-featured-media,
      #dynamic-featured-project .dynamic-featured-content {
        position: relative;
        z-index: 1;
      }
      #dynamic-featured-project .dynamic-featured-media {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 108px;
        gap: 12px;
        min-height: 430px;
      }
      #dynamic-featured-project .featured-project-carousel {
        position: relative;
        min-height: 430px;
        border-radius: 28px;
        overflow: hidden;
        background: #0f0d0a;
        box-shadow: inset 0 0 0 1px rgba(224,187,114,.18), 0 24px 54px rgba(0,0,0,.34);
      }
      #dynamic-featured-project .featured-project-carousel__slide {
        position: absolute;
        inset: 0;
        opacity: 0;
        animation: featuredProjectFade calc(var(--slide-count, 5) * 4s) infinite;
        animation-delay: calc(var(--slide-index, 0) * 4s);
      }
      #dynamic-featured-project .featured-project-carousel__slide:first-child { opacity: 1; }
      #dynamic-featured-project .featured-project-carousel__slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.015);
      }
      #dynamic-featured-project .featured-project-carousel::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(0deg, rgba(0,0,0,.52), transparent 58%);
        pointer-events: none;
      }
      #dynamic-featured-project .featured-project-carousel__label {
        position: absolute;
        left: 18px;
        bottom: 18px;
        z-index: 2;
        display: inline-flex;
        min-height: 38px;
        align-items: center;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid rgba(224,187,114,.36);
        background: rgba(14,12,9,.72);
        color: #f7f1e8;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .07em;
        backdrop-filter: blur(12px);
      }
      #dynamic-featured-project .featured-project-thumbs {
        display: grid;
        gap: 10px;
      }
      #dynamic-featured-project .featured-project-thumb {
        position: relative;
        display: block;
        min-height: 0;
        height: 78px;
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid rgba(224,187,114,.26);
        background: rgba(255,255,255,.06);
        box-shadow: 0 12px 26px rgba(0,0,0,.18);
      }
      #dynamic-featured-project .featured-project-thumb:first-child {
        height: 112px;
        border-color: rgba(224,187,114,.54);
      }
      #dynamic-featured-project .featured-project-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        opacity: .88;
        transition: transform .25s ease, opacity .25s ease;
      }
      #dynamic-featured-project .featured-project-thumb:hover img {
        transform: scale(1.04);
        opacity: 1;
      }
      #dynamic-featured-project .dynamic-featured-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 24px 24px 24px 8px;
      }
      #dynamic-featured-project .dynamic-featured-content .eyebrow {
        width: max-content;
        max-width: 100%;
        margin-bottom: 16px;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(224,187,114,.10);
        border: 1px solid rgba(224,187,114,.22);
        color: #e0bb72;
      }
      #dynamic-featured-project .dynamic-featured-content h3 {
        margin: 0 0 16px;
        font-size: clamp(32px, 3.1vw, 50px);
        line-height: .98;
        letter-spacing: -.055em;
        color: #fffaf2;
      }
      #dynamic-featured-project .dynamic-featured-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0 0 18px;
      }
      #dynamic-featured-project .dynamic-featured-meta span {
        display: inline-flex;
        min-height: 32px;
        align-items: center;
        padding: 0 11px;
        border-radius: 999px;
        border: 1px solid rgba(224,187,114,.26);
        background: rgba(255,255,255,.055);
        color: #ead2a2;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      #dynamic-featured-project .dynamic-featured-content p:not(.eyebrow) {
        margin: 0 0 26px;
        color: #d5cbbd;
        font-size: 17px;
        line-height: 1.62;
        max-width: 560px;
      }
      #dynamic-featured-project .dynamic-featured-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      #dynamic-featured-project .dynamic-featured-actions .btn-secondary {
        min-height: 54px;
        border-color: rgba(224,187,114,.28);
        color: #f7f1e8;
        background: rgba(255,255,255,.045);
      }
      @keyframes featuredProjectFade {
        0%, 18% { opacity: 1; }
        24%, 100% { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        #dynamic-featured-project .featured-project-carousel__slide { animation: none; }
        #dynamic-featured-project .featured-project-carousel__slide:not(:first-child) { display: none; }
      }
      @media (max-width: 980px) {
        #dynamic-featured-project .dynamic-featured-case {
          grid-template-columns: 1fr;
          padding: 22px;
          gap: 20px;
        }
        #dynamic-featured-project .dynamic-featured-content { padding: 4px 2px 4px; }
      }
      @media (max-width: 640px) {
        #dynamic-featured-project .dynamic-featured-case {
          width: min(100% - 28px, 1180px);
          border-radius: 30px;
          padding: 16px;
        }
        #dynamic-featured-project .dynamic-featured-case::before { border-radius: 29px; }
        #dynamic-featured-project .dynamic-featured-media {
          grid-template-columns: 1fr;
          min-height: 0;
        }
        #dynamic-featured-project .featured-project-carousel {
          min-height: 300px;
          border-radius: 24px;
        }
        #dynamic-featured-project .featured-project-thumbs {
          grid-template-columns: repeat(5, 1fr);
          gap: 7px;
        }
        #dynamic-featured-project .featured-project-thumb,
        #dynamic-featured-project .featured-project-thumb:first-child {
          height: 56px;
          border-radius: 14px;
        }
        #dynamic-featured-project .dynamic-featured-content h3 {
          font-size: 30px;
          line-height: 1.03;
        }
        #dynamic-featured-project .dynamic-featured-content p:not(.eyebrow) {
          font-size: 15px;
          line-height: 1.58;
        }
        #dynamic-featured-project .dynamic-featured-actions .btn,
        #dynamic-featured-project .dynamic-featured-actions .btn-secondary {
          width: 100%;
        }
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
    const thumbs = galleryImages.map((image, index) => `
      <a class="featured-project-thumb" href="${escapeHtml(projectUrl)}" aria-label="Открыть фото ${index + 1} проекта ${escapeHtml(project.title)}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} — фото ${index + 1}">
      </a>
    `).join('');

    featuredContainer.innerHTML = `
      <div class="container dynamic-featured-case project-item" data-category="${escapeHtml(categoryToFilter(project.category))}">
        <div class="dynamic-featured-media">
          <div class="featured-project-carousel">
            ${slides || `<a class="featured-project-carousel__slide" href="${escapeHtml(projectUrl)}" style="--slide-index:0;--slide-count:1;"></a>`}
            <span class="featured-project-carousel__label">${escapeHtml(categoryLabel(project.category))}</span>
          </div>
          ${thumbs ? `<div class="featured-project-thumbs" aria-label="Миниатюры главного кейса">${thumbs}</div>` : ''}
        </div>
        <div class="dynamic-featured-content">
          <p class="eyebrow">Главный кейс</p>
          <h3>${escapeHtml(project.title)}</h3>
          <div class="dynamic-featured-meta">
            <span>${escapeHtml(categoryLabel(project.category))}</span>
            ${project.location ? `<span>${escapeHtml(project.location)}</span>` : ''}
            <span>${galleryImages.length} фото</span>
          </div>
          <p>${escapeHtml(compactText(project.result || project.client_task || project.scope))}</p>
          <div class="dynamic-featured-actions">
            <a class="btn btn-primary" href="${escapeHtml(projectUrl)}">Смотреть полный кейс</a>
            <a class="btn btn-secondary" href="/contacts/">Обсудить похожий объект</a>
          </div>
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
