document.addEventListener('DOMContentLoaded', () => {
  const seoForm = document.querySelector('#seo-form');
  const seoList = document.querySelector('#seo-list');
  const refreshButton = document.querySelector('#refresh-seo');
  const resetButton = document.querySelector('#reset-seo-form');
  const formTitle = document.querySelector('#seo-form-title');
  const statusNode = document.querySelector('#admin-status');
  let client = null;
  let seoCache = [];

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
    client = window.adminSupabaseClient || window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function pageLabel(path) {
    const labels = {
      '/': 'Главная',
      '/projects/': 'Проекты',
      '/services/remont-pod-klyuch/': 'Ремонт',
      '/services/stroitelstvo-pod-klyuch/': 'Строительство',
      '/services/komplektatsiya-obekta/': 'Комплектация',
      '/contacts/': 'Контакты',
    };
    return labels[path] || path;
  }

  function resetForm() {
    if (!seoForm) return;
    seoForm.reset();
    seoForm.elements.id.value = '';
    seoForm.elements.is_indexed.checked = true;
    seoForm.elements.is_active.checked = true;
    formTitle.textContent = 'Настройки страницы';
  }

  function fillForm(item) {
    formTitle.textContent = `SEO: ${pageLabel(item.page_path)}`;
    Object.entries(item).forEach(([key, value]) => {
      const field = seoForm.elements[key];
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderList() {
    if (!seoList) return;
    if (!seoCache.length) {
      seoList.innerHTML = '<p>SEO-настроек пока нет. Выполните SQL или добавьте страницу вручную.</p>';
      return;
    }
    seoList.innerHTML = seoCache.map((item) => `
      <article class="content-admin-item">
        <div class="project-admin-meta">
          <span>${escapeHtml(pageLabel(item.page_path))}</span>
          <span>${item.is_indexed ? 'Индексируется' : 'Noindex'}</span>
          <span>${item.is_active ? 'Активно' : 'Выключено'}</span>
        </div>
        <h3>${escapeHtml(item.seo_title || item.h1 || pageLabel(item.page_path))}</h3>
        <code>${escapeHtml(item.page_path)}</code>
        <p>${escapeHtml(item.seo_description || 'Description не заполнен')}</p>
        <div class="project-admin-actions">
          <button type="button" data-seo-action="edit" data-id="${item.id}">Редактировать</button>
          <button type="button" data-seo-action="toggle" data-id="${item.id}">${item.is_active ? 'Выключить' : 'Включить'}</button>
        </div>
      </article>
    `).join('');
  }

  async function fetchSeo() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем SEO-настройки...');
    const { data, error } = await client.from('site_seo').select('*').order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить SEO. Проверь таблицу site_seo. Ошибка: ${error.message}`, 'error');
    seoCache = data || [];
    renderList();
    setStatus(`SEO-настройки загружены. Страниц: ${seoCache.length}.`, 'success');
  }

  async function saveSeo(event) {
    event.preventDefault();
    if (!initClient()) return setStatus('Supabase не подключён.', 'error');
    const formData = new FormData(seoForm);
    const id = formData.get('id');
    const payload = {
      page_path: formData.get('page_path'),
      seo_title: formData.get('seo_title') || null,
      seo_description: formData.get('seo_description') || null,
      h1: formData.get('h1') || null,
      canonical_url: formData.get('canonical_url') || null,
      og_title: formData.get('og_title') || null,
      og_description: formData.get('og_description') || null,
      og_image: formData.get('og_image') || null,
      is_indexed: formData.get('is_indexed') === 'on',
      is_active: formData.get('is_active') === 'on',
      updated_at: new Date().toISOString(),
    };
    setStatus('Сохраняем SEO...');
    const request = id
      ? client.from('site_seo').update(payload).eq('id', id)
      : client.from('site_seo').upsert(payload, { onConflict: 'page_path' });
    const { error } = await request;
    if (error) return setStatus(`Ошибка сохранения SEO: ${error.message}`, 'error');
    resetForm();
    await fetchSeo();
    setStatus('SEO сохранено.', 'success');
  }

  async function handleAction(event) {
    const button = event.target.closest('button[data-seo-action]');
    if (!button || !initClient()) return;
    const item = seoCache.find((entry) => String(entry.id) === String(button.dataset.id));
    if (!item) return;
    if (button.dataset.seoAction === 'edit') return fillForm(item);
    if (button.dataset.seoAction === 'toggle') {
      const { error } = await client.from('site_seo').update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', item.id);
      if (error) return setStatus(`Не удалось изменить активность SEO: ${error.message}`, 'error');
      return fetchSeo();
    }
  }

  if (seoForm) seoForm.addEventListener('submit', saveSeo);
  if (seoList) seoList.addEventListener('click', handleAction);
  if (refreshButton) refreshButton.addEventListener('click', fetchSeo);
  if (resetButton) resetButton.addEventListener('click', resetForm);
  document.querySelector('[data-view="seo"]')?.addEventListener('click', fetchSeo);
});
