document.addEventListener('DOMContentLoaded', () => {
  const statusNode = document.querySelector('#admin-status');
  const listNode = document.querySelector('#lead-list');
  const refreshButton = document.querySelector('#refresh-leads');
  let client = null;
  let leadsCache = [];
  let activeStatus = 'all';

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

  function statusLabel(status) {
    return { new: 'Новая', in_progress: 'В работе', done: 'Обработана', archived: 'Архив' }[status] || status || 'Новая';
  }

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
  }

  function renderLeads() {
    if (!listNode) return;
    const items = activeStatus === 'all' ? leadsCache : leadsCache.filter((lead) => lead.status === activeStatus);
    if (!items.length) {
      listNode.innerHTML = '<p>Заявок пока нет в выбранном статусе.</p>';
      return;
    }
    listNode.innerHTML = items.map((lead) => `
      <article class="content-admin-item lead-admin-item">
        <div class="project-admin-meta">
          <span>${escapeHtml(statusLabel(lead.status))}</span>
          <span>${escapeHtml(formatDate(lead.created_at))}</span>
          ${lead.work_format ? `<span>${escapeHtml(lead.work_format)}</span>` : ''}
          ${lead.object_type ? `<span>${escapeHtml(lead.object_type)}</span>` : ''}
        </div>
        <h3>${escapeHtml(lead.name || 'Без имени')}</h3>
        <p><b>Телефон:</b> ${escapeHtml(lead.phone || 'не указан')}</p>
        ${lead.email ? `<p><b>Email:</b> ${escapeHtml(lead.email)}</p>` : ''}
        ${lead.area_location_comment ? `<p><b>Комментарий:</b> ${escapeHtml(lead.area_location_comment)}</p>` : ''}
        ${lead.page_url ? `<p><b>Страница:</b> <a href="${escapeHtml(lead.page_url)}" target="_blank" rel="noreferrer">открыть</a></p>` : ''}
        ${lead.utm && Object.keys(lead.utm).length ? `<p><b>UTM:</b> <code>${escapeHtml(JSON.stringify(lead.utm))}</code></p>` : ''}
        <div class="project-admin-actions">
          <button type="button" data-lead-action="status" data-status="new" data-id="${lead.id}">Новая</button>
          <button type="button" data-lead-action="status" data-status="in_progress" data-id="${lead.id}">В работе</button>
          <button type="button" data-lead-action="status" data-status="done" data-id="${lead.id}">Обработана</button>
          <button type="button" class="danger" data-lead-action="status" data-status="archived" data-id="${lead.id}">Архив</button>
        </div>
      </article>
    `).join('');
  }

  async function fetchLeads() {
    if (!initClient()) return setStatus('Supabase ещё не подключён. Обновите страницу.', 'error');
    setStatus('Загружаем заявки...');
    const { data, error } = await client.from('leads').select('*').order('created_at', { ascending: false });
    if (error) return setStatus(`Не удалось загрузить заявки. Проверь таблицу leads. Ошибка: ${error.message}`, 'error');
    leadsCache = data || [];
    renderLeads();
    setStatus(`Заявки загружены. Всего: ${leadsCache.length}.`, 'success');
  }

  async function updateLeadStatus(id, nextStatus) {
    if (!initClient()) return;
    const { error } = await client.from('leads').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return setStatus(`Не удалось изменить статус: ${error.message}`, 'error');
    await fetchLeads();
  }

  listNode?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-lead-action="status"]');
    if (!button) return;
    updateLeadStatus(button.dataset.id, button.dataset.status);
  });

  document.querySelectorAll('[data-lead-status]').forEach((button) => {
    button.addEventListener('click', () => {
      activeStatus = button.dataset.leadStatus;
      document.querySelectorAll('[data-lead-status]').forEach((item) => item.classList.toggle('active', item === button));
      renderLeads();
    });
  });

  refreshButton?.addEventListener('click', fetchLeads);
  window.addEventListener('admin:authenticated', fetchLeads);
});
