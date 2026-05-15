const { url, publishableKey, bucket } = window.SUPABASE_CONFIG;
const supabase = window.supabase.createClient(url, publishableKey);

const statusNode = document.querySelector('#admin-status');
const projectForm = document.querySelector('#project-form');
const projectList = document.querySelector('#project-list');
const resetButton = document.querySelector('#reset-project-form');
const refreshButton = document.querySelector('#refresh-projects');
const formTitle = document.querySelector('#project-form-title');
const settingsUrl = document.querySelector('#settings-url');
let projectsCache = [];

settingsUrl.textContent = url;

function setStatus(message, type = '') {
  statusNode.textContent = message;
  statusNode.className = `admin-status ${type}`.trim();
}

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

function setActiveView(view) {
  document.querySelectorAll('.admin-nav button').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  document.querySelectorAll('.admin-view').forEach((section) => section.classList.remove('active'));
  document.querySelector(`#view-${view}`).classList.add('active');
}

async function uploadImages(projectId, files) {
  const urls = [];
  for (const file of files) {
    const safeName = `${Date.now()}-${slugify(file.name) || 'image'}`;
    const path = `${projectId}/${safeName}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function fillForm(project) {
  formTitle.textContent = 'Редактировать проект';
  Object.entries(project).forEach(([key, value]) => {
    const field = projectForm.elements[key];
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else if (key !== 'images') field.value = value ?? '';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  formTitle.textContent = 'Добавить проект';
  projectForm.reset();
  projectForm.elements.id.value = '';
  projectForm.elements.sort_order.value = 100;
  projectForm.elements.is_published.checked = true;
}

async function fetchProjects() {
  setStatus('Загружаем проекты из Supabase...');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    setStatus(`Не удалось загрузить проекты. Проверь таблицу projects и политики доступа. Ошибка: ${error.message}`, 'error');
    projectList.innerHTML = '<p>Пока не удалось получить проекты из базы.</p>';
    return;
  }

  projectsCache = data || [];
  renderProjects();
  setStatus(`Подключение работает. Проектов в базе: ${projectsCache.length}.`, 'success');
}

function renderProjects() {
  if (!projectsCache.length) {
    projectList.innerHTML = '<p>Проектов пока нет. Добавьте первый проект через форму слева.</p>';
    return;
  }

  projectList.innerHTML = projectsCache.map((project) => `
    <article class="project-admin-item">
      <div class="project-admin-meta">
        <span>${getCategoryLabel(project.category)}</span>
        ${project.area ? `<span>${project.area}</span>` : ''}
        ${project.location ? `<span>${project.location}</span>` : ''}
        <span>${project.is_published ? 'Опубликован' : 'Черновик'}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.client_task || project.result || 'Описание пока не заполнено.'}</p>
      <div class="project-admin-actions">
        <button type="button" data-action="edit" data-id="${project.id}">Редактировать</button>
        <button type="button" data-action="toggle" data-id="${project.id}">${project.is_published ? 'Снять с публикации' : 'Опубликовать'}</button>
        <button type="button" class="danger" data-action="delete" data-id="${project.id}">Удалить</button>
      </div>
    </article>
  `).join('');
}

async function saveProject(event) {
  event.preventDefault();
  const formData = new FormData(projectForm);
  const id = formData.get('id');
  const files = Array.from(projectForm.elements.images.files || []);

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
    const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select().single();
    if (error) return setStatus(`Ошибка сохранения: ${error.message}`, 'error');
    saved = data;
  } else {
    const { data, error } = await supabase.from('projects').insert(payload).select().single();
    if (error) return setStatus(`Ошибка создания: ${error.message}`, 'error');
    saved = data;
  }

  if (files.length) {
    try {
      const newUrls = await uploadImages(saved.id, files);
      const currentImages = Array.isArray(saved.images) ? saved.images : [];
      const { error } = await supabase.from('projects').update({ images: [...currentImages, ...newUrls], updated_at: new Date().toISOString() }).eq('id', saved.id);
      if (error) throw error;
    } catch (error) {
      return setStatus(`Проект сохранён, но фото не загрузились: ${error.message}`, 'error');
    }
  }

  resetForm();
  await fetchProjects();
  setStatus('Проект сохранён.', 'success');
}

async function handleProjectAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const project = projectsCache.find((item) => String(item.id) === String(button.dataset.id));
  if (!project) return;

  if (button.dataset.action === 'edit') {
    fillForm(project);
    return;
  }

  if (button.dataset.action === 'toggle') {
    const { error } = await supabase.from('projects').update({ is_published: !project.is_published, updated_at: new Date().toISOString() }).eq('id', project.id);
    if (error) return setStatus(`Не удалось изменить публикацию: ${error.message}`, 'error');
    await fetchProjects();
    return;
  }

  if (button.dataset.action === 'delete') {
    const confirmed = confirm(`Удалить проект «${project.title}»?`);
    if (!confirmed) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) return setStatus(`Не удалось удалить проект: ${error.message}`, 'error');
    await fetchProjects();
  }
}

document.querySelectorAll('.admin-nav button').forEach((button) => button.addEventListener('click', () => setActiveView(button.dataset.view)));
projectForm.addEventListener('submit', saveProject);
projectList.addEventListener('click', handleProjectAction);
resetButton.addEventListener('click', resetForm);
refreshButton.addEventListener('click', fetchProjects);
fetchProjects();
