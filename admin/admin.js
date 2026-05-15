document.addEventListener('DOMContentLoaded', () => {
  const statusNode = document.querySelector('#admin-status');
  const projectForm = document.querySelector('#project-form');
  const projectList = document.querySelector('#project-list');
  const resetButton = document.querySelector('#reset-project-form');
  const refreshButton = document.querySelector('#refresh-projects');
  const formTitle = document.querySelector('#project-form-title');
  const settingsUrl = document.querySelector('#settings-url');
  const existingImagesNode = document.querySelector('#existing-images');
  let projectsCache = [];
  let supabaseClient = null;
  let currentProject = null;
  let hasLoadedProjects = false;

  const photoFields = [
    ['cover', 'Обложка'],
    ['before', 'До'],
    ['concept', 'Концепция'],
    ['process', 'Процесс'],
    ['after', 'После'],
  ];

  function setStatus(message, type = '') {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = `admin-status ${type}`.trim();
  }

  function setActiveView(view) {
    document.querySelectorAll('.admin-nav button').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
    document.querySelectorAll('.admin-view').forEach((section) => section.classList.remove('active'));
    const target = document.querySelector(`#view-${view}`);
    if (target) target.classList.add('active');
  }

  document.querySelectorAll('.admin-nav button').forEach((button) => {
    button.addEventListener('click', () => setActiveView(button.dataset.view));
  });

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/ё/g, 'e')
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function getCategoryLabel(category) {
    const labels = { apartment: 'Квартира', house: 'Дом', building: 'Строительство', commercial: 'Коммерция', furnishing: 'Комплектация' };
    return labels[category] || category || 'Проект';
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

  function initSupabase() {
    const config = window.SUPABASE_CONFIG;

    if (!config || !config.url || !config.publishableKey) {
      setStatus('Не найден файл настроек Supabase: /admin/supabase-config.js', 'error');
      return false;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      setStatus('Не загрузилась библиотека Supabase. Проверь интернет/блокировщики и обнови страницу.', 'error');
      return false;
    }

    if (settingsUrl) settingsUrl.textContent = config.url;
    if (!window.adminSupabaseClient) {
      window.adminSupabaseClient = window.supabase.createClient(config.url, config.publishableKey);
    }
    supabaseClient = window.adminSupabaseClient;
    return true;
  }

  async function uploadOne(projectId, file, type) {
    const bucket = window.SUPABASE_CONFIG.bucket || 'project-images';
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const safeName = `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
    const path = `${projectId}/${safeName}`;
    const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadStructuredImages(projectId, currentImages) {
    const images = normalizeImages(currentImages);

    for (const [key] of photoFields) {
      const file = projectForm.elements[`photo_${key}`]?.files?.[0];
      if (file) images[key] = await uploadOne(projectId, file, key);
    }

    const extraFiles = Array.from(projectForm.elements.photo_extra?.files || []);
    if (extraFiles.length) {
      for (const file of extraFiles) images.extra.push(await uploadOne(projectId, file, 'extra'));
    }

    return images;
  }

  function renderExistingImages(project) {
    if (!existingImagesNode) return;
    const images = normalizeImages(project?.images);
    const cards = [];

    photoFields.forEach(([key, label]) => {
      if (images[key]) cards.push(`<div class="existing-image-card"><img src="${escapeHtml(images[key])}" alt="${escapeHtml(label)}"><span>${escapeHtml(label)}</span><button type="button" data-remove-photo="${key}">Удалить</button></div>`);
    });

    images.extra.forEach((url, index) => {
      cards.push(`<div class="existing-image-card"><img src="${escapeHtml(url)}" alt="Дополнительное фото"><span>Доп. фото ${index + 1}</span><button type="button" data-remove-photo="extra:${index}">Удалить</button></div>`);
    });

    existingImagesNode.innerHTML = cards.length
      ? `<p class="existing-images-title">Загруженные фото</p><div class="existing-image-grid">${cards.join('')}</div>`
      : '';
  }

  function fillForm(project) {
    if (!projectForm || !formTitle) return;
    currentProject = project;
    formTitle.textContent = 'Редактировать проект';
    Object.entries(project).forEach(([key, value]) => {
      const field = projectForm.elements[key];
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else if (key !== 'images') field.value = value ?? '';
    });
    renderExistingImages(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    if (!projectForm || !formTitle) return;
    currentProject = null;
    formTitle.textContent = 'Добавить проект';
    projectForm.reset();
    if (projectForm.elements.id) projectForm.elements.id.value = '';
    if (projectForm.elements.sort_order) projectForm.elements.sort_order.value = 100;
    if (projectForm.elements.is_published) projectForm.elements.is_published.checked = true;
    renderExistingImages(null);
  }

  function renderProjects() {
    if (!projectList) return;

    if (!projectsCache.length) {
      projectList.innerHTML = '<p>Проектов пока нет. Добавьте первый проект через форму слева.</p>';
      return;
    }

    projectList.innerHTML = projectsCache.map((project) => `
      <article class="project-admin-item">
        <div class="project-admin-meta">
          <span>${escapeHtml(getCategoryLabel(project.category))}</span>
          ${project.area ? `<span>${escapeHtml(project.area)}</span>` : ''}
          ${project.location ? `<span>${escapeHtml(project.location)}</span>` : ''}
          <span>${project.is_published ? 'Опубликован' : 'Черновик'}</span>
        </div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.client_task || project.result || 'Описание пока не заполнено.')}</p>
        <div class="project-admin-actions">
          <button type="button" data-action="edit" data-id="${project.id}">Редактировать</button>
          <button type="button" data-action="toggle" data-id="${project.id}">${project.is_published ? 'Снять с публикации' : 'Опубликовать'}</button>
          <button type="button" class="danger" data-action="delete" data-id="${project.id}">Удалить</button>
        </div>
      </article>
    `).join('');
  }

  async function fetchProjects() {
    if (!supabaseClient) return;
    setStatus('Загружаем проекты из Supabase...');

    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Не удалось загрузить проекты. Проверь таблицу projects и политики доступа. Ошибка: ${error.message}`, 'error');
      if (projectList) projectList.innerHTML = '<p>Пока не удалось получить проекты из базы.</p>';
      return;
    }

    projectsCache = data || [];
    renderProjects();
    hasLoadedProjects = true;
    setStatus(`Подключение работает. Проектов в базе: ${projectsCache.length}.`, 'success');
  }

  async function saveProject(event) {
    event.preventDefault();
    if (!supabaseClient || !projectForm) return setStatus('Supabase не подключён. Обнови страницу и проверь настройки.', 'error');

    const formData = new FormData(projectForm);
    const id = formData.get('id');

    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      area: formData.get('area') || null,
      location: formData.get('location') || null,
      timeline: formData.get('timeline') || null,
      start_point: formData.get('start_point') || null,
      client_task: formData.get('client_task') || null,
      scope: formData.get('scope') || null,
      result: formData.get('result') || null,
      review: formData.get('review') || null,
      sort_order: Number(formData.get('sort_order') || 100),
      is_published: formData.get('is_published') === 'on',
      slug: slugify(formData.get('title')),
      updated_at: new Date().toISOString(),
    };

    setStatus('Сохраняем проект...');

    let saved;
    if (id) {
      const { data, error } = await supabaseClient.from('projects').update(payload).eq('id', id).select().single();
      if (error) return setStatus(`Ошибка сохранения: ${error.message}`, 'error');
      saved = data;
    } else {
      const { data, error } = await supabaseClient.from('projects').insert(payload).select().single();
      if (error) return setStatus(`Ошибка создания: ${error.message}`, 'error');
      saved = data;
    }

    try {
      const nextImages = await uploadStructuredImages(saved.id, saved.images);
      const { error } = await supabaseClient.from('projects').update({ images: nextImages, updated_at: new Date().toISOString() }).eq('id', saved.id);
      if (error) throw error;
    } catch (error) {
      return setStatus(`Проект сохранён, но фото не загрузились: ${error.message}`, 'error');
    }

    resetForm();
    await fetchProjects();
    setStatus('Проект сохранён.', 'success');
  }

  async function removePhoto(removeKey) {
    if (!currentProject) return;
    const images = normalizeImages(currentProject.images);
    if (removeKey.startsWith('extra:')) images.extra.splice(Number(removeKey.split(':')[1]), 1);
    else images[removeKey] = null;

    const { error } = await supabaseClient.from('projects').update({ images, updated_at: new Date().toISOString() }).eq('id', currentProject.id);
    if (error) return setStatus(`Не удалось удалить фото: ${error.message}`, 'error');
    currentProject.images = images;
    renderExistingImages(currentProject);
    await fetchProjects();
    setStatus('Фото удалено из проекта.', 'success');
  }

  async function handleProjectAction(event) {
    const removeButton = event.target.closest('button[data-remove-photo]');
    if (removeButton) {
      await removePhoto(removeButton.dataset.removePhoto);
      return;
    }

    const button = event.target.closest('button[data-action]');
    if (!button || !supabaseClient) return;
    const project = projectsCache.find((item) => String(item.id) === String(button.dataset.id));
    if (!project) return;

    if (button.dataset.action === 'edit') return fillForm(project);

    if (button.dataset.action === 'toggle') {
      const { error } = await supabaseClient.from('projects').update({ is_published: !project.is_published, updated_at: new Date().toISOString() }).eq('id', project.id);
      if (error) return setStatus(`Не удалось изменить публикацию: ${error.message}`, 'error');
      await fetchProjects();
      return;
    }

    if (button.dataset.action === 'delete') {
      const confirmed = confirm(`Удалить проект «${project.title}»?`);
      if (!confirmed) return;
      const { error } = await supabaseClient.from('projects').delete().eq('id', project.id);
      if (error) return setStatus(`Не удалось удалить проект: ${error.message}`, 'error');
      await fetchProjects();
    }
  }

  if (projectForm) projectForm.addEventListener('submit', saveProject);
  if (projectList) projectList.addEventListener('click', handleProjectAction);
  if (existingImagesNode) existingImagesNode.addEventListener('click', handleProjectAction);
  if (resetButton) resetButton.addEventListener('click', resetForm);
  if (refreshButton) refreshButton.addEventListener('click', fetchProjects);

  function startProjects() {
    const isReady = initSupabase();
    if (isReady && !hasLoadedProjects) fetchProjects();
  }

  window.addEventListener('admin:authenticated', startProjects);
});
