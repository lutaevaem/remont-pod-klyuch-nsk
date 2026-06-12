(() => {
  const root = document.querySelector('#projects-preview .project-grid-premium');
  if (!root) return;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function categoryLabel(category) {
    const map = { apartment: 'Квартира', house: 'Дом', building: 'Строительство', commercial: 'Коммерция', furnishing: 'Комплектация' };
    return map[category] || 'Проект';
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
    return images.cover || images.after || images.before || images.concept || images.process || images.extra[0] || '';
  }

  function getProjectUrl(project) {
    if (project.slug) return `/projects/project/?slug=${encodeURIComponent(project.slug)}`;
    return `/projects/project/?id=${encodeURIComponent(project.id)}`;
  }

  function compactText(value, limit = 150) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).replace(/\s+\S*$/, '')}...`;
  }

  function injectStyles() {
    if (document.querySelector('#home-projects-dynamic-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-projects-dynamic-styles';
    style.textContent = `
      #projects-preview .project-grid-premium.home-projects-dynamic {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      #projects-preview .home-project-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background: #fffaf2;
        border: 1px solid rgba(202,161,90,.24);
      }
      #projects-preview .home-project-card .project-photo {
        position: relative;
        overflow: hidden;
        min-height: 270px;
        height: 270px;
        display: block;
        padding: 0;
        background: linear-gradient(135deg,#211b14,#c8b695);
      }
      #projects-preview .home-project-card .project-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform .35s ease;
      }
      #projects-preview .home-project-card:hover .project-photo img {
        transform: scale(1.035);
      }
      #projects-preview .home-project-card .project-photo span {
        position: absolute;
        left: 18px;
        bottom: 18px;
        display: inline-flex;
        min-height: 36px;
        align-items: center;
        padding: 0 13px;
        border-radius: 999px;
        background: rgba(17,16,14,.76);
        border: 1px solid rgba(224,187,114,.32);
        color: #f7f1e8;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .05em;
      }
      #projects-preview .home-project-card .project-card-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 24px;
      }
      #projects-preview .home-project-card h3 {
        margin: 0 0 10px;
        font-size: 24px;
        line-height: 1.1;
        letter-spacing: -.035em;
      }
      #projects-preview .home-project-card p {
        margin: 0 0 22px;
        color: #625a50;
        line-height: 1.55;
      }
      #projects-preview .home-project-card .home-project-link {
        margin: auto 0 0;
        display: inline-flex;
        width: max-content;
        color: #9d7133;
        font-weight: 900;
      }
      @media (max-width: 640px) {
        #projects-preview .home-project-card .project-photo { height: 230px; min-height: 230px; }
      }
    `;
    document.head.appendChild(style);
  }

  function render(projects) {
    if (!projects.length) return;
    injectStyles();
    root.classList.add('home-projects-dynamic');
    root.innerHTML = projects.slice(0, 3).map((project) => {
      const image = getPreviewImage(project);
      const url = getProjectUrl(project);
      const description = compactText(project.result || project.client_task || project.scope || 'Показываем исходную точку, выполненные работы и результат проекта.');
      return `
        <article class="project-card home-project-card">
          <a class="project-photo" href="${escapeHtml(url)}">
            ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)}" loading="lazy">` : ''}
            <span>${escapeHtml(categoryLabel(project.category))}</span>
          </a>
          <div class="project-card-body">
            <h3><a href="${escapeHtml(url)}">${escapeHtml(project.title)}</a></h3>
            <p>${escapeHtml(description)}</p>
            <a class="home-project-link" href="${escapeHtml(url)}">Смотреть кейс</a>
          </div>
        </article>`;
    }).join('');
  }

  function waitForSupabase(retries = 80) {
    return new Promise((resolve) => {
      const tick = () => {
        if (window.SUPABASE_CONFIG && window.supabase?.createClient) return resolve(true);
        retries -= 1;
        if (retries <= 0) return resolve(false);
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  async function load() {
    const ready = await waitForSupabase();
    if (!ready) return;
    try {
      const client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      if (data?.length) render(data);
    } catch (error) {
      console.warn('Homepage projects loading failed:', error);
    }
  }

  load();
})();
