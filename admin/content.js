document.addEventListener('DOMContentLoaded', () => {
  const contentForm = document.querySelector('#content-form');
  const contentList = document.querySelector('#content-list');
  const refreshContentButton = document.querySelector('#refresh-content');
  const resetContentButton = document.querySelector('#reset-content-form');
  const contentFormTitle = document.querySelector('#content-form-title');
  const statusNode = document.querySelector('#admin-status');
  let contentCache = [];
  let activePage = 'all';
  let client = null;

  function setStatus(message, type = '') {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = `admin-status ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function initClient() {
    if (client) return true;
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return false;
    client = window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function pageLabel(page) {
    const labels = { home: 'Главная', projects: 'Проекты', renovation: 'Ремонт', construction: 'Строительство', furnishing: 'Комплектация', contacts: 'Контакты', global: 'Общее' };
    return labels[page] || page;
  }

  function resetContentForm() {
    if (!contentForm) return;
    contentForm.reset();
    contentForm.elements.id.value = '';
    contentForm.elements.sort_order.value = 100;
    contentForm.elements.is_active.checked = true;
    contentFormTitle.textContent = 'Редактировать поле';
  }

  function fillContentForm(item) {
    contentFormTitle.textContent = 'Редактировать текст';
    Object.entries(item).forEach(([key, value]) => {
      const field = contentForm.elements[key];
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderContent() {
    if (!contentList) return;
    const items = activePage === 'all' ? contentCache : contentCache.filter((item) => item.page === activePage);
    if (!items.length) {
      contentList.innerHTML = '<p>Текстов пока нет. Добавьте первое поле через форму слева или выполните seed SQL.</p>';
      return;
    }
    contentList.innerHTML = items.map((item) => `
      <article class="content-admin-item">
        <div class="project-admin-meta">
          <span>${escapeHtml(pageLabel(item.page))}</span>
          <span>${escapeHtml(item.field_type || 'textarea')}</span>
          <span>${item.is_active ? 'Активно' : 'Выключено'}</span>
        </div>
        <h3>${escapeHtml(item.label)}</h3>
        <code>${escapeHtml(item.content_key)}</code>
        <p>${escapeHtml(item.value)}</p>
        <div class="project-admin-actions">
          <button type="button" data-content-action="edit" data-id="${item.id}">Редактировать</button>
          <button type="button" data-content-action="toggle" data-id="${item.id}">${item.is_active ? 'Выключить' : 'Включить'}</button>
          <button type="button" class="danger" data-content-action="delete" data-id="${item.id}">Удалить</button>
        </div>
      </article>
    `).join('');
  }

  async function fetchContent() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем тексты сайта...');
    const { data, error } = await client
      .from('site_content')
      .select('*')
      .order('page', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить тексты. Проверь таблицу site_content. Ошибка: ${error.message}`, 'error');
    contentCache = data || [];
    renderContent();
    setStatus(`Тексты загружены. Полей в базе: ${contentCache.length}.`, 'success');
  }

  async function saveContent(event) {
    event.preventDefault();
    if (!initClient()) return setStatus('Supabase не подключён.', 'error');
    const formData = new FormData(contentForm);
    const id = formData.get('id');
    const payload = {
      page: formData.get('page'),
      content_key: formData.get('content_key'),
      label: formData.get('label'),
      field_type: formData.get('field_type'),
      value: formData.get('value'),
      sort_order: Number(formData.get('sort_order') || 100),
      is_active: formData.get('is_active') === 'on',
      updated_at: new Date().toISOString(),
    };
    setStatus('Сохраняем текст...');
    const request = id
      ? client.from('site_content').update(payload).eq('id', id)
      : client.from('site_content').insert(payload);
    const { error } = await request;
    if (error) return setStatus(`Ошибка сохранения текста: ${error.message}`, 'error');
    resetContentForm();
    await fetchContent();
    setStatus('Текст сохранён.', 'success');
  }

  async function handleContentAction(event) {
    const button = event.target.closest('button[data-content-action]');
    if (!button || !initClient()) return;
    const item = contentCache.find((entry) => String(entry.id) === String(button.dataset.id));
    if (!item) return;
    if (button.dataset.contentAction === 'edit') return fillContentForm(item);
    if (button.dataset.contentAction === 'toggle') {
      const { error } = await client.from('site_content').update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', item.id);
      if (error) return setStatus(`Не удалось изменить активность: ${error.message}`, 'error');
      return fetchContent();
    }
    if (button.dataset.contentAction === 'delete') {
      if (!confirm(`Удалить текст «${item.label}»?`)) return;
      const { error } = await client.from('site_content').delete().eq('id', item.id);
      if (error) return setStatus(`Не удалось удалить текст: ${error.message}`, 'error');
      return fetchContent();
    }
  }

  document.querySelectorAll('[data-content-page]').forEach((button) => {
    button.addEventListener('click', () => {
      activePage = button.dataset.contentPage;
      document.querySelectorAll('[data-content-page]').forEach((item) => item.classList.toggle('active', item === button));
      renderContent();
    });
  });

  if (contentForm) contentForm.addEventListener('submit', saveContent);
  if (contentList) contentList.addEventListener('click', handleContentAction);
  if (refreshContentButton) refreshContentButton.addEventListener('click', fetchContent);
  if (resetContentButton) resetContentButton.addEventListener('click', resetContentForm);

  document.querySelector('[data-view="content"]')?.addEventListener('click', fetchContent);
});
