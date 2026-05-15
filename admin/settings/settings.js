document.addEventListener('DOMContentLoaded', () => {
  const statusNode = document.querySelector('#admin-status');
  const listNode = document.querySelector('#settings-list');
  const refreshButton = document.querySelector('#refresh-settings');
  let client = null;
  let settingsCache = [];

  function setStatus(message, type = '') {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.className = `admin-status ${type}`.trim();
  }

  function initClient() {
    if (client) return true;
    const config = window.SUPABASE_CONFIG;
    if (!config || !window.supabase) return false;
    client = window.adminSupabaseClient || window.supabase.createClient(config.url, config.publishableKey);
    return true;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  function renderSettings() {
    if (!listNode) return;
    if (!settingsCache.length) {
      listNode.innerHTML = '<p>Настройки пока не созданы. Выполните SQL для таблицы site_settings.</p>';
      return;
    }
    listNode.innerHTML = settingsCache.map((item) => `
      <form class="content-admin-item setting-item" data-setting-id="${item.id}">
        <div class="project-admin-meta">
          <span>${escapeHtml(item.group_label || 'Общее')}</span>
          <span>${item.is_active ? 'Активно' : 'Выключено'}</span>
        </div>
        <h3>${escapeHtml(item.label)}</h3>
        <code>${escapeHtml(item.setting_key)}</code>
        <label class="setting-field">Значение
          <input name="value" value="${escapeHtml(item.value || '')}" placeholder="Введите значение">
        </label>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        <div class="project-admin-actions">
          <button type="submit">Сохранить</button>
          <button type="button" data-setting-action="toggle" data-id="${item.id}">${item.is_active ? 'Выключить' : 'Включить'}</button>
        </div>
      </form>
    `).join('');
  }

  async function fetchSettings() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем настройки сайта...');
    const { data, error } = await client.from('site_settings').select('*').order('sort_order', { ascending: true });
    if (error) return setStatus(`Не удалось загрузить настройки. Проверь таблицу site_settings. Ошибка: ${error.message}`, 'error');
    settingsCache = data || [];
    renderSettings();
    setStatus(`Настройки загружены. Полей: ${settingsCache.length}.`, 'success');
  }

  async function saveSetting(form) {
    if (!initClient()) return;
    const id = form.dataset.settingId;
    const value = new FormData(form).get('value');
    const { error } = await client.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return setStatus(`Не удалось сохранить настройку: ${error.message}`, 'error');
    setStatus('Настройка сохранена.', 'success');
    await fetchSettings();
  }

  async function toggleSetting(id) {
    const item = settingsCache.find((entry) => String(entry.id) === String(id));
    if (!item || !initClient()) return;
    const { error } = await client.from('site_settings').update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return setStatus(`Не удалось изменить активность: ${error.message}`, 'error');
    await fetchSettings();
  }

  listNode?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveSetting(event.target);
  });

  listNode?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-setting-action="toggle"]');
    if (!button) return;
    toggleSetting(button.dataset.id);
  });

  refreshButton?.addEventListener('click', fetchSettings);
  window.addEventListener('admin:authenticated', fetchSettings);
});
