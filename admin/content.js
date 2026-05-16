document.addEventListener('DOMContentLoaded', () => {
  const contentForm = document.querySelector('#content-form');
  const contentList = document.querySelector('#content-list');
  const refreshContentButton = document.querySelector('#refresh-content');
  const resetContentButton = document.querySelector('#reset-content-form');
  const contentFormTitle = document.querySelector('#content-form-title');
  const statusNode = document.querySelector('#admin-status');

  const editablePages = [
    { page: 'home', label: 'Главная', path: '/' },
    { page: 'projects', label: 'Проекты', path: '/projects/' },
    { page: 'renovation', label: 'Ремонт', path: '/services/remont-pod-klyuch/' },
    { page: 'construction', label: 'Строительство', path: '/services/stroitelstvo-pod-klyuch/' },
    { page: 'furnishing', label: 'Комплектация', path: '/services/komplektatsiya-obekta/' },
    { page: 'contacts', label: 'Контакты', path: '/contacts/' },
  ];

  let contentCache = [];
  let discoveredFields = [];
  let activePage = 'all';
  let client = null;

  const pageLabel = (page) => ({ home: 'Главная', projects: 'Проекты', renovation: 'Ремонт', construction: 'Строительство', furnishing: 'Комплектация', contacts: 'Контакты', global: 'Общее' }[page] || page);
  const setStatus = (message, type = '') => { if (statusNode) { statusNode.textContent = message; statusNode.className = `admin-status ${type}`.trim(); } };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  function initClient() {
    if (client) return true;
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return false;
    client = window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function guessFieldType(node, value) {
    const tag = node.tagName.toLowerCase();
    if (value.length > 80) return 'textarea';
    if (['p', 'h1', 'h2', 'h3', 'div'].includes(tag) && value.length > 45) return 'textarea';
    return 'text';
  }

  function makeLabel(pageInfo, key, node) {
    const readable = key
      .replace(`${pageInfo.page}.`, '')
      .replace(/hero/g, 'Hero')
      .replace(/projects/g, 'Проекты')
      .replace(/services/g, 'Услуги')
      .replace(/about/g, 'Подход')
      .replace(/form/g, 'Форма')
      .replace(/proof/g, 'Карточки')
      .replace(/intro/g, 'Сценарии')
      .replace(/item/g, 'пункт ')
      .replace(/card/g, 'карточка ')
      .replace(/title/g, 'заголовок')
      .replace(/text/g, 'текст')
      .replace(/lead/g, 'основной текст')
      .replace(/note/g, 'акцент')
      .replace(/kicker/g, 'надзаголовок')
      .replace(/button/g, 'кнопка')
      .replace(/details/g, 'подробности')
      .replace(/label/g, 'метка')
      .replace(/signature/g, 'подпись')
      .replace(/principle/g, 'принцип ')
      .replace(/\./g, ' / ');
    return `${pageInfo.label} / ${readable}`;
  }

  function dedupeFields(fields) {
    const map = new Map();
    fields.forEach((field) => { if (field.content_key && !map.has(field.content_key)) map.set(field.content_key, field); });
    return Array.from(map.values()).sort((a, b) => a.page === b.page ? a.sort_order - b.sort_order : a.page.localeCompare(b.page));
  }

  async function discoverEditableFields() {
    const parser = new DOMParser();
    const fields = [];
    await Promise.all(editablePages.map(async (pageInfo) => {
      try {
        const response = await fetch(`${pageInfo.path}?admin_content_scan=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const doc = parser.parseFromString(await response.text(), 'text/html');
        doc.querySelectorAll('[data-content-key]').forEach((node, index) => {
          const contentKey = node.dataset.contentKey;
          const value = normalizeText(node.textContent);
          if (!contentKey || !value) return;
          fields.push({
            page: contentKey.split('.')[0] || pageInfo.page,
            content_key: contentKey,
            label: makeLabel(pageInfo, contentKey, node),
            field_type: guessFieldType(node, value),
            value,
            sort_order: index * 10 + 10,
            is_active: true,
          });
        });
      } catch (error) {
        console.warn(`Content scan failed for ${pageInfo.path}:`, error);
      }
    }));
    discoveredFields = dedupeFields(fields);
  }

  function missingFields() {
    const existing = new Set(contentCache.map((item) => item.content_key));
    const missing = discoveredFields.filter((field) => !existing.has(field.content_key));
    return activePage === 'all' ? missing : missing.filter((field) => field.page === activePage);
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

  function renderMissingNotice() {
    const missing = missingFields();
    if (!missing.length) return '';
    const summary = Object.entries(missing.reduce((acc, field) => { acc[field.page] = (acc[field.page] || 0) + 1; return acc; }, {}))
      .map(([page, count]) => `${pageLabel(page)}: ${count}`)
      .join(' · ');
    return `<article class="content-admin-item"><div class="project-admin-meta"><span>Сверка сайта</span><span>Нужно добавить</span><span>${missing.length} полей</span></div><h3>Недостающие редактируемые поля</h3><p>Эти тексты есть на сайте и размечены как редактируемые, но ещё не добавлены в базу. После добавления они появятся в обычном списке.</p><p><b>${escapeHtml(summary)}</b></p><div class="project-admin-actions"><button type="button" data-content-action="seed-missing-fields">Добавить недостающие поля</button></div></article>`;
  }

  function renderContent() {
    if (!contentList) return;
    const items = activePage === 'all' ? contentCache : contentCache.filter((item) => item.page === activePage);
    const missingNotice = renderMissingNotice();
    if (!items.length && !missingNotice) {
      contentList.innerHTML = '<p>Текстов пока нет. Добавьте первое поле через форму слева.</p>';
      return;
    }
    contentList.innerHTML = `${missingNotice}${items.map((item) => `<article class="content-admin-item"><div class="project-admin-meta"><span>${escapeHtml(pageLabel(item.page))}</span><span>${escapeHtml(item.field_type || 'textarea')}</span><span>${item.is_active ? 'Активно' : 'Выключено'}</span></div><h3>${escapeHtml(item.label)}</h3><code>${escapeHtml(item.content_key)}</code><p>${escapeHtml(item.value)}</p><div class="project-admin-actions"><button type="button" data-content-action="edit" data-id="${item.id}">Редактировать</button><button type="button" data-content-action="toggle" data-id="${item.id}">${item.is_active ? 'Выключить' : 'Включить'}</button><button type="button" class="danger" data-content-action="delete" data-id="${item.id}">Удалить</button></div></article>`).join('')}`;
  }

  async function fetchContent() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Сверяем тексты сайта и админку...');
    await discoverEditableFields();
    const { data, error } = await client.from('site_content').select('*').order('page', { ascending: true }).order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить тексты: ${error.message}`, 'error');
    contentCache = data || [];
    renderContent();
    const missingCount = missingFields().length;
    setStatus(missingCount ? `Тексты загружены. Полей в базе: ${contentCache.length}. Недостающих полей: ${missingCount}.` : `Тексты загружены. Полей в базе: ${contentCache.length}. Все размеченные поля есть в админке.`, missingCount ? '' : 'success');
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
    const request = id ? client.from('site_content').update(payload).eq('id', id) : client.from('site_content').insert(payload);
    const { error } = await request;
    if (error) return setStatus(`Ошибка сохранения текста: ${error.message}`, 'error');
    resetContentForm();
    await fetchContent();
    setStatus('Текст сохранён.', 'success');
  }

  async function seedMissingFields() {
    if (!initClient()) return setStatus('Supabase не подключён.', 'error');
    const missing = missingFields();
    if (!missing.length) return setStatus('Недостающих полей нет.', 'success');
    const now = new Date().toISOString();
    const payload = missing.map((field) => ({ ...field, updated_at: now }));
    const { error } = await client.from('site_content').insert(payload);
    if (error) return setStatus(`Не удалось добавить поля: ${error.message}`, 'error');
    await fetchContent();
    setStatus(`Добавлены недостающие поля: ${missing.length}.`, 'success');
  }

  async function handleContentAction(event) {
    const button = event.target.closest('button[data-content-action]');
    if (!button || !initClient()) return;
    if (button.dataset.contentAction === 'seed-missing-fields') return seedMissingFields();
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